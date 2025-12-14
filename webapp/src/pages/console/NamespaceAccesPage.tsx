import React, { useRef, useState } from 'react';
import { NamespaceInfo } from '../../types/app_types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import ChipsFilter from '../../components/ChipsFilter';
import { NAMESPACE_FILTER_OPTIONS } from '../../config/table_filter';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tooltip } from 'primereact/tooltip';
import { useNavigate } from 'react-router-dom';
import CreateNamespaceDialog from '../../components/CreateNamespace';

const mockNamespaces: NamespaceInfo[] = [
  {
    id: "ns_001",
    name: "openimage-core",
    is_public: true,
    type: "project",
    state: "active",
    description: "Core components and base images for OpenImageRegistry.",
    created_at: new Date("2024-02-15T10:12:00Z"),
    created_by: "admin",
    updated_at: new Date("2024-03-10T12:00:00Z"),
    user_access: { maintainers: 3, developers: 8, guests: 5 },
    repositories: { total: 25, active: 22, deprecated: 2, disabled: 1, restricted: 4 }
  },
  {
    id: "ns_002",
    name: "frontend-ui",
    is_public: false,
    type: "team",
    state: "active",
    description: "Frontend and UI image build pipelines.",
    created_at: new Date("2023-12-01T08:00:00Z"),
    created_by: "alice",
    user_access: { maintainers: 2, developers: 6, guests: 0 },
    repositories: { total: 12, active: 12, deprecated: 0, disabled: 0, restricted: 1 }
  },
  {
    id: "ns_003",
    name: "backend-services",
    is_public: false,
    type: "team",
    state: "active",
    description: "Microservices and backend APIs.",
    created_at: new Date("2024-01-10T14:22:00Z"),
    created_by: "bob",
    user_access: { maintainers: 4, developers: 10, guests: 2 },
    repositories: { total: 30, active: 28, deprecated: 1, disabled: 1, restricted: 6 }
  },
  {
    id: "ns_004",
    name: "analytics",
    is_public: false,
    type: "project",
    state: "deprecated",
    description: "Old analytics pipeline (deprecated).",
    created_at: new Date("2022-05-14T09:00:00Z"),
    created_by: "carol",
    updated_at: new Date("2024-01-20T17:40:00Z"),
    user_access: { maintainers: 1, developers: 3, guests: 0 },
    repositories: { total: 10, active: 0, deprecated: 9, disabled: 1, restricted: 0 }
  },
  {
    id: "ns_005",
    name: "devtools",
    is_public: true,
    type: "project",
    state: "active",
    description: "Developer tooling images.",
    created_at: new Date("2023-06-18T11:45:00Z"),
    created_by: "daniel",
    user_access: { maintainers: 2, developers: 12, guests: 7 },
    repositories: { total: 18, active: 17, deprecated: 1, disabled: 0, restricted: 2 }
  },
  {
    id: "ns_006",
    name: "python-libs",
    is_public: true,
    type: "project",
    state: "active",
    description: "Python runtime and base images.",
    created_at: new Date("2024-03-05T15:33:00Z"),
    created_by: "eve",
    user_access: { maintainers: 1, developers: 4, guests: 10 },
    repositories: { total: 9, active: 9, deprecated: 0, disabled: 0, restricted: 0 }
  },
  {
    id: "ns_007",
    name: "node-libs",
    is_public: true,
    type: "project",
    state: "active",
    description: "Node.js base images, runtime variants.",
    created_at: new Date("2023-10-04T07:12:00Z"),
    created_by: "admin",
    user_access: { maintainers: 1, developers: 3, guests: 12 },
    repositories: { total: 14, active: 14, deprecated: 0, disabled: 0, restricted: 0 }
  },
  {
    id: "ns_008",
    name: "security",
    is_public: false,
    type: "team",
    state: "active",
    description: "Internal security scanning tools and hardened images.",
    created_at: new Date("2023-09-18T10:00:00Z"),
    created_by: "bob",
    user_access: { maintainers: 3, developers: 5, guests: 0 },
    repositories: { total: 7, active: 6, deprecated: 1, disabled: 0, restricted: 5 }
  },
  {
    id: "ns_009",
    name: "openimage-examples",
    is_public: true,
    type: "project",
    state: "active",
    description: "Example images for demos and tutorials.",
    created_at: new Date("2024-04-01T09:55:00Z"),
    created_by: "admin",
    user_access: { maintainers: 1, developers: 1, guests: 50 },
    repositories: { total: 5, active: 5, deprecated: 0, disabled: 0, restricted: 0 }
  },
  {
    id: "ns_010",
    name: "legacy-services",
    is_public: false,
    type: "project",
    state: "disabled",
    description: "Legacy services pending removal.",
    created_at: new Date("2021-02-02T11:00:00Z"),
    created_by: "frank",
    user_access: { maintainers: 1, developers: 0, guests: 0 },
    repositories: { total: 6, active: 0, deprecated: 3, disabled: 3, restricted: 0 }
  },
  {
    id: "ns_011",
    name: "mobile-app",
    is_public: false,
    type: "team",
    state: "active",
    description: "Mobile application backend and UI assets.",
    created_at: new Date("2024-02-10T08:10:00Z"),
    created_by: "eva",
    user_access: { maintainers: 2, developers: 8, guests: 3 },
    repositories: { total: 11, active: 10, deprecated: 1, disabled: 0, restricted: 1 }
  },
  {
    id: "ns_012",
    name: "ai-ml",
    is_public: false,
    type: "project",
    state: "active",
    description: "Images for machine learning workflows.",
    created_at: new Date("2023-11-11T11:11:00Z"),
    created_by: "alice",
    user_access: { maintainers: 3, developers: 15, guests: 5 },
    repositories: { total: 20, active: 18, deprecated: 1, disabled: 1, restricted: 4 }
  },
  {
    id: "ns_013",
    name: "go-runtime",
    is_public: true,
    type: "project",
    state: "active",
    description: "Golang build and runtime base images.",
    created_at: new Date("2024-01-01T00:00:00Z"),
    created_by: "admin",
    user_access: { maintainers: 1, developers: 3, guests: 30 },
    repositories: { total: 10, active: 10, deprecated: 0, disabled: 0, restricted: 0 }
  },
  {
    id: "ns_014",
    name: "proxy-cache",
    is_public: false,
    type: "project",
    state: "active",
    description: "Cached images from external registries.",
    created_at: new Date("2024-02-22T16:05:00Z"),
    created_by: "system",
    user_access: { maintainers: 2, developers: 0, guests: 0 },
    repositories: { total: 100, active: 100, deprecated: 0, disabled: 0, restricted: 100 }
  },
  {
    id: "ns_015",
    name: "qa-testing",
    is_public: false,
    type: "team",
    state: "active",
    description: "Temporary images used for QA testing.",
    created_at: new Date("2024-03-17T09:30:00Z"),
    created_by: "dave",
    user_access: { maintainers: 1, developers: 12, guests: 2 },
    repositories: { total: 40, active: 35, deprecated: 3, disabled: 2, restricted: 5 }
  }
];

const NameColumnTemplate = (ns: NamespaceInfo) => {

  const opRef = useRef<OverlayPanel>(null);
  const toolTipTarget = `ns-${ns.name}-repo-stats`

  return (
    <React.Fragment>
      <div className={`flex flex-row align-items-center gap-2 cursor-pointer ${toolTipTarget}`} >
        {ns.state == 'active' && <div className='status-circle status-active' />}
        {ns.state == 'disabled' && <div className='status-circle status-disabled' />}
        {ns.state == 'deprecated' && <div className='status-circle status-deprecated' />}
        <div>{ns.name}</div>
        {ns.is_public && <Chip className='pl-2 pr-2 p-0  bg-white border-600 border-1' style={{ fontSize: '0.60rem' }} label='public' />}
      </div>
      <Tooltip target={'.' + toolTipTarget}>
        <div className=''>
          TODO: Show Repository Stats
        </div>
      </Tooltip>
    </React.Fragment>
  );
};

const NamespaceAccessPage = () => {

  const [showCreateNamespaceDialog, setShowCreateNamespaceDialog] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleManageAccess = (id: string) => {
    navigate("/console/access-management/namespaces/" + id)
  }

  const handleFilter = (options: string[]) => { }

  return (
    <div className="flex flex-column p-2 pt-4 gap-3 ">
      <div className="bg-white border-round-lg flex flex-column gap-2">
        <div className="flex flex-column pt-2 gap-2">
          <div className="flex flex-row justify-content-between">
            <div className="pl-3 font-semibold text-lg">Namespaces</div>
            <div className="pr-2 flex flex-row justify-content-end gap-2  text-xs w-4">
              <Button
                size="small"
                className="p-2 m-0 border-1 border-solid border-round-lg border-teal-100 text-xs"
                onClick={() => setShowCreateNamespaceDialog((c) => !c)}
              >
                <span className="pi pi-plus text-xs"></span>
                &nbsp;&nbsp;
                <span>Create Namespace</span>
              </Button>

              <Button
                size="small"
                outlined
                className="p-0 m-0 border-1 border-solid border-round-lg border-teal-100  text-xs flex-grow-1"
              >
                <InputText
                  size="10"
                  type="text"
                  className="border-none p-2 text-sm"
                  placeholder="Search namespaces . . . ."
                // onChange={handleSearch}
                />
                <i className="pi pi-search text-teal-400 text-sm pr-2 "></i>
              </Button>
            </div>
            {/* <div className="text-xs pr-2">245 users found</div> */}
          </div>
          <div className="flex flex-row align-items-center pl-3 pr-2 ">
            <div className=" text-sm"> Select Filter</div>
            <ChipsFilter filterOptions={NAMESPACE_FILTER_OPTIONS}
              handleFilterChange={handleFilter}
            />
          </div>
        </div>
        <DataTable
          value={mockNamespaces}
          paginator
          rows={8}
          totalRecords={15}
          paginatorLeft={<div className="text-xs">{15} namespaces found</div>}
        // onPage={handlePagination}
        >
          <Column header="Name" body={NameColumnTemplate} sortable />
          <Column header="Type" field='type' />
          <Column header="Maintainers" body={(ns: NamespaceInfo) => {
            return (<div className='flex flex-row align-items-end gap-1'>

              <span>john, supun,</span>
              <span className='pi pi-ellipsis-h cursor-pointer text-blue-600 text-xs'></span>
            </div>)
          }} />

          <Column header="Developers" body={(ns: NamespaceInfo) => {
            return (<div className='flex flex-row align-items-end gap-1'>

              <span>john, supun,</span>
              <span className='pi pi-ellipsis-h cursor-pointer text-blue-600 text-xs'></span>
            </div>)
          }} />

          {/* <Column header="Repository" body={RepoColumnTemplate} /> */}
          {/* <Column header="Access" body={AccessColumnTemplate} /> */}
          <Column header="Created At" sortable body={(ns: NamespaceInfo) => ns.created_at?.toUTCString()} />

          <Column body={(ns: NamespaceInfo) => <Button
            className="border-round-3xl border-1 text-sm"
            outlined
            size="small"
            onClick={() => handleManageAccess(ns.id)}
          >
            <span className="pi pi-wrench text-sm"></span>
            &nbsp;&nbsp;
            <span className='text-sm'>Access</span>
          </Button>} />
        </DataTable>
        <CreateNamespaceDialog visible={showCreateNamespaceDialog} hideCallback={() => setShowCreateNamespaceDialog(false)} />
      </div>
    </div>
  );
}

export default NamespaceAccessPage;