import React from 'react';
import ConsoleWrapper from '../../components/ConsoleWrapper';
import {
  REG_CONSOLE_BASE_PATH,
  REG_CONSOLE_DEFAULT_PATH,
  REG_CONSOLE_MENUS,
  REG_MENU_KEY_NAV_LINKS,
} from '../../config/menus';

const RegistryConsole = () => {
  return (
    <ConsoleWrapper
      basePath={REG_CONSOLE_BASE_PATH}
      defaultPath={REG_CONSOLE_DEFAULT_PATH}
      menus={REG_CONSOLE_MENUS}
      menuKeyLinkMap={REG_MENU_KEY_NAV_LINKS}
    />
  );
};

export default RegistryConsole;
