import React, { useState } from "react";
import accountsetup from "./../assets/account-setup1.png";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import LogoComponent from "../components/LogoComponent";
import "./login.css";

const NEW_ACCOUNT_SETUP_PATH_PATTERN = "/account-setup/:ref_id";

const NewAccountSetupPage = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [timerCountDown, setTimerCountDown] = useState<number>(30);

  return (
    <div className="flex flex-row min-h-screen max-h-screen">
      <div className="w-6 flex-column  login-left-container backdrop-blur-3xl!">
        <div
          className="animation-container w-full backdrop-blur-2xl!"
          style={{ maxHeight: "60vh" }}
        >
          <div className="sky">
            <div className="cloud cloud1"></div>
            <div className="cloud cloud2"></div>
          </div>

          <div className="seagull seagull1"></div>
          <div className="seagull seagull2"></div>

          <div className="water">
            <div className="wave"></div>
          </div>

          <div className="dock"></div>

          <div className="ship">
            <div className="ship-smoke">
              <div className="smoke-puff"></div>
              <div className="smoke-puff"></div>
              <div className="smoke-puff"></div>
            </div>
            <div className="ship-chimney"></div>
            <div className="ship-containers">
              <div className="container-stack">
                <div className="mini-container"></div>
                <div className="mini-container"></div>
              </div>
              <div className="container-stack">
                <div className="mini-container"></div>
                <div className="mini-container"></div>
              </div>
            </div>
            <div className="ship-cabin"></div>
            <div className="ship-body"></div>
          </div>

          <div className="crane">
            <div className="crane-base"></div>
            <div className="crane-tower">
              <div className="crane-arm">
                <div className="crane-hook">
                  <div className="crane-container"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="harbor-storage">
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
            <div className="stored-container"></div>
          </div>
        </div>
        <div
          className="flex flex-row justify-content-end"
          style={{ maxHeight: "40vh" }}
        >
          <img
            src={accountsetup}
            style={{ maxHeight: "40vh" }}
            className="flex-grow-1"
          />
        </div>
      </div>
      <div className="w-6 flex align-items-center justify-content-center relative">
        {/* {showBackdrop && (
          <div
            className="fixed top-0 left-50 bottom-0 h-full w-6 surface-50 opacity-70 flex align-items-center justify-content-center"
            style={{ zIndex: 1000 }}
          >
            <div className="flex flex-column align-items-center">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            </div>
          </div>
        )} */}

        <div className="flex flex-column">
          <div className="flex flex-row justify-content-center gap-2 pb-2">
            <span
              className="text-green-300"
              style={{
                // fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
              }}
            >
              Let's
            </span>
            <span
              style={{
                // fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
                color: "#007700",
              }}
            >
              COMPLETE
            </span>
            <span
              className="text-green-300"
              style={{
                // fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
              }}
            >
              Onboarding!
            </span>
          </div>
          <LogoComponent showNameInOneLine={true} />
          <div className="flex flex-row justify-content-center text-color font-medium text-sm pb-3 pt-4">
            Check details and enter valid password!
          </div>
          <div className="flex flex-column gap-4">
            <div className="flex flex-column gap-2">
              <label htmlFor="email" className="text-color font-medium text-md">
                Email
              </label>
              <InputText
                id="email"
                disabled
                size={45}
                value={"sankeerthan@test.com"}
              // onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="role" className="text-color font-medium text-md">
                Role
              </label>
              <InputText
                id="role"
                disabled
                size={45}
                value={"Maintainer"}
              // onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label
                htmlFor="username"
                className="text-color font-medium text-md required"
              >
                Username
              </label>
              <InputText
                id="username"
                size={45}
                value={"sankeerthan"}
              // onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label
                htmlFor="displayname"
                className="text-color font-medium text-md required"
              >
                Display Name
              </label>
              <InputText
                id="displayname"
                size={45}
                value={"Sankeerthan"}
              // onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label
                htmlFor="password"
                className="text-color font-medium text-md required"
              >
                New Password
              </label>
              <InputText
                type="password"
                id="password"
                size={45}
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label
                htmlFor="password"
                className="text-color font-medium text-md required"
              >
                Re-enter Password
              </label>
              <InputText
                type="password"
                id="password"
                size={45}
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Button
                className="w-full flex justify-content-center"
                raised
                size="small"
              // onClick={handleLogin}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAccountSetupPage;