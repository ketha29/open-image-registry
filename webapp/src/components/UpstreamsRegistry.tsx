import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { Sidebar } from "primereact/sidebar";
import React, { useEffect, useState, useRef } from "react";
import {
  ListUpstreamRegistriesResponse,
  PostUpstreamRequestBody,
  UpstreamOCIRegEntity,
} from "../types/request_response";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import {
  AuthTypeOptions,
  CleanupPolicyOptions,
  UpstreamRegTemplateOptions,
  UpstreamTemplates,
} from "../constants";
import HttpClient from "../client";
import { useToast } from "./ToastComponent";

const UpstreamRegistry = (props: {
  visible: boolean;
  hideCallback: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showFormToAddUpstream, setShowFormToAddUpstream] =
    useState<boolean>(true);

  const [isFormStep1Filled, setFormStep1Filled] = useState<boolean>(false);
  const [isFormStep2Filled, setFormStep2Filled] = useState<boolean>(false);

  const [tabIndexOfAddForm, setTabIndexOfAddForm] = useState<1 | 2>(1);

  const [upstreamTemplate, setUpstreamTemplate] = useState<{
    name: string;
    short_name: string;
    code: string;
  }>({
    name: "Other",
    short_name: "other",
    code: "other",
  });

  const [upstreamRegisteries, setUpstreamRegisteries] =
    useState<ListUpstreamRegistriesResponse>({
      total: 0,
      page: 0,
      limit: 25,
      registeries: [],
    } as ListUpstreamRegistriesResponse);

  const [newUpstreamRequest, setNewUpstreamRequest] =
    useState<PostUpstreamRequestBody>(UpstreamTemplates["other"]);

  useEffect(() => {
    loadUpstreamRegisteries();
  }, []);

  useEffect(() => {
    if (
      newUpstreamRequest?.name != "" &&
      newUpstreamRequest?.upstream_url != "" &&
      newUpstreamRequest?.auth_config?.credentials_json?.username != "" &&
      newUpstreamRequest?.auth_config?.credentials_json?.password != "" &&
      Number(newUpstreamRequest?.storage_config?.storage_limit) > 0 &&
      Number(newUpstreamRequest?.storage_config?.cleanup_threshold) > 0 &&
      Number(newUpstreamRequest?.storage_config?.cleanup_threshold) < 100
    ) {
      setFormStep1Filled(true);
    }

    if (
      newUpstreamRequest?.cache_config?.offline_mode !== undefined &&
      Number(newUpstreamRequest?.cache_config.ttl_seconds) > 0 &&
      newUpstreamRequest?.access_config?.max_retries > 0 &&
      newUpstreamRequest?.access_config?.connection_timeout > 0 &&
      newUpstreamRequest?.access_config?.proxy_enabled !== undefined
    ) {
      setFormStep2Filled(true);
    }
  }, [newUpstreamRequest]);

  useEffect(() => {
    setNewUpstreamRequest(
      (current) => UpstreamTemplates[upstreamTemplate.code]
    );
  }, [upstreamTemplate]);

  const { showSuccess, showError } = useToast();

  const handleCreateUpstreamRegistry = () => {
    HttpClient.getInstance("http://localhost:8000/api/v1")
      .createUpstream(newUpstreamRequest)
      .then((data) => {
        if (data.error) {
          showError(data.error);
        } else {
          loadUpstreamRegisteries();

          showSuccess(
            "Successfully created OCI upstream registry: " + data.reg_id
          );
        }
      });
  };

  const loadUpstreamRegisteries = () => {
    HttpClient.getInstance("http://localhost:8000/api/v1")
      .getUpstreamRegisteries()
      .then((data) => {
        if ((data as { error: string })?.error) {
          showError((data as { error: string })?.error);
          return;
        }
        console.log(data);
        setUpstreamRegisteries(data as ListUpstreamRegistriesResponse);
      });
  };

  return (
    <Sidebar
      position="bottom"
      visible={props.visible}
      onHide={() => props.hideCallback(false)}
      header={
        <div className="flex w-20rem justify-content-between">
          <div className="text-color text-lg">Upstream Registeries</div>

          <div className="w-6rem">
            <Button size="small">Add New</Button>
          </div>
        </div>
      }
      style={{ height: "90vh" }}
      className="flex align-items-stretch"
    >
      <div className="h-full flex-grow-1 flex gap-3">
        <div className="p-0 m-0">
          <DataTable
            value={upstreamRegisteries.registeries}
            scrollable
            scrollHeight="80vh"
            className="mr-0 pr-0"
          >
            {/* <Column
              header={
                <div className="w-6rem">
                  {!showFormToAddUpstream && (
                    <Button size="small">Add New</Button>
                  )}
                </div>
              }
              body={<i className="pi pi-sync cursor-pointer text-blue-600"></i>}
            ></Column> */}
            <Column
              style={{ minWidth: "200px" }}
              field="name"
              header="Name"
              body={(reg, options) => {
                return (
                  <div className="grid">
                    <div className="col-1 flex flex-column justify-content-center">
                      <span
                        className={
                          (reg as UpstreamOCIRegEntity).status == "active"
                            ? "status-circle status-active"
                            : "status-circle status-disabled"
                        }
                      />
                    </div>
                    <div className="col-1"></div>

                    <div className="col-9 cursor-pointer text-blue-600">
                      {reg.name}
                    </div>
                  </div>
                );
              }}
            />
            <Column field="cached_images_count" header="Cached Images" />
          </DataTable>
        </div>

        <Divider layout="vertical" className="h-full m-0" />

        {/* Form to create new repository */}
        <div className="flex flex-column gap-2 w-full">
          <div className="flex justify-content-between">
            <div className="text-color text-lg">New Upstream Registry</div>
            <div className="pr-4 relative">
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-primary-100 border-round-lg opacity-50 animate-pulse"></div>

              <div className="flex flex-column relative">
                <div className="flex align-items-center gap-2 mb-2">
                  <Badge
                    value="✨ Choose from template"
                    severity="info"
                    className="animate-bounce text-xs"
                  />
                </div>
                <Dropdown
                  options={UpstreamRegTemplateOptions}
                  optionLabel="name"
                  className="w-full md:w-20rem text-xs border-1"
                  panelClassName="text-xs animate-fadein"
                  style={{
                    height: "2.4rem",
                    width: "20rem",
                    fontSize: "0.80rem",
                    transition: "all 0.3s ease",
                  }}
                  value={upstreamTemplate}
                  onChange={(e) => setUpstreamTemplate(e.value)}
                  inputId="upstream-template"
                  placeholder="Select a template to get started..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row mt-2">
            <Divider className="flex-grow-1">
              <Badge
                value={"1"}
                className={isFormStep1Filled ? "mr-2" : "mr-2 p-badge-outlined"}
              >
                1
              </Badge>
              <span className="text-sm">&nbsp;&nbsp;Basic Info</span>
            </Divider>
            <Divider className="flex-grow-1">
              <Badge
                value={"2"}
                className={
                  isFormStep1Filled && isFormStep2Filled
                    ? "mr-2"
                    : "mr-2 p-badge-outlined"
                }
              ></Badge>
              <span className="text-sm">&nbsp;&nbsp;Advance Config</span>
            </Divider>
            <Divider align="right">
              <Button
                size="small"
                disabled={!(isFormStep1Filled && isFormStep2Filled)}
                onClick={handleCreateUpstreamRegistry}
              >
                Complete
              </Button>
            </Divider>
          </div>

          <div className="grid ml-2 mr-2 mt-1">
            {/* Basic Info */}
            {tabIndexOfAddForm == 1 && (
              <React.Fragment>
                {/* name */}
                <div className="col-3">
                  <label
                    htmlFor="registry_name"
                    className="text-color-secondary font-medium text-sm"
                  >
                    Registry Name
                  </label>
                </div>
                <div className="col-9">
                  <InputText
                    id="registry_name"
                    aria-describedby="registry_name_help"
                    size={60}
                    className="border-1 text-xs"
                    value={newUpstreamRequest?.name}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          name: e.target.value,
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                </div>

                {/* port */}
                <div className="col-3">
                  <label
                    htmlFor="port"
                    className="text-color font-medium text-sm"
                  >
                    Port
                  </label>
                </div>
                <div className="col-9">
                  <InputText
                    id="port"
                    aria-describedby="port_help"
                    size={60}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.port?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          port: Number(e.target.value),
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                </div>

                {/* upstream_url */}
                <div className="col-3">
                  <label
                    htmlFor="upstream_url"
                    className="text-color font-medium text-sm"
                  >
                    Upstream URL
                  </label>
                </div>
                <div className="col-9">
                  <InputText
                    id="upstream_url"
                    aria-describedby="upstream_url_help"
                    size={60}
                    className="border-1 text-xs"
                    value={newUpstreamRequest?.upstream_url}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          upstream_url: e.target.value,
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                </div>

                <div className="col-12 text-color font-medium">
                  Authentication
                </div>
                <div className="col-3">
                  <label
                    htmlFor="auth_type"
                    className="text-color font-medium text-sm"
                  >
                    Type
                  </label>
                </div>
                <div className="col-9 flex   text-xs ">
                  {AuthTypeOptions.map((v) => (
                    <div key={v.code} className="flex pl-2">
                      <RadioButton
                        className=""
                        inputId={v.code}
                        name="category"
                        value={v.code}
                        onChange={(e) =>
                          setNewUpstreamRequest((current) => {
                            return {
                              ...current,
                              auth_config: {
                                ...current?.auth_config,
                                auth_type: e.value,
                              },
                            } as PostUpstreamRequestBody;
                          })
                        }
                        checked={
                          newUpstreamRequest?.auth_config?.auth_type === v.code
                        }
                      />
                      <label htmlFor={v.code} className="ml-2">
                        {v.short_name}
                      </label>
                    </div>
                  ))}
                </div>

                {newUpstreamRequest?.auth_config?.auth_type == "basic" ||
                  (newUpstreamRequest?.auth_config?.auth_type == "bearer" && (
                    <React.Fragment>
                      <div className="col-2">
                        <label
                          htmlFor="username"
                          className="text-color font-medium text-sm"
                        >
                          Username
                        </label>
                      </div>
                      <div className="col-4 flex text-xs align-items-center">
                        <InputText
                          id="username"
                          aria-describedby="username_help"
                          size={60}
                          className="border-1 text-xs"
                          value={
                            newUpstreamRequest?.auth_config?.credentials_json
                              ?.username
                          }
                          onChange={(e) =>
                            setNewUpstreamRequest((current) => {
                              return {
                                ...current,
                                auth_config: {
                                  ...current?.auth_config,
                                  credentials_json: {
                                    ...current?.auth_config?.credentials_json,
                                    username: e.target.value,
                                  },
                                },
                              } as PostUpstreamRequestBody;
                            })
                          }
                        />
                      </div>

                      <div className="col-2">
                        <label
                          htmlFor="password"
                          className="text-color font-medium text-sm"
                        >
                          Password
                        </label>
                      </div>
                      <div className="col-4 flex text-xs align-items-center">
                        <InputText
                          id="password"
                          aria-describedby="password_help"
                          size={60}
                          className="border-1 text-xs"
                          type="password"
                          value={
                            newUpstreamRequest?.auth_config?.credentials_json
                              ?.password
                          }
                          onChange={(e) =>
                            setNewUpstreamRequest((current) => {
                              return {
                                ...current,
                                auth_config: {
                                  ...current?.auth_config,
                                  credentials_json: {
                                    ...current?.auth_config?.credentials_json,
                                    password: e.target.value,
                                  },
                                },
                              } as PostUpstreamRequestBody;
                            })
                          }
                        />
                      </div>
                    </React.Fragment>
                  ))}

                <div className="col-12 text-color font-medium">Storage</div>

                <div className="col-3">
                  <label
                    htmlFor="storage_limit"
                    className="text-color font-medium text-sm"
                  >
                    Limit
                  </label>
                </div>
                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="storage_limit"
                    aria-describedby="storage_limit_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.storage_config?.storage_limit?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          storage_config: {
                            ...current?.storage_config,
                            storage_limit: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="pl-2 flex text-center">MB</div>
                </div>

                <div className="col-3">
                  <label
                    htmlFor="cleanup_threshold"
                    className="text-color font-medium text-sm"
                  >
                    Cleanup Threshold
                  </label>
                </div>
                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="cleanup_threshold"
                    aria-describedby="cleanup_threshold_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.storage_config?.cleanup_threshold?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          storage_config: {
                            ...current?.storage_config,
                            cleanup_threshold: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="w-3rem pl-2"> %</div>
                </div>

                <div className="col-3">
                  <label
                    htmlFor="cleanup_policy"
                    className="text-color font-medium text-sm"
                  >
                    Cleanup Policy
                  </label>
                </div>
                <div className="col-9 flex   text-xs ">
                  {CleanupPolicyOptions.map((v) => (
                    <div key={v.code} className="flex pl-2">
                      <RadioButton
                        inputId={v.code}
                        name="category"
                        value={v.code}
                        onChange={(e) =>
                          setNewUpstreamRequest((current) => {
                            return {
                              ...current,
                              storage_config: {
                                ...current?.storage_config,
                                cleanup_policy: e.value,
                              },
                            } as PostUpstreamRequestBody;
                          })
                        }
                        checked={
                          newUpstreamRequest?.storage_config?.cleanup_policy ===
                          v.code
                        }
                      />
                      <label htmlFor={v.code} className="ml-2">
                        {v.short_name}
                      </label>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            )}

            {/* Advance Info */}
            {tabIndexOfAddForm == 2 && (
              <React.Fragment>
                <div className="col-12 text-color font-medium">Cache</div>
                <div className="col-3">
                  <label
                    htmlFor="ttl_seconds"
                    className="text-color font-medium text-sm"
                  >
                    TTL
                  </label>
                </div>

                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="ttl_seconds"
                    aria-describedby="ttl_seconds_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.cache_config?.ttl_seconds?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          cache_config: {
                            ...current?.cache_config,
                            ttl_seconds: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="pl-2">Seconds</div>
                </div>

                <div className="col-6"></div>

                <div className="col-6">
                  <Checkbox
                    inputId="offline_mode"
                    name="offline_mode"
                    value="Offline Mode for non-latest tags"
                    checked={Boolean(
                      newUpstreamRequest?.cache_config?.offline_mode
                    )}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          cache_config: {
                            ...current?.cache_config,
                            offline_mode: !current?.cache_config?.offline_mode,
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <label htmlFor="offline_mode" className="ml-2 text-sm">
                    Prevent upstream checks for non-latest tags
                  </label>
                </div>

                <Divider className="p-2" />

                <div className="col-12 text-color font-medium">
                  Access Config
                </div>
                <div className="col-3">
                  <Checkbox
                    inputId="proxy_enabled"
                    name="proxy_enabled"
                    value="Enable Proxy"
                    checked={Boolean(
                      newUpstreamRequest?.access_config?.proxy_enabled
                    )}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            proxy_enabled:
                              !current?.access_config?.proxy_enabled,
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <label htmlFor="proxy_enabled" className="ml-2 text-sm">
                    Enable Proxy
                  </label>
                </div>

                <div className="col-3">
                  <label
                    htmlFor="connection_timeout"
                    className="text-color font-medium text-sm"
                  >
                    Connection Timeout
                  </label>
                </div>
                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="connection_timeout"
                    aria-describedby="connection_timeout_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.access_config?.connection_timeout?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            connection_timeout: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="pl-2 flex text-center">Seconds</div>
                </div>
                <div className="col-3"></div>

                <div className="col-3">
                  <label
                    htmlFor="read_timeout"
                    className="text-color font-medium text-sm"
                  >
                    Read Timeout
                  </label>
                </div>
                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="read_timeout"
                    aria-describedby="read_timeout_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.access_config?.read_timeout?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            read_timeout: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="pl-2 flex text-center">Seconds</div>
                </div>

                <div className="col-2">
                  <label
                    htmlFor="max_retries"
                    className="text-color font-medium text-sm"
                  >
                    Max Retries
                  </label>
                </div>
                <div className="col-2 flex text-xs align-items-center">
                  <InputText
                    id="max_retries"
                    aria-describedby="max_retries_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.access_config?.max_retries?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            max_retries: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                </div>
                <div className="col-2"></div>

                <div className="col-3">
                  <label
                    htmlFor="max_connections"
                    className="text-color font-medium text-sm"
                  >
                    Max Connections
                  </label>
                </div>
                <div className="col-2 flex text-xs align-items-center">
                  <InputText
                    id="max_connections"
                    aria-describedby="max_connections_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.access_config?.max_connections?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            max_connections: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                </div>
                <div className="col-1"></div>

                <div className="col-2">
                  <label
                    htmlFor="retry_delay"
                    className="text-color font-medium text-sm"
                  >
                    Retry Delay
                  </label>
                </div>
                <div className="col-3 flex text-xs align-items-center">
                  <InputText
                    id="retry_delay"
                    aria-describedby="retry_delay_help"
                    size={10}
                    className="border-1 text-xs"
                    type="number"
                    value={newUpstreamRequest?.access_config?.retry_delay?.toString()}
                    onChange={(e) =>
                      setNewUpstreamRequest((current) => {
                        return {
                          ...current,
                          access_config: {
                            ...current?.access_config,
                            retry_delay: Number(e.target.value),
                          },
                        } as PostUpstreamRequestBody;
                      })
                    }
                  />
                  <div className="pl-2 flex text-center">Seconds</div>
                </div>
              </React.Fragment>
            )}

            <div className="col-12 flex justify-content-end">
              {tabIndexOfAddForm == 1 && (
                <Button size="small" onClick={() => setTabIndexOfAddForm(2)}>
                  Next
                </Button>
              )}
              {tabIndexOfAddForm == 2 && (
                <Button size="small" onClick={() => setTabIndexOfAddForm(1)}>
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default UpstreamRegistry;