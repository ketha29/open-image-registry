package lib

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/ksankeerth/open-image-registry/types/query"
)

func ParseListConditions(r *http.Request) *query.ListModelsConditions {
	cond := &query.ListModelsConditions{
		Filters: []query.FilterCondition{},
		Pagination: query.Pagination{
			Page:  1,
			Limit: 20,
		},
		Sort: &query.SortCondition{
			Order: query.SortAsc,
		},
		SearchTerm: "",
	}

	// Parse pagination
	if page := r.URL.Query().Get("page"); page != "" {
		if p, err := strconv.ParseUint(page, 10, 64); err == nil && p > 0 {
			cond.Pagination.Page = uint(p)
		}
	}

	if limit := r.URL.Query().Get("limit"); limit != "" {
		if l, err := strconv.ParseUint(limit, 10, 64); err == nil && l > 0 {
			cond.Pagination.Limit = uint(l)
		}
	}

	// Parse search term
	cond.SearchTerm = strings.TrimSpace(r.URL.Query().Get("search"))

	// Parse sort
	if sortBy := r.URL.Query().Get("sort_by"); sortBy != "" {
		cond.Sort.Field = strings.ToLower(strings.TrimSpace(sortBy))
	}

	if order := r.URL.Query().Get("order"); order != "" {
		order = strings.ToLower(strings.TrimSpace(order))
		if order == "desc" {
			cond.Sort.Order = query.SortDesc
		} else {
			cond.Sort.Order = query.SortAsc
		}
	}

	// Parse filters - handle repeated keys and boolean values
	for key := range r.URL.Query() {
		// Skip reserved keys
		if isReservedKey(key) {
			continue
		}

		values := r.URL.Query()[key]
		if len(values) == 0 {
			continue
		}

		// Convert string values to appropriate types
		filterValues := make([]any, 0, len(values))
		for _, v := range values {
			v = strings.TrimSpace(v)
			if v == "" {
				continue
			}
			// We'll have the values as string; DAO layer can converts if necessary
			filterValues = append(filterValues, v)
		}
		if len(filterValues) > 0 {
			cond.Filters = append(cond.Filters, query.FilterCondition{
				Field:  key,
				Values: filterValues,
			})
		}
	}

	return cond
}

// isReservedKey checks if a query parameter is a reserved key (not a filter)
func isReservedKey(key string) bool {
	reserved := map[string]bool{
		"page":    true,
		"limit":   true,
		"search":  true,
		"sort_by": true,
		"order":   true,
	}
	return reserved[key]
}