import React, { useEffect, useRef, useState } from "react";
import { TableColumnFilterState, TableFilterSearchPaginationSortState, UserAccountInfo } from "../../types/app_types";
import {
  DataTable,
  DataTableStateEvent,
} from "primereact/datatable";
import { Column, ColumnSortEvent } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import HttpClient from "../../client";
import ChipsFilter from "../../components/ChipsFilter";
import CreateUserAccountDialog from "../../components/CreateUserAccount";
import { useToast } from "../../components/ToastComponent";
import UserAccountView from "../../components/UserAccountView";
import { USERS_FILTER_OPTIONS } from "../../config/table_filter";

const AccountStatusBodyTemplate = (user: UserAccountInfo) => {
  const lockOpref = useRef<OverlayPanel>(null);
  const incompleteOpRef = useRef<OverlayPanel>(null);
  const activeOpRef = useRef<OverlayPanel>(null);

  return (
    <React.Fragment>
      {user.locked && (
        <span
          className="p-1 cursor-pointer"
          onClick={(e) => {
            lockOpref.current?.toggle(e);
          }}
        >
          <span className="pi pi-lock text-sm text-red-500 cursor-pointer"></span>
          <OverlayPanel ref={lockOpref}>
            <div className="bg-white  flex flex-column gap-2 text-xs">
              <div className="font-semibold">User Account was locked for:</div>
              <div className="">{user.locked_reason}</div>
              {!user.locked_reason.includes("New") && <div className="flex w-full justify-content-end">
                <Button size="small" className="text-xs p-1 m-0">
                  Unlock
                </Button>
              </div>}

              {!user.password_recovery_reason.includes("New") && (<React.Fragment>
                <div className="font-semibold">
                  Password Recovery is in progress:
                </div>
                <div>
                  {user.password_recovery_reason}
                </div>
              </React.Fragment>)}
            </div>

          </OverlayPanel>
        </span>
      )}
      {!user?.locked && !user?.password_recovery_id && (
        <span
          className="p-1 cursor-pointer"
          onClick={(e) => {
            activeOpRef.current?.toggle(e);
          }}
        >
          <span className="pi pi-verified text-sm text-teal-500 cursor-pointer"></span>
          <OverlayPanel ref={activeOpRef}>
            <div className="bg-white  flex flex-column gap-2 text-xs">
              <div className="font-semibold">
                Verified User account. Created at
              </div>
              <div className="">{user.created_at.toUTCString()}</div>
              <div className="flex w-full justify-content-end">
                <Button
                  size="small"
                  severity="danger"
                  className="text-xs p-1 m-0"
                >
                  Lock
                </Button>
              </div>
            </div>
          </OverlayPanel>
        </span>
      )}
      {!user?.locked && user?.password_recovery_id && (
        <span
          className="p-1 cursor-pointer"
          onClick={(e) => {
            incompleteOpRef.current?.toggle(e);
          }}
        >
          <span className="pi pi-exclamation-circle text-yellow-500 cursor-pointer"></span>
          <OverlayPanel ref={incompleteOpRef}>
            <div className="bg-white  flex flex-column gap-2 text-xs">
              <div className="font-semibold">
                Password Recovery is in-progress:
              </div>
              <div className="">{user.password_recovery_reason}</div>
              <div className="flex w-full justify-content-end">
                <Button
                  size="small"
                  severity="danger"
                  className="text-xs p-1 m-0"
                >
                  Lock
                </Button>
              </div>
            </div>
          </OverlayPanel>
        </span>
      )}
    </React.Fragment>
  );
};


const UsernameColumnBodyTemplate = (user: UserAccountInfo, hideCallBack: (reloadUsers: boolean) => void) => {
  const [showUserAccountView, setShowUserAccountView] =
    useState<boolean>(false);
  return (
    <div>
      <span
        className="text-blue-600 cursor-pointer hover:underline"
        onClick={() => setShowUserAccountView((c) => !c)}
      >
        {user.username}
      </span>
      <UserAccountView
        visible={showUserAccountView}
        account={user}
        hideCallback={() => {
          setShowUserAccountView(c => !c);
          hideCallBack(true);
        }}
      />
    </div>
  );
};

const UserAdministrationPage = () => {
  const [showUserAccountView, setShowUserAccountView] =
    useState<boolean>(false);

  const [showCreateUserAccountDialog, setShowCreateUserAccountDialog] =
    useState<boolean>(false);

  const [filterSortPagSearchState, setFilterSortPagSearchState] = useState<TableFilterSearchPaginationSortState<UserAccountInfo>>({
    pagination: {
      page: 1,
      limit: 8,
    },
    sort: {
      key: "username",
      order: 1
    }
  })

  const [talbeData, setTableData] = useState<UserAccountInfo[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);

  const { showError } = useToast();
  const [showProgressView, setShowProgressView] = useState<boolean>(false);

  // this will load data on filter, sort, page events and search
  useEffect(() => {
    loadUsers();

  }, [filterSortPagSearchState]);

  const handleDialogHide = (reloadUsers: boolean) => {
    if (reloadUsers) {
      loadUsers();
    }

    setShowCreateUserAccountDialog(false);
    setShowUserAccountView(false);
  }

  const loadUsers = () => {
    HttpClient.getInstance("http://localhost:8000/api/v1")
      .getUsersList(filterSortPagSearchState)
      .then((data) => {
        if (data.error) {
          showError(data.error);
          setTimeout(() => {
            setShowProgressView(false);
          }, 200);
          return;
        }

        setTotalEntries(data.total);

        for (let i = 0; i < (data.total - data.users.length); i++) {
          data.users.push({} as UserAccountInfo) // adding fake data for showing pagination properly
        }
        setTableData(data.users);
        setTimeout(() => {
          setShowProgressView(false);
        }, 200);
      })
      .catch((err) => {
        showError("Unexpected error occurred!");
        setTimeout(() => {
          setShowProgressView(false);
        }, 150);
      });
  }


  const handleFilter = (options: string[]) => {
    const roles: string[] = [];
    const statuses: string[] = [];

    const filters: TableColumnFilterState<UserAccountInfo>[] = [];

    options.forEach(v => {
      if (v.startsWith("Role:")) {
        roles.push(v.slice("Role:".length))
      }
      if (v.includes("Status:")) {
        statuses.push(v.slice("Status:".length))
      }
    });
    if (roles.length < USERS_FILTER_OPTIONS.map(v => v.value.startsWith("Role:")).length) {
      const roleFilter = {
        key: "role" as keyof UserAccountInfo,
        values: roles,
      }
      filters.push(roleFilter)
    }
    if (statuses.length == 1) {
      const statusFilter = {
        key: "locked" as keyof UserAccountInfo,
        values: [statuses[0] == "locked" ? true : false]
      }
      filters.push(statusFilter);
    }
    setFilterSortPagSearchState((s: TableFilterSearchPaginationSortState<UserAccountInfo>) => {
      return {
        ...s,
        filters: filters
      }
    })
  }

  const handleSort = (event: DataTableStateEvent) => {
    //event.sortOder always 1

    setFilterSortPagSearchState((s: TableFilterSearchPaginationSortState<UserAccountInfo>) => {
      let newSortOrder: 1 | 0 | -1 = 0
      if (s.sort?.key == event.sortField) {

        if (s.sort?.order == 1) {
          newSortOrder = -1
        } else if (s.sort?.order == -1) {
          newSortOrder = 1
        }
      } else {
        newSortOrder = 1
      }

      const newSort = {
        key: event.sortField as keyof UserAccountInfo,
        order: newSortOrder,
      };
      if (s) {
        return {
          ...s,
          sort: newSort,

        }
      }

      return {
        sort: newSort,
        pagination: {
          page: 1,
          limit: 8,
        },
      };
    });
  }

  const handlePagination = (event: DataTableStateEvent) => {
    // DataTableStateEvent.page starts from zero. But our filter's page starts from 1;
    setFilterSortPagSearchState((s: TableFilterSearchPaginationSortState<UserAccountInfo>) => {
      return {
        ...s,
        pagination: {
          page: event.page ? event.page + 1 : 1,
          limit: event.pageCount ? event.pageCount : 8,
        }
      }
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // adding a small delay
    setTimeout(() => {
      setFilterSortPagSearchState((s: TableFilterSearchPaginationSortState<UserAccountInfo>) => {
        if (e.target.value) {
          return {
            ...s,
            search_value: e.target.value,
          }
        } else {
          return {
            ...s,
            search_value: undefined,
          }
        }

      })
    }, 100);
  }

  return (
    <div className="flex flex-column p-2 pt-4 gap-3 ">
      <div className="bg-white border-round-lg flex flex-column gap-2">
        <div className="flex flex-column pt-2 gap-2">
          <div className="flex flex-row justify-content-between">
            <div className="pl-3 font-semibold text-lg">Users</div>
            <div className="pr-2 flex flex-row justify-content-end gap-2  text-xs w-4">
              <Button
                size="small"
                className="p-2 m-0 border-1 border-solid border-round-lg border-teal-100 text-xs"
                onClick={() => setShowCreateUserAccountDialog((c) => !c)}
              >
                <span className="pi pi-plus text-xs"></span>
                &nbsp;&nbsp;
                <span>Create User</span>
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
                  placeholder="Search users . . . ."
                  onChange={handleSearch}
                />
                <i className="pi pi-search text-teal-400 text-sm pr-2 "></i>
              </Button>
            </div>
            {/* <div className="text-xs pr-2">245 users found</div> */}
          </div>
          <div className="flex flex-row align-items-center pl-3 pr-2 ">
            <div className=" text-sm"> Select Filter</div>
            <ChipsFilter filterOptions={USERS_FILTER_OPTIONS} handleFilterChange={handleFilter} />
          </div>
        </div>
        <DataTable
          value={talbeData}
          paginator
          rows={filterSortPagSearchState.pagination.limit}
          totalRecords={totalEntries}
          paginatorLeft={<div className="text-xs">{totalEntries} users found</div>}
          onPage={handlePagination}
          onSort={handleSort}
        >
          <Column body={AccountStatusBodyTemplate} />
          <Column
            field="username"
            header="Username"
            body={(data) => UsernameColumnBodyTemplate(data as UserAccountInfo, handleDialogHide)}
            sortable
          // sortFunction={handleSort}
          />

          <Column field="email" header="Email" sortable />
          <Column field="role" header="Role" sortable />
          <Column field="display_name" header="Display Name" sortable />
          <Column
            field="last_loggedin_at"
            header="Last Logged In"
            sortable
            body={(user: UserAccountInfo) => {
              return user.last_loggedin_at?.toUTCString();
            }}
          />
        </DataTable>
        <CreateUserAccountDialog
          visible={showCreateUserAccountDialog}
          hideCallback={handleDialogHide}
        />
      </div>
    </div>
  );
};

export default UserAdministrationPage;