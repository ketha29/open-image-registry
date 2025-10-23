import { Sidebar } from "primereact/sidebar";
import React, { useEffect, useRef, useState } from "react";
import LogoComponent from "./LogoComponent";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import AdminPanelMenuList, { MenuItem } from "./AdminPanelMenu";
import UserAdministrationComponent from "./UserAdministration";
import { BreadCrumb } from "primereact/breadcrumb";

export type AdminPanelProps = {
  visible: boolean;
  hideCallback: React.Dispatch<React.SetStateAction<boolean>>;
};

const menus: MenuItem[] = [
  {
    name: "USER MANAGEMENT",
    key: "user-management",
    nav_link: "/administration/user-management",
    description: "Manage users, invitations, and monitor user activity",
    icon_class: "pi-users",
    collapsed: true,
    children: [
      {
        name: "Users",
        key: "users",
        nav_link: "/administration/user-management/users",
        description: "Manage user accounts, roles, and permissions",
        children: [],
      },
      {
        name: "Invitations",
        key: "invitations",
        nav_link: "/administration/user-management/invitations",
        description: "Send and manage user invitations to the registry",
        children: [],
      },
      {
        name: "Activity Log",
        key: "activity-log",
        nav_link: "/administration/user-management/activity-log",
        description: "View system activity, user actions, and audit logs",
        children: [],
      },
    ],
  },
  {
    name: "ACCESS MANAGEMENT",
    key: "access-management",
    nav_link: "/administration/access-management",
    description: "Configure namespaces, repositories, and upstream registries",
    icon_class: "pi-shield",
    children: [
      {
        name: "Namespaces",
        key: "namespaces",
        nav_link: "/administration/access-management/namespaces",
        description: "Organize and manage namespaces for your repositories",
        children: [],
      },
      {
        name: "Repositories",
        key: "repositories",
        nav_link: "/administration/access-management/repositories",
        description: "Configure and manage image repositories",
        children: [],
      },
      {
        name: "Upstreams",
        key: "upstreams",
        nav_link: "/administration/access-management/upstreams",
        description:
          "Configure upstream registry connections for proxy caching",
        children: [],
      },
    ],
  },
  {
    name: "INTEGRATION",
    key: "integration",
    nav_link: "/administration/integration",
    description: "Configure authentication providers and external integrations",
    icon_class: "pi-ticket",
    children: [
      {
        name: "LDAP",
        key: "ldap",
        nav_link: "/administration/ldap",
        description: "Configure LDAP authentication and user synchronization",
        children: [],
      },
      {
        name: "SSO",
        key: "sso",
        nav_link: "/administration/sso",
        description: "Configure Single Sign-On with OAuth2/OIDC providers",
        children: [],
      },
    ],
  },
  {
    name: "JOBS",
    key: "jobs",
    nav_link: "/administration/jobs",
    description: "Schedule and monitor automated maintenance tasks",
    icon_class: "pi-objects-column",
    children: [
      {
        name: "Cache Cleanup",
        key: "cache-cleanup",
        nav_link: "/administration/jobs/cache-cleanup",
        description: "Configure and schedule cache cleanup jobs",
        children: [],
      },
      {
        name: "Storage Cleanup",
        key: "storage-cleanup",
        nav_link: "/administration/jobs/storage-cleanup",
        description: "Configure and schedule storage cleanup jobs",
        children: [],
      },
      {
        name: "Manual Jobs",
        key: "manual-jobs",
        nav_link: "/administration/jobs/manual",
        description: "Run and monitor manual maintenance jobs",
        children: [],
      },
    ],
  },
  {
    name: "ANALYTICS",
    key: "analytics",
    nav_link: "/administration/analytics",
    description: "Monitor system performance, usage, and health metrics",
    icon_class: "pi-wave-pulse",
    children: [
      {
        name: "Storage",
        key: "storage-analytics",
        nav_link: "/administration/analytics/storage",
        description: "View storage usage statistics and trends",
        children: [],
      },
      {
        name: "Cache",
        key: "cache-analytics",
        nav_link: "/administration/analytics/cache",
        description: "View cache hit rates and performance metrics",
        children: [],
      },
      {
        name: "Errors",
        key: "errors-analytics",
        nav_link: "/administration/analytics/errors",
        description: "Monitor and analyze system errors and failures",
        children: [],
      },
      {
        name: "Garbage Collection",
        key: "garbage-collection",
        nav_link: "/administration/analytics/garbage-collection",
        description: "View garbage collection status and history",
        children: [],
      },
    ],
  },
];

const AdminPanelComponent = (props: AdminPanelProps) => {
  const handleClickBack = (hide: boolean) => {
    if (hide) {
      const timer = setTimeout(() => {
        props.hideCallback(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  };

  const [selectedMenu, setSelectedMenu] = useState<string>(
    menus[0].children[0].key
  );

  const refDivider = useRef<Divider>(null);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  const calculateHeight = () => {
    if (refDivider.current) {
      if (!refDivider.current.getElement()) {
        return;
      }
      // Get the position and size of the element
      const rect = refDivider.current.getElement()?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const elementY = rect?.y; // distance from top of viewport
      const elementHeight = rect?.height; // element height

      // Remaining height = total viewport height - element's bottom
      const remainingHeight = window.innerHeight - (elementY + elementHeight);
      setScrollHeight(remainingHeight);
    }
  };

  const menuCollapsed = () => {
    calculateHeight();
  };

  useEffect(() => {
    // Calculate on mount
    calculateHeight();

    // Recalculate on window resize
    window.addEventListener("resize", calculateHeight);

    // Cleanup
    return () => {
      window.removeEventListener("resize", calculateHeight);
    };
  });

  return (
    <Sidebar
      position="left"
      visible={props.visible}
      onHide={() => props.hideCallback(false)}
      showCloseIcon={false}
      header={
        <div className="flex flex-column w-full pt-2 m-0">
          <div className="flex flex-row justify-content-between w-full">
            <div>
              <LogoComponent showNameInOneLine={false} />
            </div>
            <div className="flex-grow-1 flex justify-content-center align-items-center font-semibold text-lg">
              Control Panel
            </div>
            <div className="flex align-items-center pr-3">
              <Button
                className="border-round-3xl border-1"
                outlined
                size="small"
                onClick={() => props.hideCallback(true)}
              >
                <span className="pi pi-chevron-left"></span>
                &nbsp;&nbsp;
                <span>Back</span>
              </Button>
            </div>
          </div>
          <Divider className="p-0 m-0" ref={refDivider} />
        </div>
      }
      style={{ width: "100vw" }}
    >
      <div className="flex flex-row  p-0 m-0 h-full">
        <div
          className="flex-grow-0 shadow-1 h-full flex flex-column justify-content-between pt-4"
          style={{ width: "20%" }}
        >
          <div
            style={
              scrollHeight
                ? {
                    overflowY: "auto",
                    maxHeight: `${scrollHeight * 0.9}px`,
                  }
                : {}
            }
          >
            <AdminPanelMenuList
              menus={menus}
              selectMenu={(menuKey) => setSelectedMenu(menuKey)}
              selectedMenuKey={selectedMenu}
              menuCollapsed={menuCollapsed}
            />
          </div>
          <div className="flex justify-content-between align-items-center p-2 text-xs border-top-1 surface-border">
            <div className="flex align-items-center">
              <span className="pi pi-github"></span>
              &nbsp;&nbsp;
              <span>Open Image Registry</span>
            </div>
            <div className="flex align-items-center">
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
        <Divider className="p-0 m-0" layout="vertical" />
        <div
          className="flex-grow-1 surface-100 flex flex-column p-2"
          style={
            scrollHeight
              ? {
                  overflowY: "auto",
                  maxHeight: `${scrollHeight}px`,
                }
              : {}
          }
        >
          <div>
            <BreadCrumb
              model={[
                { label: "Admin Panel" },
                { label: "User Management" },
                { label: "Users" },
              ]}
              className="surface-100 border-none text-sm p-0 pt-1 pl-2 m-0"
            />
          </div>
          <div className="w-full h-full">
            {selectedMenu == "users" && <UserAdministrationComponent />}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AdminPanelComponent;
