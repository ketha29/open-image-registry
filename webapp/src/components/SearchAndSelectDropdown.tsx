import { Button } from 'primereact/button';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Chip, ChipRemoveEvent } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useEffect, useRef, useState } from 'react';



export type SearchAndSelectDropdownProps = {
  searchResults: SearchAndSelectDropdownOption[];
  maxChipsPerRow?: number;
  handleSearch: (searchTerm: string) => void;
  handleChange: (options: SearchAndSelectDropdownOption[]) => void;
}

export type SearchAndSelectDropdownOption = {
  label: string;
  value: string;
}

const SearchAndSelectDropdown = (props: SearchAndSelectDropdownProps) => {
  const opRef = useRef<OverlayPanel>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [selectedOptions, setSelectedOptions] = useState<SearchAndSelectDropdownOption[]>([]);
  const [buttonWidth, setButtonWidth] = useState<number>(0);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //TODO: show loading state to protect repeated search 
    props.handleSearch(e.target.value)
  }

  const handleChipRemoveEvent = (e: ChipRemoveEvent): boolean => {
    setSelectedOptions(prev => {
      let newOptions = [...prev];
      newOptions = newOptions.filter(opt => opt.value != e.value);
      return newOptions;
    })
    return true;
  }

  const handleOptionSelect = (selected: boolean, option: SearchAndSelectDropdownOption) => {
    if (selected) {
      if (!selectedOptions.find(v => v.value == option.value)) {
        setSelectedOptions(prev => {
          const newOptions = [...prev, option];
          props.handleChange(newOptions);
          return newOptions
        })
      }
    } else {
      if (selectedOptions.find(v => v.value == option.value)) {
        setSelectedOptions(prev => {
          const newOptions = [...prev].filter(v => v.value == option.value);
          props.handleChange(newOptions);
          return newOptions
        })
      }
    }
  }

  return (
    <React.Fragment>
      <div className="p-0 m-0 flex justify-content-between align-items-center
        hover:bg-white hover:border-1"
        onClick={(e) => {
          opRef.current?.toggle(e);
        }}
      >
        {/* {!showOptions && (
          <span
            className="pi pi-chevron-down  text-xs pr-2 pl-2"
            onClick={() => setShowOptions((c) => !c)}
          />
        )}
        {showOptions && (
          <span
            className="pi pi-chevron-up  text-xs pr-2 pl-2"
            onClick={() => setShowOptions((c) => !c)}
          />
        )} */}
        <div className='flex flex-column'>
          <div className='m-0 p-0 flex-grow-1' ref={buttonRef}>
            <Button
              size="small"
              outlined
              className="p-0 m-0 border-1 border-solid border-round-lg border-teal-100  text-xs w-full"
            >
              <InputText
                size="50"
                type="text"
                className="border-none p-2 text-sm"
                placeholder="Search and Select maintainers . . . ."
                onChange={handleSearch}
              />
              <i className="pi pi-search text-teal-400 text-sm pr-2 "></i>
            </Button>
          </div>
          <div className="flex flex-column">
            {selectedOptions.length !== 0 &&
              props.maxChipsPerRow &&
              Array.from({ length: Math.ceil(selectedOptions.length / props.maxChipsPerRow) }).map((_, i) => {
                const optionsArray = Array.from(selectedOptions);
                const start = i * (props.maxChipsPerRow as number);
                const end = (i + 1) * (props.maxChipsPerRow as number);
                const rowItems = optionsArray.slice(start, end);

                return (
                  <div className="flex flex-row" key={i}>
                    {rowItems.map((option: SearchAndSelectDropdownOption) => {
                      return (
                        <Chip
                          key={option.value}
                          className="m-1 text-xs"
                          label={option.label}
                          removable
                          onRemove={handleChipRemoveEvent}
                        />
                      );
                    })}
                  </div>
                );
              })}
          </div>
          {selectedOptions.length !== 0 && !props.maxChipsPerRow && (
            <div className="flex">
              {Array.from(selectedOptions).map((option: SearchAndSelectDropdownOption) => {
                return (
                  <Chip
                    key={option.value}
                    className="m-1 text-xs"
                    label={option.label}
                    removable
                    onRemove={handleChipRemoveEvent}
                  />
                );
              })}
            </div>
          )}
        </div>


        <OverlayPanel ref={opRef} className="p-0 m-0" style={{
          maxHeight: '40vh',
          overflowY: 'auto',
          width: buttonWidth ? `${buttonWidth}px` : 'auto',
        }}
          pt={{
            content: {
              className: 'm-0 p-0'
            }
          }}
        >
          <div className="flex flex-column p-0 m-0" >
            {/* ------------------------- row1 ----------------- */}
            {props.searchResults.map((node: SearchAndSelectDropdownOption, i: number) => (
              <div className={"flex flex-row gap-4 justify-content-start p-0 m-0 pl-4 pr-4 pt-2 pb-2 align-items-center" + (i % 2 == 1 ? ' surface-50' : '')}>
                <Checkbox
                  value={node.value}
                  checked={Boolean(selectedOptions.find(v => v.value == node.value))}
                  onChange={e => handleOptionSelect(Boolean(e.checked), node)}
                />
                <div className=''>{node.label}</div>
              </div>
            ))}
          </div>
        </OverlayPanel>
      </div>
    </React.Fragment>
  );
}

export default SearchAndSelectDropdown;