import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Chip, ChipRemoveEvent } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useEffect, useRef, useState } from 'react';

export type SearchAndSelectDropdownOption = {
  label: string;
  value: string;
};

export type SearchAndSelectDropdownProps = {
  value?: SearchAndSelectDropdownOption[];

  suggestions: SearchAndSelectDropdownOption[];

  onSelect: (selectedOptions: SearchAndSelectDropdownOption[]) => void;
  onSearch: (searchTerm: string) => void;

  placeholder?: string;
  maxChipsPerRow?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  searchDebounceMs?: number;
  noResultPlaceholder?: string;
};

const SearchAndSelectDropdown: React.FC<SearchAndSelectDropdownProps> = ({
  value = [],
  suggestions,
  onSelect,
  onSearch,
  placeholder = 'Search and select...',
  maxChipsPerRow,
  disabled = false,
  loading = false,
  className = '',
  searchDebounceMs = 300,
  noResultPlaceholder = 'No Results found!',
}) => {
  const opRef = useRef<OverlayPanel>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [buttonWidth, setButtonWidth] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(newSearchTerm);
    }, searchDebounceMs);
  };

  const handleChipRemove = (e: ChipRemoveEvent): boolean => {
    const newOptions = value.filter((opt) => opt.value !== e.value);
    onSelect(newOptions);
    return true;
  };

  const handleOptionToggle = (selected: boolean, option: SearchAndSelectDropdownOption) => {
    let newOptions: SearchAndSelectDropdownOption[];

    if (selected) {
      if (!value.find((v) => v.value === option.value)) {
        newOptions = [...value, option];
      } else {
        return;
      }
    } else {
      newOptions = value.filter((v) => v.value !== option.value);
    }

    onSelect(newOptions);
  };

  const isSelected = (optionValue: string): boolean => {
    return Boolean(value.find((v) => v.value === optionValue));
  };

  const renderChips = () => {
    if (value.length === 0) return null;

    if (maxChipsPerRow) {
      const rows = Math.ceil(value.length / maxChipsPerRow);
      return (
        <div className="flex flex-column">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const start = rowIndex * maxChipsPerRow;
            const end = start + maxChipsPerRow;
            const rowItems = value.slice(start, end);

            return (
              <div className="flex flex-row flex-wrap" key={rowIndex}>
                {rowItems.map((option) => (
                  <Chip
                    key={option.value}
                    className="m-1 text-xs"
                    label={option.label}
                    removable
                    onRemove={handleChipRemove}
                  />
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap">
        {value.map((option) => (
          <Chip
            key={option.value}
            className="m-1 text-xs"
            label={option.label}
            removable
            onRemove={handleChipRemove}
          />
        ))}
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        opRef.current?.toggle(e);
      }
    }
  };

  return (
    <div className={`search-and-select-dropdown ${className}`}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        // aria-expanded={opRef.current?.isVisible() || false}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        className="p-0 m-0 flex justify-content-between align-items-center hover:bg-white hover:border-1 cursor-pointer border-round-3xl"
        onClick={(e) => {
          if (!disabled) {
            opRef.current?.toggle(e);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-column w-full">
          <div className="m-0 p-0 flex-grow-1" ref={buttonRef}>
            <Button
              size="small"
              outlined
              disabled={disabled}
              className="p-0 m-0 border-1 border-solid border-round-3xl border-gray-200 hover:border-gray-300 focus:border-teal-500 text-xs w-full"
            >
              <InputText
                type="text"
                value={searchTerm}
                className="border-none p-2 text-sm w-full"
                placeholder={placeholder}
                onChange={handleSearch}
                disabled={disabled}
              />
              {loading ? (
                <i className="pi pi-spin pi-spinner text-teal-400 text-sm pr-2" />
              ) : (
                <i className="pi pi-search text-teal-400 text-sm pr-2" />
              )}
            </Button>
          </div>

          {renderChips()}
        </div>

        <OverlayPanel
          ref={opRef}
          className="p-0 m-0"
          style={{
            maxHeight: '40vh',
            overflowY: 'auto',
            width: buttonWidth ? `${buttonWidth}px` : 'auto',
          }}
          pt={{
            content: {
              className: 'm-0 p-0',
            },
          }}
        >
          <div className="flex flex-column p-0 m-0" role="listbox" aria-label="Search results">
            {suggestions.length === 0 ? (
              <div className="p-3 text-center text-sm text-500" role="status">
                {loading ? 'Searching...' : noResultPlaceholder}
              </div>
            ) : (
              suggestions.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  tabIndex={0}
                  aria-selected={isSelected(option.value)}
                  className={`flex flex-row gap-4 justify-content-start p-0 m-0 pl-4 pr-4 pt-2 pb-2 align-items-center cursor-pointer hover:surface-100 ${index % 2 === 1 ? 'surface-50' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(!isSelected(option.value), option);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOptionToggle(!isSelected(option.value), option);
                    }
                  }}
                >
                  <Checkbox
                    value={option.value}
                    checked={isSelected(option.value)}
                    onChange={(e) => handleOptionToggle(Boolean(e.checked), option)}
                    tabIndex={-1}
                  />
                  <div className="text-sm">{option.label}</div>
                </div>
              ))
            )}
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
};

export default SearchAndSelectDropdown;
