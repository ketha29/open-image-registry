package lib

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/ksankeerth/open-image-registry/store"
)

func ParseListConditions(r *http.Request, filterOps map[string]store.FilterOperator) *store.ListQueryConditions {
	cond := &store.ListQueryConditions{
		Filters:    []store.Filter{},
		Page:       1,
		Limit:      20,
		SortOrder:  store.SortAsc,
		SearchTerm: "",
	}

	// Parse pagination
	if page := r.URL.Query().Get("page"); page != "" {
		if p, err := strconv.ParseUint(page, 10, 64); err == nil && p > 0 {
			cond.Page = uint(p)
		}
	}

	if limit := r.URL.Query().Get("limit"); limit != "" {
		if l, err := strconv.ParseUint(limit, 10, 64); err == nil && l > 0 {
			cond.Limit = uint(l)
		}
	}

	// Parse search term
	cond.SearchTerm = strings.TrimSpace(r.URL.Query().Get("search"))

	// Parse sort
	if sortBy := r.URL.Query().Get("sort_by"); sortBy != "" {
		cond.SortField = strings.ToLower(strings.TrimSpace(sortBy))
	}

	if order := r.URL.Query().Get("order"); order != "" {
		order = strings.ToLower(strings.TrimSpace(order))
		if order == "desc" {
			cond.SortOrder = store.SortDesc
		} else {
			cond.SortOrder = store.SortAsc
		}
	}

	// Parse filters - handle repeated keys and determine operator
	for key := range r.URL.Query() {
		// Skip reserved keys
		if isReservedKey(key) {
			continue
		}

		values := r.URL.Query()[key]
		if len(values) == 0 {
			continue
		}

		// Clean and collect values
		filterValues := make([]string, 0, len(values))
		for _, v := range values {
			v = strings.TrimSpace(v)
			if v == "" {
				continue
			}
			filterValues = append(filterValues, v)
		}

		if len(filterValues) == 0 {
			continue
		}

		// default filter operation
		operator := store.OpEqual

		if op, ok := filterOps[key]; ok {
			operator = op
		} else {
			// Alogorithm: First we'll iterate filterValues. If any of filter value starts with comparison operators
			// immediately consider it as numeric comparison filter.  then we'll consider only first 2 values, ignore
			// rest of values
			numericComparison := false
			for _, fv := range filterValues {
				if strings.HasPrefix(fv, string(store.OpGreaterThan)) ||
					strings.HasPrefix(fv, string(store.OpGreaterThanOrEqual)) ||
					strings.HasPrefix(fv, string(store.OpLessThan)) ||
					strings.HasPrefix(fv, string(store.OpLessThanOrEqual)) {
					numericComparison = true
				}
			}

			if numericComparison {
				switch len(filterValues) {
				case 1:
					op, val := extractNumericComparisionOp(filterValues[0])

					cond.Filters = append(cond.Filters,
						store.Filter{
							Field:    key,
							Values:   []any{val},
							Operator: op,
						})
					continue
				default:
					if len(filterValues) < 2 {
						// empty , actually we don't need to worry about this case because intial numeric Comparision would find
						continue
					}
					op1, v1 := extractNumericComparisionOp(filterValues[0])
					op2, v2 := extractNumericComparisionOp(filterValues[1])
					if op1 == store.OpEqual || op2 == store.OpEqual {
						//invalid not numeric comparison. instead of coming with wrong assumptions, let's ignore
						continue
					}
					if op1 == op2 {
						// duplicate filter is not allowed. let's ignore. reason to simplify filter logic
						continue
					}
					if strings.HasPrefix(string(op1), "<") && strings.HasPrefix(string(op2), "<") {
						// this is not correct to select range, let's ignore.
						continue
					}
					if strings.HasPrefix(string(op1), ">") && strings.HasPrefix(string(op2), ">") {
						// this is not correct to select range, let's ignore.
						continue
					}
					cond.Filters = append(cond.Filters,
						store.Filter{
							Field:    key,
							Values:   []any{v1},
							Operator: op1,
						},
						store.Filter{
							Field:    key,
							Values:   []any{v2},
							Operator: op2,
						})
					continue
				}
			} else {
				// Determine operator based on number of values
				if len(filterValues) > 1 {
					operator = store.OpIn
				}
			}
		}

		convertedValues := []any{}
		for _, v := range filterValues {
			convertedValues = append(convertedValues, v)
		}
		cond.Filters = append(cond.Filters, store.Filter{
			Field:    key,
			Operator: operator,
			Values:   convertedValues,
		})
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

func extractNumericComparisionOp(v string) (op store.FilterOperator, val string) {
	// order of ops are important. if checked < before <=, < may match when actual op is <=
	ops := []string{string(store.OpGreaterThanOrEqual), string(store.OpGreaterThan), string(store.OpLessThanOrEqual), string(store.OpLessThan)}
	for _, op := range ops {
		if val, found := strings.CutPrefix(v, op); found {
			return store.FilterOperator(op), val
		}
	}
	return store.OpEqual, v
}