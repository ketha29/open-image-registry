package auth

import (
	"fmt"
	"net/http"
	"slices"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ksankeerth/open-image-registry/db"
	"github.com/ksankeerth/open-image-registry/log"
	"github.com/ksankeerth/open-image-registry/security"
	"github.com/ksankeerth/open-image-registry/types/api/v1alpha/mgmt"
	"github.com/ksankeerth/open-image-registry/types/models"
	"github.com/ksankeerth/open-image-registry/user"
	"github.com/ksankeerth/open-image-registry/utils"
)

type authService struct {
	userDao        db.UserDAO
	accessDao      db.ResourceAccessDAO
	oauthDao       db.OAuthDAO
	scopeRoleMap   map[string][]string
	scopeRoleMapMu sync.Mutex
}

func (svc *authService) loadScopesFromDB() error {
	svc.scopeRoleMapMu.Lock()
	defer svc.scopeRoleMapMu.Unlock()

	scopeBindings, err := svc.oauthDao.GetAllScopeRoleBindings()
	if err != nil {
		return err
	}

	for _, binding := range scopeBindings {
		roles, ok := svc.scopeRoleMap[binding.ScopeName]
		if ok {
			if !slices.Contains(roles, binding.RoleName) {
				roles = append(roles, binding.RoleName)
				svc.scopeRoleMap[binding.ScopeName] = roles
			}
		} else {
			svc.scopeRoleMap[binding.ScopeName] = []string{binding.RoleName}
		}
	}
	return nil
}

func (svc *authService) canAccessScope(scopeName, roleName string) bool {
	roles, ok := svc.scopeRoleMap[scopeName]
	if !ok {
		err := svc.loadScopesFromDB()
		if err != nil {
			log.Logger().Error().Err(err).Msg("Error occurred when loading scope role bindings from database")
			return false
		}
	}
	roles = svc.scopeRoleMap[scopeName]
	if roles == nil || len(roles) == 0 {
		return false
	}

	return slices.Contains(roles, roleName)
}

func (svc *authService) getAuthorizedScopes(requestedScopes []string, roleName string) []string {
	if requestedScopes == nil {
		return []string{}
	}

	authorizedScopes := make([]string, 0)
	for _, scope := range requestedScopes {
		if svc.canAccessScope(scope, roleName) {
			authorizedScopes = append(authorizedScopes, scope)
		}
	}

	return authorizedScopes
}

type authLoginResult struct {
	statusCode       int
	success          bool
	errorMessage     string
	sessionId        string
	expiresAt        *time.Time
	userRole         string
	authorizedScopes []string
}

func (svc *authService) authenticateUser(loginRequest *mgmt.AuthLoginRequest, userAgent, clientIp string) (*models.UserAccount,
	[]*models.NamespaceAccess, []*models.RepositoryAccess, *authLoginResult) {
	txKey := fmt.Sprintf("login-%s-%s", loginRequest.Username, userAgent)

	loginRes := &authLoginResult{}

	err := svc.userDao.Begin(txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	defer func() {
		if err != nil {
			svc.userDao.Rollback(txKey)
		} else {
			svc.userDao.Commit(txKey)
		}
	}()

	userAccount, err := svc.userDao.GetUserAccount(loginRequest.Username, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	if userAccount == nil {
		loginRes.success = false
		loginRes.errorMessage = "No user account found!"
		loginRes.statusCode = http.StatusForbidden

		return nil, nil, nil, loginRes
	}

	if userAccount.Locked {
		loginRes.success = false
		loginRes.errorMessage = "User account has been locked! Contact system administrator."
		loginRes.statusCode = http.StatusForbidden

		return nil, nil, nil, loginRes
	}

	currentPw, currentSalt, err := svc.userDao.GetUserPasswordAndSaltById(userAccount.Id, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	matched := security.ComparePasswordAndHash(loginRequest.Password, currentSalt, currentPw)
	if !matched {
		err = svc.userDao.RecordFailedAttempt(loginRequest.Username, txKey)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, nil, nil, loginRes
		}
		if (userAccount.FailedAttempts + 1) > MaxFailedLoginAttempts {
			_, err := svc.userDao.LockUserAccount(loginRequest.Username, user.ReasonLockedFailedLoginAttempts, txKey)
			if err != nil {
				loginRes.success = false
				loginRes.errorMessage = "Opps! Error occured when logging in!"
				loginRes.statusCode = http.StatusInternalServerError

				return nil, nil, nil, loginRes
			}

			loginRes.success = false
			loginRes.errorMessage = "User account has been locked! Contact system administrator."
			loginRes.statusCode = http.StatusForbidden

			return nil, nil, nil, loginRes
		}

		loginRes.success = false
		loginRes.errorMessage = "Invalid username or password!"
		loginRes.statusCode = http.StatusForbidden

		return nil, nil, nil, loginRes
	}
	_, err = svc.userDao.UnlockUserAccount(loginRequest.Username, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	roleName, err := svc.userDao.GetUserRole(userAccount.Id, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	authorizedScopes := svc.getAuthorizedScopes(loginRequest.Scopes, roleName)
	if len(authorizedScopes) == 0 && len(loginRequest.Scopes) != 0 {
		loginRes.success = false
		loginRes.errorMessage = "User is not authorized to access!"
		loginRes.statusCode = http.StatusForbidden

		return nil, nil, nil, loginRes
	}

	slices.Sort(authorizedScopes) // sorting scopes to avoid scope hash mismatch
	scopeHash := utils.CombineAndCalculateSHA256Digest(authorizedScopes...)

	authSession, err := svc.oauthDao.GetAuthSession(scopeHash, userAccount.Id, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	var issueNewSession bool

	var sessionId string
	if authSession != nil {
		if time.Now().Add(time.Second * 5).Before(*authSession.ExpiresAt) {
			sessionId = authSession.SessionId
		} else {
			// remove existing session
			err = svc.oauthDao.RemoveAuthSession(authSession.SessionId, txKey)
			if err != nil {
				loginRes.success = false
				loginRes.errorMessage = "Opps! Error occured when logging in!"
				loginRes.statusCode = http.StatusInternalServerError

				return nil, nil, nil, loginRes
			}
			issueNewSession = true
		}
	} else {
		issueNewSession = true
	}

	if issueNewSession {

		sessionId = uuid.New().String()
		sessionIssuedAt := time.Now()
		expiredAt := sessionIssuedAt.Add(time.Second * SessionExpiryInSeconds)

		authSession = &models.OAuthSession{
			SessionId: sessionId,
			UserId:    userAccount.Id,
			ScopeHash: scopeHash,
			IssuedAt:  sessionIssuedAt,
			ExpiresAt: &expiredAt,
			UserAgent: userAgent,
			ClientIp:  clientIp,
			GrantType: "password",
		}

		err = svc.oauthDao.PersistAuthSession(authSession, txKey)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, nil, nil, loginRes
		}

		err = svc.oauthDao.PersistAuthSessionScopeBinding(authorizedScopes, authSession.SessionId, txKey)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, nil, nil, loginRes
		}
	}

	namespaces, err := svc.accessDao.GetUserNamespaceAccess(userAccount.Id, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	repositories, err := svc.accessDao.GetUserRepositoryAccess(userAccount.Id, txKey)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, nil, nil, loginRes
	}

	loginRes.success = true
	loginRes.authorizedScopes = authorizedScopes
	loginRes.userRole = roleName
	loginRes.sessionId = authSession.SessionId
	loginRes.expiresAt = authSession.ExpiresAt

	return userAccount, namespaces, repositories, loginRes
}