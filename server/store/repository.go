package store

import (
	"context"

	"github.com/ksankeerth/open-image-registry/types/models"
)

type RepositoryStore interface {
	Create(ctx context.Context, regId, nsId, name, description string, isPublic bool, createdBy string) (id string, err error)

	Get(ctx context.Context, id string) (*models.RepositoryModel, error)

	Delete(ctx context.Context, id string) (err error)

	Exists(ctx context.Context, id string) (bool, error)

	Update(ctx context.Context, id, description string) error

	GetID(ctx context.Context, namespaceId, name string) (id string, err error)

	SetState(ctx context.Context, id, newState string) error

	SetVisibility(ctx context.Context, id string, public bool) error

	SetStateByNamespaceID(ctx context.Context, namespaceId, state string) (count int64, err error)

	SetVisiblityByNamespaceID(ctx context.Context, namespaceId string, public bool) (count int64, err error)

	List(ctx context.Context, conditions *ListQueryConditions) (repositories []*models.RepositoryView,
		total int, err error)

	// identifier can be name or id
	ExistsByIdentifier(ctx context.Context, namesapceID, identifier string) (bool, error)

	// identifier can be name or id
	DeleteByIdentifier(ctx context.Context, namesapceID, identifier string) error

	// identifier can be name or id
	GetByIdentifier(ctx context.Context, namesapceID, identifier string) (*models.RepositoryModel, error)
}