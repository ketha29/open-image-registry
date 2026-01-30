import React, { useState } from 'react';
import './login.css';
import LogoComponent from '../components/LogoComponent';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { useNavigate } from 'react-router-dom';
import { postAuthLogin } from '../api';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    // Mark fields as touched for validation
    setTouched({ username: true, password: true });

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password');
      return;
    }

    setProcessing(true);
    setErrorMsg('');

    const { data, error } = await postAuthLogin({
      body: {
        username,
        password,
      },
    });

    setProcessing(false);

    if (error) {
      setErrorMsg(error.error_message);
      return;
    }

    if (data) {
      navigate('/');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const isFormValid = () => {
    return username.trim() !== '' && password.trim() !== '';
  };

  return (
    <div className="flex flex-row min-h-screen max-h-screen overflow-hidden">
      {/* Left Side: Animation */}
      <div className="hidden lg:flex lg:w-6 flex-column login-left-container bg-bluegray-50">
        <div className="animation-container w-full" style={{ height: '70vh' }}>
          {/* Sky with clouds */}
          <div className="sky">
            <div className="cloud cloud1"></div>
            <div className="cloud cloud2"></div>
          </div>

          {/* Floating Particles */}
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          {/* Seagulls */}
          <div className="seagull seagull1"></div>
          <div className="seagull seagull2"></div>

          {/* Water */}
          <div className="water">
            <div className="wave"></div>
          </div>

          {/* Dock */}
          <div className="dock"></div>

          {/* Ship with containers */}
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

          {/* Crane */}
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

          {/* Harbor storage containers */}
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
        <div className="flex justify-content-center align-items-end" style={{ height: '30vh' }}>
          <div className="text-center pb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Registry</h2>
            <p className="text-sm text-white-alpha-80">Secure image management made simple</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-6 bg-offwhite flex align-items-center justify-content-center p-4 relative">
        {/* Loading Overlay */}
        {processing && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 flex align-items-center justify-content-center bg-white"
            style={{
              zIndex: 1000,
              opacity: 0.95,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="flex flex-column align-items-center gap-3">
              <ProgressSpinner
                style={{ width: '50px', height: '50px' }}
                strokeWidth="4"
                pt={{
                  circle: {
                    className: 'text-teal-500',
                  },
                }}
              />
              <span className="text-sm text-gray-600">Signing you in...</span>
            </div>
          </div>
        )}

        <div
          className="flex flex-column bg-white p-4 border-1 border-100 border-round-3xl"
          style={{ maxWidth: '450px', width: '100%' }}
        >
          {/* Header */}
          <div className="flex justify-content-center mb-3">
            <LogoComponent showNameInOneLine={true} />
          </div>

          <div className="min-h-3rem mb-3">
            {errorMsg && (
              <div className="p-2 border-round bg-red-50 border-1 border-red-200 text-red-700 text-xs">
                <i className="pi pi-exclamation-circle mr-2 text-xs" />
                {errorMsg}
              </div>
            )}
            {!errorMsg && (
              <p className="text-center text-700 text-lg uppercase letter-spacing-1">
                Welcome Back
              </p>
            )}
          </div>

          <Divider className="m-0 mb-3" />

          {/* Login Form */}
          <div className="flex flex-column gap-3">
            {/* Username */}
            <div className="flex flex-column gap-1">
              <label className="text-xs font-bold text-700 ml-1 required" htmlFor="login-username">
                Username
              </label>
              <InputText
                id="login-username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                onBlur={() => setTouched({ ...touched, username: true })}
                onKeyPress={handleKeyPress}
                placeholder="Enter your username"
                autoComplete="username"
                className={classNames('p-inputtext-sm border-round-3xl', {
                  'p-invalid': touched.username && !username.trim(),
                })}
                pt={{
                  root: {
                    className:
                      'text-sm p-3 py-2 border-1 border-gray-200 hover:border-gray-300 focus:border-teal-500',
                    style: {
                      transition: 'all 0.2s ease',
                    },
                  },
                }}
              />
              {touched.username && !username.trim() && (
                <small className="text-red-500 text-xs ml-2">Username is required</small>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-column gap-1">
              <label className="text-xs font-bold text-700 ml-1 required" htmlFor="login-password">
                Password
              </label>
              <InputText
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                onBlur={() => setTouched({ ...touched, password: true })}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={classNames('p-inputtext-sm border-round-3xl', {
                  'p-invalid': touched.password && !password.trim(),
                })}
                pt={{
                  root: {
                    className:
                      'text-sm p-3 py-2 border-1 border-gray-200 hover:border-gray-300 focus:border-teal-500',
                    style: {
                      transition: 'all 0.2s ease',
                    },
                  },
                }}
              />
              {touched.password && !password.trim() && (
                <small className="text-red-500 text-xs ml-2">Password is required</small>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-content-between align-items-center mt-1">
              <div className="flex align-items-center">
                <Checkbox
                  checked={rememberMe}
                  inputId="remember_me"
                  onChange={(e) => setRememberMe(Boolean(e.checked))}
                  pt={{
                    root: {
                      className: 'border-round',
                    },
                  }}
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 text-xs text-gray-700 cursor-pointer"
                  style={{ userSelect: 'none' }}
                >
                  Remember me
                </label>
              </div>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    console.log('Forgot password clicked');
                  }
                }}
                className="text-xs cursor-pointer text-teal-600 hover:text-teal-700 font-medium"
                style={{ transition: 'color 0.2s ease' }}
                onClick={() => {
                  console.log('Forgot password clicked');
                }}
              >
                Forgot Password?
              </div>
            </div>

            {/* Sign In Button */}
            <div className="mt-2">
              <Button
                label="Sign In"
                icon="pi pi-sign-in"
                className="w-full p-button-sm border-round-3xl"
                disabled={!isFormValid() || processing}
                onClick={handleLogin}
                pt={{
                  root: {
                    className: 'font-semibold',
                    style: {
                      transition: 'all 0.2s ease',
                    },
                  },
                }}
              />
            </div>

            {/* Additional Options */}
            <Divider className="m-0 mt-2">
              <span className="text-xs text-gray-500">or</span>
            </Divider>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-xs text-gray-600">
                Don't have an account?{' '}
                <span
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      console.log('Forgot password clicked');
                    }
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  style={{ transition: 'color 0.2s ease' }}
                  onClick={() => {
                    // Handle sign up navigation
                    console.log('Sign up clicked');
                  }}
                >
                  Contact your administrator
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
