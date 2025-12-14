# Access Control - Resource Package

This package provides **shared utilities** for access control across all resource types.

## Package Context

This package lives within `server/access`, which manages access control for all resources in Open Image Registry.
```
server/access/
├── resource/       ← This package (shared utilities)
├── namespace/      ← Namespace access handlers
├── repository/     ← Repository access handlers
├── upstream/       ← Upstream access handlers
└── access.go       ← Package aggregation
```

## Purpose

The `access` package manages who can access what resources. We control access to:

- **Namespaces** - Hosted registry namespaces
- **Repositories** - Hosted registry repositories
- **Upstream Registries** - Configured upstream registries

Each resource type has its own subpackage (`namespace/`, `repository/`, `upstream/`) with HTTP handlers for:
- Listing users with access
- Granting access
- Revoking access

However, all three subpackages share common operations:

1. **Loading** user-access lists from the store
2. **Validating** access levels and resource types
3. **Converting** models to DTOs
4. **Checking** permissions

**This package (`resource/`) extracts those common operations** to avoid code duplication.
