import React from "react";
import { Outlet } from "react-router-dom";
import logo from "./../assets/logo.png";

const RootLayout = () => {
  return (
    <div className="flex flex-column min-h-screen max-h-screen">
      <div className="flex-grow-0  h-5rem w-screen flex flex-row justify-content-betweenjustify-content-end align-items-center mr-4 gap-3">
        <div className="flex-grow-1 flex align-items-center	">
          <img src={logo} className="h-4rem" />
          <div className="flex flex-column">
            <div
              className="text-green-300"
              style={{
                fontFamily: "Major Mono Display, monospace",
                fontSize: 18,
              }}
            >
              OPEN IMAGE
            </div>
            <div
              style={{
                fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
                color: "#007700",
              }}
            >
              REGISTRY
            </div>
          </div>
        </div>
        <div className="flex-grow-1 flex justify-content-end gap-3 pr-4 text-color">
          <div className="cursor-pointer" style={{ zIndex: 50 }}>
            Images
          </div>
          <div className="cursor-pointer" style={{ zIndex: 50 }}>
            Upstreams
          </div>
          <div className="cursor-pointer" style={{ zIndex: 50 }}>
            Settings
          </div>
        </div>
      </div>
      <div className="flex-grow-1 flex align-items-stretch">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
