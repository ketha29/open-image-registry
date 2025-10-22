package auth

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/ksankeerth/open-image-registry/db"
	"github.com/ksankeerth/open-image-registry/errors/httperrors"
	"github.com/ksankeerth/open-image-registry/log"
	"github.com/ksankeerth/open-image-registry/types/api/v1alpha/mgmt"
	"github.com/ksankeerth/open-image-registry/user"
)

type AuthAPIHandler struct {
	svc         *authService
	userAdapter *user.UserAdapter
}

// NewAuthAPIHandler creates a new auth API handler
func NewAuthAPIHandler(userDao db.UserDAO, accessDao db.ResourceAccessDAO, oauthDao db.OAuthDAO) *AuthAPIHandler {
	return &AuthAPIHandler{
		svc: &authService{
			userDao:      userDao,
			accessDao:    accessDao,
			oauthDao:     oauthDao,
			scopeRoleMap: map[string][]string{},
		},
	}
}

// Login handles POST /api/v1/auth/login
func (h *AuthAPIHandler) Login(w http.ResponseWriter, r *http.Request) {
	var loginRequest mgmt.AuthLoginRequest

	err := json.NewDecoder(r.Body).Decode(&loginRequest)
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when parsing login request")
		httperrors.BadRequest(w, 400, "Invalid request body")
		return
	}

	userAgent := r.Header.Get("User-Agent")
	xForwardedFor := r.Header.Get("X-Forwarded-For") // client_ip, lb1_ip, ........
	var clientIp string
	ips := strings.Split(xForwardedFor, ",")
	if len(ips) > 0 {
		clientIp = ips[0]
	} else {
		clientIp = xForwardedFor
	}

	userAccount, namespaces, repositories, loginResult := h.svc.authenticateUser(&loginRequest, userAgent, clientIp)

	authLoginResponse := mgmt.AuthLoginResponse{
		Success:          loginResult.success,
		ErrorMessage:     loginResult.errorMessage,
		SessionId:        loginResult.sessionId,
		AuthorizedScopes: loginResult.authorizedScopes,
		ExpiresAt:        *loginResult.expiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	if !loginResult.success {
		w.WriteHeader(loginResult.statusCode)
	} else {
		h.setAuthCookie(w, loginResult.sessionId, 900)
		w.WriteHeader(http.StatusOK)
	}
	if userAccount != nil {
		authLoginResponse.User = mgmt.UserProfileInfo{
			UserId:       userAccount.Id,
			Username:     userAccount.Username,
			Role:         loginResult.userRole,
			Namespaces:   h.userAdapter.ToNamespaceAccessSlice(namespaces),
			Repositories: h.userAdapter.ToRepositoryAccessSlice(repositories),
		}
	}
	err = json.NewEncoder(w).Encode(authLoginResponse)
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when writing json response to login request")
	}
}

func (h *AuthAPIHandler) Routes() chi.Router {
	router := chi.NewRouter()
	router.Route("/", func(r chi.Router) {
		r.Post("/login", h.Login)
	})
	return router
}

// writeJSON writes JSON response
func (h *AuthAPIHandler) writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func (h *AuthAPIHandler) setAuthCookie(w http.ResponseWriter, session_id string, maxAge int) {
	cookie := &http.Cookie{
		Name:     "auth_session",
		Value:    session_id,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteNoneMode,
	}
	http.SetCookie(w, cookie)
}