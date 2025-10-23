import React, { useEffect, useState } from "react";
import "./login.css";
import LogoComponent from "../components/LogoComponent";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import HttpClient from "../client";
import { AuthLoginRequest, AuthLoginResponse } from "../types/request_response";
import { useToast } from "../components/ToastComponent";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showBackdrop, setShowBackdrop] = useState<boolean>(false);

  const [processing, setProcessing] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authenticated");
  }, []);

  useEffect(() => {
    if (!processing) {
      const timer = setTimeout(() => {
        setShowBackdrop(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setShowBackdrop(true);
    }
  }, [processing]);

  const handleLogin = () => {
    setProcessing(true);

    HttpClient.getInstance("http://localhost:8000/api/v1")
      .login({
        username,
        password,
        scopes: [],
      } as AuthLoginRequest)
      .then((data) => {
        setProcessing(false);
        if (data.success) {
          showSuccess("Login Successful! Redireting to home page ...");
          localStorage.setItem("authenticated", "true");
          navigate("/");
        } else {
          showError(data.error_message);
        }
      })
      .catch(() => {
        setProcessing(false);
        showError("Unexpected error occurred! Please try again!");
      });
  };

  return (
    <div className="flex flex-row min-h-screen max-h-screen">
      <div className="w-6 login-left-container">
        <div className="animation-container">
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
      </div>
      <div className="w-6 flex align-items-center justify-content-center relative">
        {showBackdrop && (
          <div
            className="fixed top-0 left-50 bottom-0 h-full w-6 surface-50 opacity-70 flex align-items-center justify-content-center"
            style={{ zIndex: 1000 }}
          >
            <div className="flex flex-column align-items-center">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            </div>
          </div>
        )}

        <div className="flex flex-column">
          <div className="flex flex-row justify-content-center gap-2">
            <span
              style={{
                // fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
                color: "#007700",
              }}
            >
              Welcome back
            </span>

            <span
              className="text-green-300"
              style={{
                // fontFamily: "Major Mono Display, monospace",
                fontSize: 20,
              }}
            >
              to
            </span>
          </div>
          <LogoComponent showNameInOneLine={true} />
          <div className="flex flex-row justify-content-center text-color font-medium text-sm">
            Complete authentication check!
          </div>
          <div className="p-4"></div>
          <div className="flex flex-column gap-4">
            <div className="flex flex-column gap-2">
              <label
                htmlFor="username"
                className="text-color font-medium text-md"
              >
                Username
              </label>
              <InputText
                id="username"
                size={45}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label
                htmlFor="password"
                className="text-color font-medium text-md"
              >
                Password
              </label>
              <InputText
                type="password"
                id="password"
                size={45}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-content-between">
              <div>
                <Checkbox
                  checked={rememberMe}
                  inputId="remember_me"
                  name="remember_me"
                  onChange={(e) =>
                    setRememberMe((currentValue) => !currentValue)
                  }
                />
                <label htmlFor="remember_me" className="ml-2 text-sm">
                  Remember me
                </label>
              </div>
              <div className="text-sm cursor-pointer text-teal-700 font-medium">
                Forgot Password?
              </div>
            </div>
            <div>
              <Button
                className="w-full flex justify-content-center"
                raised
                size="small"
                onClick={handleLogin}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;