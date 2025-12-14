import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useEffect, useState } from 'react';
import SearchAndSelectDropdown, { SearchAndSelectDropdownOption } from './SearchAndSelectDropdown';
import HttpClient from '../client';
import { ListUsersResponse } from '../types/request_response';
import { useToast } from './ToastComponent';
import { isValidNamespace } from '../utils';

export type CreateNamespaceDialogProps = {
  visible: boolean;
  hideCallback: (reload: boolean) => void;
}

const Purposes = ["Project", "Team"];

const CreateNamespaceDialog = (props: CreateNamespaceDialogProps) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [maintainers, setMaintainers] = useState<string[]>([]);
  const [namespacePuprose, setNamespacePurpose] = useState<'team' | 'project'>('project');
  const [isPrivateNamespace, setPrivateNamespace] = useState<boolean>(true);

  const [nameValidationMsg, setNameValidationMsg] = useState<string>("");
  const [purposeValidationMsg, setPurposeValidationMsg] = useState<string>("");
  const [maintainerValidationMsg, setMaintainerValidationMsg] = useState<string>("");
  const [descriptionValidationMsg, setDescriptionValidationMsg] = useState<string>("");

  const [maintainerOptions, setMaintainerOptions] = useState<SearchAndSelectDropdownOption[]>([]);

  const { showSuccess, showError } = useToast();


  const validateNamespaceAvailablity = (name: string, successFn: () => void) => {
    HttpClient.getInstance()
      .namesapceAvailable(name)
      .then(data => {
        if (data.error_message) {
          setNameValidationMsg(data.error_message)
          return;
        }
        successFn();
      }).catch(err => {
        console.log(err);
      })
  }

  const saveNamespace = () => {
    HttpClient.getInstance()
      .createNamesapce({
        name: name,
        description: description,
        is_public: !isPrivateNamespace,
        purpose: namespacePuprose,
        maintainers: maintainers
      })
      .then(data => {
        if (data.error_message) {
          showError(data.error_message);
          return;
        }

        showSuccess("Successfully created namespace!");
        props.hideCallback(true);
      })
      .catch(err => {
        showError("Unexpecte error occurred. Please try again!");
      });
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameValidationMsg("");

  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setDescriptionValidationMsg("");
  }

  const handleMaintainersChange = (options: SearchAndSelectDropdownOption[]) => {
    if (options) {
      setMaintainers(prev => {
        return options.map(opt => opt.value)
      });
      setMaintainerValidationMsg("")
    }
  }

  const searchMaintainers = (searchTerm: string) => {
    HttpClient.getInstance()
      .getUsersList({
        pagination: {
          page: 1,
          limit: 50
        },
        filters: [{
          key: "role",
          values: ["Maintainer"]
        },
        {
          key: "locked",
          values: [false]
        }
        ],
        search_value: searchTerm,
      }).then((data: ListUsersResponse) => {
        if (data.error) {
          showError("Unable to load maintainers! Please try again.")
          return;
        }

        const options = data.users?.map(user => {
          return { label: user.username, value: user.id } as SearchAndSelectDropdownOption
        });

        setMaintainerOptions(options);
      })
      .catch((err) => {
        console.log(err);
        showError("Unable to load maintainers! Please try again.")
      });
  }


  const handleButtonClick = () => {
    let nameMsg = "";
    if (name == "") {
      nameMsg = "Namespace name cannot be empty"
    }
    if (!isValidNamespace(name)) {
      nameMsg = "Invalid Namespace name"
    }

    let purposeMsg = "";
    if (namespacePuprose as string == "") {
      purposeMsg = "Select the purpose";
    }

    let maintainerMsg = ""
    if (maintainers.length == 0) {
      maintainerMsg = "Select atleast one maintainer"
    }

    let descriptionMsg = "";
    if (description == "") {
      descriptionMsg = "Provide description about the namespace"
    }
    if (nameMsg || descriptionMsg || purposeMsg || maintainerMsg) {
      setDescriptionValidationMsg(descriptionMsg);
      setNameValidationMsg(nameMsg);
      setMaintainerValidationMsg(maintainerMsg);
      setPurposeValidationMsg(purposeMsg);
      return;
    }

    validateNamespaceAvailablity(name, saveNamespace)
  }

  return (
    <React.Fragment>
      <Dialog
        visible={props.visible}
        onHide={() => props.hideCallback(false)}
        className='w-4 p-0 m-0'
        modal
        content={({ hide }) => {
          return (
            <div className="flex flex-column  p-0 m-0 bg-white border-round-lg">
              <div
                className="flex-grow-0  border-round-top-lg 
                        flex flex-row  align-items-center justify-content-between gap-2 p-3 pb-2 "
              >
                <div className="font-medium text-lg text-color-secondary">
                  Create Namespace
                </div>
                <div>
                  <span
                    className="pi pi-times text-sm  cursor-pointer"
                    onClick={(e) => hide(e)}
                  ></span>
                </div>
              </div>

              <Divider className="m-0 p-0" />
              <div className="flex-grow-1 flex flex-column gap-2 p-0 pb-2">
                <div className=" border-round-lg flex flex-column">
                  <div className="p-4 grid">
                    <div className="col-6 flex align-items-center text-xs p-2 pb-0 mb-0 required">
                      {/* <i className="pi pi-envelope text-xs"></i> */}
                      Name
                    </div>
                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {nameValidationMsg && (
                        <span className="text-red-300">
                          {nameValidationMsg}
                        </span>
                      )}
                    </div>
                    <div className="col-12">
                      <InputText
                        value={name}
                        className="border-1 text-xs"
                        required
                        onChange={handleNameChange}
                      />
                    </div>

                    <div className="col-6 flex align-items-center text-xs pb-0 mb-0 required">
                      Purpose
                    </div>

                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {purposeValidationMsg && (
                        <span className="text-red-300">
                          {purposeValidationMsg}
                        </span>
                      )}
                    </div>
                    <div className='col-6'>
                      <Dropdown
                        pt={{
                          input: {
                            className: "text-xs",
                          },
                        }}
                        required
                        className="w-full border-1 p-0 text-xs"
                        panelClassName="text-xs animate-fadein"
                        options={Purposes}
                        value={namespacePuprose}
                        onChange={(e) => setNamespacePurpose(e.value)}
                      />
                    </div>

                    <div className="col-6 flex justify-content-end align-items-center text-xs pb-0 mb-0">
                      <Checkbox inputId="private_namespace" name="access" value="Private" onChange={e => setPrivateNamespace(Boolean(e.checked))} checked={isPrivateNamespace} />
                      <label htmlFor="private_namespace" className="ml-2">Private Namespace</label>
                    </div>
                    {/* <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">

                    </div> */}

                    <div className="col-6 flex align-items-center text-xs pb-0 mb-0 required">
                      Maintainers
                    </div>

                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {maintainerValidationMsg && (
                        <span className="text-red-300">
                          {maintainerValidationMsg}
                        </span>
                      )}
                    </div>

                    <div className='col-12 flex flex-row gap-2'>
                      <SearchAndSelectDropdown
                        searchResults={maintainerOptions}
                        handleSearch={searchMaintainers}
                        maxChipsPerRow={3}
                        handleChange={handleMaintainersChange}
                      />
                    </div>


                    <div className="col-6 flex align-items-center text-xs pb-0 mb-0 required">
                      Description
                    </div>
                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {descriptionValidationMsg && (
                        <span className="text-red-300">
                          {descriptionValidationMsg}
                        </span>
                      )}
                    </div>
                    <div className='col-12'>
                      <InputTextarea value={description} onChange={handleDescriptionChange} rows={5} className='w-full text-xs' />
                    </div>
                  </div>
                  <Divider layout="horizontal" className="p-0 m-0" />

                  <div className="p-4 pt-2 pb-2 flex flex-row justify-content-end">
                    <Button
                      className="border-round-3xl border-1 text-xs"
                      size="small"
                      onClick={handleButtonClick}
                    >
                      <span className="text-xs">Save and Grant Access</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </React.Fragment >
  );
}

export default CreateNamespaceDialog;