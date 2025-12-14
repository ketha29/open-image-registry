package auth

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ksankeerth/open-image-registry/constants"
	"github.com/ksankeerth/open-image-registry/log"
	"github.com/ksankeerth/open-image-registry/security"
	"github.com/ksankeerth/open-image-registry/store"
	"github.com/ksankeerth/open-image-registry/types/api/v1alpha/mgmt"
	"github.com/ksankeerth/open-image-registry/types/models"
)

type authService struct {
	store          store.Store
	scopeRoleMap   map[string][]string
	scopeRoleMapMu sync.Mutex
}

// currently, no use of scope role binding. So i comment it, later we can
// think about it.
// func (svc *authService) loadScopesFromDB() error {
// 	svc.scopeRoleMapMu.Lock()
// 	defer svc.scopeRoleMapMu.Unlock()

// 	scopeBindings, err := svc.store.Auth().GetAllScopeRoleBindings(context.Background())
// 	if err != nil {
// 		return err
// 	}

// 	for _, binding := range scopeBindings {
// 		roles, ok := svc.scopeRoleMap[binding.ScopeName]
// 		if ok {
// 			if !slices.Contains(roles, binding.RoleName) {
// 				roles = append(roles, binding.RoleName)
// 				svc.scopeRoleMap[binding.ScopeName] = roles
// 			}
// 		} else {
// 			svc.scopeRoleMap[binding.ScopeName] = []string{binding.RoleName}
// 		}
// 	}
// 	return nil
// }

// func (svc *authService) canAccessScope(scopeName, roleName string) bool {
// 	roles, ok := svc.scopeRoleMap[scopeName]
// 	if !ok {
// 		err := svc.loadScopesFromDB()
// 		if err != nil {
// 			log.Logger().Error().Err(err).Msg("Error occurred when loading scope role bindings from database")
// 			return false
// 		}
// 	}
// 	roles = svc.scopeRoleMap[scopeName]
// 	if roles == nil || len(roles) == 0 {
// 		return false
// 	}

// 	return slices.Contains(roles, roleName)
// }

// func (svc *authService) getAuthorizedScopes(requestedScopes []string, roleName string) []string {
// 	if requestedScopes == nil {
// 		return []string{}
// 	}

// 	authorizedScopes := make([]string, 0)
// 	for _, scope := range requestedScopes {
// 		if svc.canAccessScope(scope, roleName) {
// 			authorizedScopes = append(authorizedScopes, scope)
// 		}
// 	}

// 	return authorizedScopes
// }

type authLoginResult struct {
	statusCode       int
	success          bool
	errorMessage     string
	sessionId        string
	expiresAt        *time.Time
	userRole         string
	authorizedScopes []string
}

func (svc *authService) authenticateUser(loginRequest *mgmt.AuthLoginRequest, userAgent, clientIp string) (*models.UserAccount, *authLoginResult) {

	loginRes := &authLoginResult{}

	ctx := context.Background()
	tx, err := svc.store.Begin(ctx)
	if err != nil {
		log.Logger().Error().Err(err).Msg("error occurred when starting transaction")

		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError
		return nil, loginRes
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	ctx = store.WithTxContext(ctx, tx)

	userAccount, err := svc.store.Users().GetByUsername(ctx, loginRequest.Username)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, loginRes
	}

	if userAccount == nil {
		loginRes.success = false
		loginRes.errorMessage = "No user account found!"
		loginRes.statusCode = http.StatusForbidden

		return nil, loginRes
	}

	if userAccount.Locked {
		loginRes.success = false
		loginRes.errorMessage = "User account has been locked! Contact system administrator."
		loginRes.statusCode = http.StatusForbidden

		return nil, loginRes
	}

	currentPw, currentSalt, err := svc.store.Users().GetPasswordAndSalt(ctx, userAccount.Id)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, loginRes
	}

	matched := security.ComparePasswordAndHash(loginRequest.Password, currentSalt, currentPw)
	if !matched {
		err = svc.store.Users().RecordFailedAttempt(ctx, loginRequest.Username)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, loginRes
		}
		if (userAccount.FailedAttempts + 1) > MaxFailedLoginAttempts {
			err = svc.store.Users().LockAccount(ctx, loginRequest.Username, constants.ReasonLockedFailedLoginAttempts)
			if err != nil {
				loginRes.success = false
				loginRes.errorMessage = "Opps! Error occured when logging in!"
				loginRes.statusCode = http.StatusInternalServerError

				return nil, loginRes
			}

			loginRes.success = false
			loginRes.errorMessage = "User account has been locked! Contact system administrator."
			loginRes.statusCode = http.StatusForbidden

			return nil, loginRes
		}

		loginRes.success = false
		loginRes.errorMessage = "Invalid username or password!"
		loginRes.statusCode = http.StatusForbidden

		return nil, loginRes
	}
	err = svc.store.Users().UnlockAccount(ctx, loginRequest.Username)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, loginRes
	}

	roleName, err := svc.store.Users().GetRole(ctx, userAccount.Id)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, loginRes
	}

	//TODO: We comment scopes check during authentication as there are no use now
	// authorizedScopes := svc.getAuthorizedScopes(loginRequest.Scopes, roleName)
	// if len(authorizedScopes) == 0 && len(loginRequest.Scopes) != 0 {
	// 	loginRes.success = false
	// 	loginRes.errorMessage = "User is not authorized to access!"
	// 	loginRes.statusCode = http.StatusForbidden

	// 	return nil, loginRes
	// }

	// slices.Sort(authorizedScopes) // sorting scopes to avoid scope hash mismatch
	// scopeHash := utils.CombineAndCalculateSHA256Digest(authorizedScopes...)

	authSession, err := svc.store.Auth().GetAuthSession(ctx, "not-used", userAccount.Id)
	if err != nil {
		loginRes.success = false
		loginRes.errorMessage = "Opps! Error occured when logging in!"
		loginRes.statusCode = http.StatusInternalServerError

		return nil, loginRes
	}

	var issueNewSession bool

	var sessionId string
	if authSession != nil {
		if time.Now().Add(time.Second * 5).Before(*authSession.ExpiresAt) {
			sessionId = authSession.ID
		} else {

			// remove existing session
			err = svc.store.Auth().RemoveAuthSession(ctx, authSession.ID)
			if err != nil {
				loginRes.success = false
				loginRes.errorMessage = "Opps! Error occured when logging in!"
				loginRes.statusCode = http.StatusInternalServerError

				return nil, loginRes
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
			ID:        sessionId,
			UserID:    userAccount.Id,
			ScopeHash: "not set",
			IssuedAt:  sessionIssuedAt,
			ExpiresAt: &expiredAt,
			UserAgent: userAgent,
			ClientIP:  clientIp,
			GrantType: "password",
		}

		err = svc.store.Auth().PersistAuthSession(ctx, authSession)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, loginRes
		}

		err = svc.store.Auth().PersistAuthSessionScopeBinding(ctx, []string{}, authSession.ID)
		if err != nil {
			loginRes.success = false
			loginRes.errorMessage = "Opps! Error occured when logging in!"
			loginRes.statusCode = http.StatusInternalServerError

			return nil, loginRes
		}
	}

	loginRes.success = true
	loginRes.authorizedScopes = []string{}
	loginRes.userRole = roleName
	loginRes.sessionId = authSession.ID
	loginRes.expiresAt = authSession.ExpiresAt

	return userAccount, loginRes
}
