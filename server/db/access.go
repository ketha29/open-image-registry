package db

import (
	"database/sql"

	db_errors "github.com/ksankeerth/open-image-registry/errors/db"
	"github.com/ksankeerth/open-image-registry/log"
	"github.com/ksankeerth/open-image-registry/types/models"
	"github.com/ksankeerth/open-image-registry/utils"
)

type accessDaoImpl struct {
	db *sql.DB
	*TransactionManager
}

func (ad *accessDaoImpl) GrantAccess(resourceType, resourceId, userId, accessLevel, grantedBy string,
	txKey string) (granted bool, err error) {
	var res sql.Result
	if txKey != "" {
		tx := ad.getTx(txKey)
		if tx == nil {
			log.Logger().Error().Msgf("Transaction for %s already closed.", txKey)
			return false, db_errors.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(GrantResourceAccess, resourceId, userId, accessLevel, resourceType, grantedBy)
	} else {
		res, err = ad.db.Exec(GrantResourceAccess, resourceId, userId, accessLevel, resourceType, grantedBy)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when granting access: (user %s, resource: %s)", userId, resourceId)
		return false, db_errors.ClassifyError(err, GrantResourceAccess)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when reading result of insert query")
		return false, db_errors.ClassifyError(err, GrantResourceAccess)
	}

	if rows == 1 {
		return true, nil
	}
	return false, nil
}

func (ad *accessDaoImpl) RevokeAccess(resourceId, userId, resourceType string, txKey string) (revoked bool, err error) {
	var res sql.Result
	if txKey != "" {
		tx := ad.getTx(txKey)
		if tx == nil {
			log.Logger().Error().Msgf("Transaction for %s already closed.", txKey)
			return false, db_errors.ErrTxAlreadyClosed
		}
		res, err = tx.Exec(RevokeResourceAccess, resourceId, userId, resourceType)
	} else {
		res, err = ad.db.Exec(RevokeResourceAccess, resourceId, userId, resourceType)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when revoking resource access: user(%s), resource(%s)", userId, resourceId)
		return false, db_errors.ClassifyError(err, RevokeResourceAccess)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		log.Logger().Error().Err(err).Msg("Error occurred when reading result of delete query")
		return false, db_errors.ClassifyError(err, RevokeResourceAccess)
	}

	if rows == 1 {
		return true, nil
	}
	return false, nil
}

func (ad *accessDaoImpl) GetUserAccess(resourceType, userId string, txKey string) ([]*models.ResourceAccess, error) {
	var rows *sql.Rows
	var err error
	if txKey != "" {
		tx := ad.getTx(txKey)
		if tx == nil {
			log.Logger().Error().Msgf("Transaction for %s already closed.", txKey)
			return nil, db_errors.ErrTxAlreadyClosed
		}
		rows, err = tx.Query(GetUserResourceAccess, userId, resourceType)
	} else {
		rows, err = ad.db.Query(GetUserResourceAccess, userId, resourceType)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when retriving resource access: user(%s), resourceType(%s)", userId, resourceType)
		return nil, db_errors.ClassifyError(err, GetUserResourceAccess)
	}

	accessList := make([]*models.ResourceAccess, 0)

	for rows.Next() {
		var resourceAccess models.ResourceAccess
		var createdAt string
		var updatedAt string
		err = rows.Scan(&resourceAccess.Id, &resourceAccess.ResourceType, &resourceAccess.ResourceId,
			&resourceAccess.UserId, &resourceAccess.AccessLevel, &resourceAccess.GrantedBy, &createdAt, &updatedAt)
		if err != nil {
			return nil, db_errors.ClassifyError(err, GetUserResourceAccess)
		}

		createdTime, err := utils.ParseSqliteTimestamp(createdAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", createdAt)
		}
		if createdTime != nil {
			resourceAccess.CreatedAt = *createdTime
		}

		resourceAccess.UpdatedAt, err = utils.ParseSqliteTimestamp(updatedAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", updatedAt)
		}

		accessList = append(accessList, &resourceAccess)
	}

	return accessList, nil
}

func (ad *accessDaoImpl) GetUserNamespaceAccess(userId string, txKey string) ([]*models.NamespaceAccess, error) {
	var rows *sql.Rows
	var err error
	if txKey != "" {
		tx := ad.getTx(txKey)
		if tx == nil {
			log.Logger().Error().Msgf("Transaction for %s already closed.", txKey)
			return nil, db_errors.ErrTxAlreadyClosed
		}
		rows, err = tx.Query(GetNamespaceAccessByUserId, userId)
	} else {
		rows, err = ad.db.Query(GetNamespaceAccessByUserId, userId)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when retriving namespace access: user(%s)", userId)
		return nil, db_errors.ClassifyError(err, GetNamespaceAccessByUserId)
	}

	accessList := make([]*models.NamespaceAccess, 0)

	for rows.Next() {
		var access models.NamespaceAccess
		var createdAt string
		var updatedAt string
		err = rows.Scan(&access.ID, &access.Namespace, &access.ResourceID, &access.UserID, &access.AccessLevel,
			&access.GrantedBy, &createdAt, &updatedAt)
		if err != nil {
			return nil, db_errors.ClassifyError(err, GetNamespaceAccessByUserId)
		}

		createdTime, err := utils.ParseSqliteTimestamp(createdAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", createdAt)
		}
		if createdTime != nil {
			access.CreatedAt = *createdTime
		}

		access.UpdatedAt, err = utils.ParseSqliteTimestamp(updatedAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", updatedAt)
		}

		accessList = append(accessList, &access)
	}

	return accessList, nil
}

func (ad *accessDaoImpl) GetUserRepositoryAccess(userId string, txKey string) ([]*models.RepositoryAccess, error) {
	var rows *sql.Rows
	var err error
	if txKey != "" {
		tx := ad.getTx(txKey)
		if tx == nil {
			log.Logger().Error().Msgf("Transaction for %s already closed.", txKey)
			return nil, db_errors.ErrTxAlreadyClosed
		}
		rows, err = tx.Query(GetRepositoryAccessByUserId, userId)
	} else {
		rows, err = ad.db.Query(GetRepositoryAccessByUserId, userId)
	}

	if err != nil {
		log.Logger().Error().Err(err).Msgf("Error occurred when retriving repository access: user(%s)", userId)
		return nil, db_errors.ClassifyError(err, GetRepositoryAccessByUserId)
	}

	accessList := make([]*models.RepositoryAccess, 0)

	for rows.Next() {
		var access models.RepositoryAccess
		var createdAt string
		var updatedAt string
		err = rows.Scan(&access.ID, &access.Namespace, &access.Repository, &access.ResourceID, &access.UserID,
			&access.AccessLevel, &access.GrantedBy, &createdAt, &updatedAt)
		if err != nil {
			return nil, db_errors.ClassifyError(err, GetRepositoryAccessByUserId)
		}

		createdTime, err := utils.ParseSqliteTimestamp(createdAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", createdAt)
		}

		if createdTime != nil {
			access.CreatedAt = *createdTime
		}

		access.UpdatedAt, err = utils.ParseSqliteTimestamp(updatedAt)
		if err != nil {
			log.Logger().Error().Err(err).Msgf("Parsing sqlite timestamp failed: %s", updatedAt)
		}

		accessList = append(accessList, &access)
	}

	return accessList, nil
}
