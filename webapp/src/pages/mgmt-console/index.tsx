import React from 'react';
import ConsoleWrapper from '../../components/ConsoleWrapper';
import {
  MGMT_CONSOLE_BASE_PATH,
  MGMT_CONSOLE_DEFAULT_PATH,
  MGMT_CONSOLE_MENUS,
  MGMT_MENU_KEY_NAV_LINKS,
} from '../../config/menus';

const ManagmentConsole = () => {
  return (
    <ConsoleWrapper
      basePath={MGMT_CONSOLE_BASE_PATH}
      defaultPath={MGMT_CONSOLE_DEFAULT_PATH}
      menus={MGMT_CONSOLE_MENUS}
      menuKeyLinkMap={MGMT_MENU_KEY_NAV_LINKS}
    />
  );
};

export default ManagmentConsole;
