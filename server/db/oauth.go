package db

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ksankeerth/open-image-registry/errors/db"
	db_errors "github.com/ksankeerth/open-image-registry/errors/db"
	"github.com/ksankeerth/open-image-registry/utils"

	"github.com/ksankeerth/open-image-registry/log"
	"github.com/ksankeerth/open-image-registry/types/models"
)

type oauthDaoImpl struct {
	db *sql.DB
	*TransactionManager
}

func (o *oauthDaoImpl) PersistScope(scopeName, description string, txKey string) error {
	var res sql.Result
	var err error
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(PersistOauthScope, scopeName, description)
	} else {
		res, err = o.db.Exec(PersistOauthScope, scopeName, description)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when inserting scope: %s", scopeName)
		return db.ClassifyError(err, PersistOauthScope)
	}

	_, err = res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred whenr reading result of insert query: %s", PersistOauthScope)
		return db.ClassifyError(err, PersistOauthScope)
	}
	return nil
}

func (o *oauthDaoImpl) PersistScopeRoleBinding(scopeName, roleName string, txKey string) error {
	var res sql.Result
	var err error
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(PersistOauthScopeRoleBinding, scopeName, roleName)
	} else {
		res, err = o.db.Exec(PersistOauthScopeRoleBinding, scopeName, roleName)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when persisting scope role binding")
		return db.ClassifyError(err, PersistOauthScopeRoleBinding)
	}

	_, err = res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when reading result of insert query: %s", PersistOauthScopeRoleBinding)
		return db.ClassifyError(err, PersistOauthScopeRoleBinding)
	}

	return nil
}

func (o *oauthDaoImpl) GetAllScopeRoleBindings() ([]*models.ScopeRoleBinding, error) {
	rows, err := o.db.Query(GetAllScopeRoleBindings)
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when retriving scope role bindings")
		return nil, db_errors.ClassifyError(err, GetAllScopeRoleBindings)
	}

	bindings := make([]*models.ScopeRoleBinding, 0)
	for rows.Next() {
		var binding models.ScopeRoleBinding
		err = rows.Scan(&binding.ScopeName, &binding.RoleName)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Error occurred when reading the result of select query: %s", GetAllScopeRoleBindings)
			return nil, db.ClassifyError(err, GetAllScopeRoleBindings)
		}

		bindings = append(bindings, &binding)
	}

	return bindings, nil
}

func (o *oauthDaoImpl) PersistAuthSession(session *models.OAuthSession, txKey string) error {
	var res sql.Result
	var err error
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(PersistOauthSession, session.SessionId, session.UserId, session.ScopeHash,
			session.IssuedAt, session.ExpiresAt, session.UserAgent, session.ClientIp, session.GrantType)
	} else {
		res, err = o.db.Exec(PersistOauthSession, session.SessionId, session.UserId, session.ScopeHash,
			session.IssuedAt, session.ExpiresAt, session.UserAgent, session.ClientIp, session.GrantType)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when persisting session(%s)", session.SessionId)
		return db_errors.ClassifyError(err, PersistOauthSession)
	}

	_, err = res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when reading result of insert query: %s", PersistOauthSession)
		return db_errors.ClassifyError(err, PersistOauthSession)
	}

	return nil
}

func (o *oauthDaoImpl) GetAuthSession(scopeHash, userId string, txKey string) (*models.OAuthSession, error) {
	var authSession models.OAuthSession
	var err error
	var issuedAt string
	var expiresAt string
	var lastAccessedAt string

	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return nil, db.ErrTxAlreadyClosed
		}
		err = tx.QueryRow(GetOauthSessionByScopeHashAndUserId, scopeHash, userId).Scan(&authSession.SessionId,
			&issuedAt, &expiresAt, &authSession.UserAgent, &authSession.ClientIp, &authSession.GrantType, &lastAccessedAt)
	} else {
		err = o.db.QueryRow(GetOauthSessionByScopeHashAndUserId, scopeHash, userId).Scan(&authSession.SessionId,
			&issuedAt, &expiresAt, &authSession.UserAgent, &authSession.ClientIp, &authSession.GrantType, &lastAccessedAt)
	}
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when retriving auth session by scope hash(%s) and userId(%s)", scopeHash, userId)
		return nil, db.ClassifyError(err, GetOauthSessionByScopeHashAndUserId)
	}

	if issuedAt != "" {
		issuedTime, err := utils.ParseSqliteTimestamp(issuedAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Error occurred when parsing sqlite timestamp: %s", issuedAt)
			return nil, db.ClassifyError(err, GetOauthSessionByScopeHashAndUserId)
		}
		if issuedTime != nil {
			authSession.IssuedAt = *issuedTime
		}
	}

	// Parse ExpiresAt (optional)
	if expiresAt != "" {
		authSession.ExpiresAt, err = utils.ParseSqliteTimestamp(expiresAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Error occurred when parsing sqlite timestamp: %s", expiresAt)
			return nil, db.ClassifyError(err, GetOauthSessionByScopeHashAndUserId)
		}
	}

	// Parse LastAccessedAt (optional)
	if lastAccessedAt != "" {
		authSession.LastAccessedAt, err = utils.ParseSqliteTimestamp(lastAccessedAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Error occurred when parsing sqlite timestamp: %s", lastAccessedAt)
			return nil, db.ClassifyError(err, GetOauthSessionByScopeHashAndUserId)
		}
	}

	return &authSession, nil
}

func (o *oauthDaoImpl) PersistAuthSessionScopeBinding(scopes []string, sessionId string, txKey string) error {
	var err error
	var stmt *sql.Stmt
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		stmt, err = tx.Prepare(PersistOauthSessionScope)
	} else {
		stmt, err = o.db.Prepare(PersistOauthSessionScope)
	}
	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occured when preparing statement : %s", PersistOauthSessionScope)
		return db_errors.ClassifyError(err, PersistOauthSessionScope)
	}
	defer stmt.Close()

	for _, scope := range scopes {
		_, err := stmt.Exec(scope, scope)
		if err != nil {
			log.Logger().Error().Err(err).Msg("Error occurred when persisting scope session mapping")
			return db.ClassifyError(err, PersistOauthSession)
		}
	}

	return nil
}

func (o *oauthDaoImpl) RemoveAuthSession(sessionId string, txKey string) error {
	var res sql.Result
	var err error
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(RemoveOauthSession, sessionId)
	} else {
		res, err = o.db.Exec(RemoveOauthSession, sessionId)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when removing session: %s", sessionId)
		return db_errors.ClassifyError(err, RemoveOauthSession)
	}

	_, err = res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when reading result of delete query")
		return db.ClassifyError(err, RemoveOauthSession)
	}

	return nil
}

func (o *oauthDaoImpl) UpdateSessionLastAccess(sesssionId string, lastAccessed time.Time,
	txKey string) error {

	var res sql.Result
	var err error
	if txKey != "" {
		tx := o.getTx(txKey)
		if tx == nil {
			return db.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(UpdateSessionLastAccess, lastAccessed, sesssionId)
	} else {
		res, err = o.db.Exec(UpdateSessionLastAccess, lastAccessed, sesssionId)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when updating session last accessed time: %s", sesssionId)
		return db_errors.ClassifyError(err, UpdateSessionLastAccess)
	}
	_, err = res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when reading result of update query")
		return db_errors.ClassifyError(err, UpdateSessionLastAccess)
	}
	return nil
}