import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import LogoComponent from '../components/LogoComponent';
import './login.css';
import { useToast } from '../components/ToastComponent';
import { validatePassword } from '../utils';
import { getOnboardingByUuid, postOnboardingByUuidComplete } from '../api';
import { useLoader } from '../components/loader';
import { Divider } from 'primereact/divider';

const NewAccountSetupPage = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [displayNameError, setDisplayNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordMatchError, setPasswordMatchError] = useState<string>('');

  const [timerCountDown, setTimerCountDown] = useState<number>(10);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password1, setPassword1] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);
  const [showRedirectMsg, setShowRedirectMsg] = useState<boolean>(false);
  const [touched, setTouched] = useState({
    displayName: false,
    password: false,
    password1: false,
  });

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { uuid } = useParams();
  const { showLoading, hideLoading } = useLoader();

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    let label = '';
    let color = '';
    if (score <= 2) {
      label = 'Weak';
      color = '#ef4444';
    } else if (score <= 4) {
      label = 'Medium';
      color = '#f59e0b';
    } else {
      label = 'Strong';
      color = '#10b981';
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!uuid) return;
      setGeneralError('');
      showLoading('Loading details...');
      const { data, error } = await getOnboardingByUuid({ path: { uuid } });
      hideLoading();

      if (error) {
        showError(error.error_message);
        setGeneralError(error.error_message);
        return;
      }
      if (data) {
        setUsername(data.username);
        setRole(data.role);
        setUserId(data.user_id);
        setDisplayName(data.display_name);
        setEmail(data.email);
      }
    };
    fetchOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    if (!touched.displayName) return;
    setDisplayNameError(!displayName?.trim() ? 'Display name is required' : '');
  }, [displayName, touched.displayName]);

  useEffect(() => {
    if (!touched.password || !password) {
      setPasswordError('');
      return;
    }
    const res = validatePassword(password);
    setPasswordError(res.isValid ? '' : res.msg);
  }, [password, touched.password]);

  useEffect(() => {
    if (!touched.password1 || !password1) {
      setPasswordMatchError('');
      return;
    }
    setPasswordMatchError(password !== password1 ? 'Passwords do not match' : '');
  }, [password, password1, touched.password1]);

  const isFormValid = () => {
    return (
      userId &&
      displayName.trim() !== '' &&
      password !== '' &&
      password === password1 &&
      validatePassword(password).isValid &&
      !generalError
    );
  };

  const handleUserAccountComplete = async () => {
    setTouched({ displayName: true, password: true, password1: true });
    if (!isFormValid()) return;

    showLoading('Finalizing account setup...');
    const { error } = await postOnboardingByUuidComplete({
      body: {
        user_id: userId,
        username,
        display_name: displayName,
        password,
        uuid: uuid as string,
      },
      path: { uuid: uuid as string },
    });
    hideLoading();

    if (error?.error_message) {
      showError(error.error_message);
      setGeneralError(error.error_message);
    } else {
      showSuccess('Account setup completed!');
      setCompleted(true);
      setShowRedirectMsg(true);
      let count = 10;
      const interval = setInterval(() => {
        count -= 1;
        setTimerCountDown(count);
        if (count <= 0) {
          clearInterval(interval);
          navigate('/login');
        }
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid()) {
      handleUserAccountComplete();
    }
  };

  const renderPasswordRequirements = () => {
    const requirements = [
      { met: password.length >= 12, text: 'At least 12 characters' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[0-9]/.test(password), text: 'One number' },
      { met: /[^a-zA-Z0-9]/.test(password), text: 'One special character' },
    ];

    return (
      <div className="">
        <div className="text-xs font-semibold text-gray-700 mb-2">Password Requirements</div>
        <div className="flex flex-column gap-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex align-items-center gap-2 text-xs">
              <i
                className={`pi ${req.met ? 'pi-check-circle text-green-600' : 'pi-circle text-gray-400'}`}
                style={{ fontSize: '0.75rem' }}
              />
              <span className={req.met ? 'text-green-700' : 'text-gray-600'}>{req.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
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

          {/* Floating Particles for atmosphere */}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Complete Your Profile</h2>
            <p className="text-sm text-white-alpha-80 px-4">
              Set up your account with a secure password to get started
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-6 bg-offwhite flex align-items-center justify-content-center p-4">
        <div
          className="flex flex-column bg-white p-4 border-1 border-100 border-round-3xl"
          style={{ maxWidth: '450px', width: '100%' }}
        >
          <div className="flex justify-content-center">
            <LogoComponent showNameInOneLine={true} />
          </div>

          <div className="min-h-3rem mt-2 mb-2">
            {generalError && (
              <div className="p-2 border-round bg-red-50 border-1 border-red-200 text-red-700 text-xs">
                <i className="pi pi-exclamation-circle mr-2 text-xs" />
                {generalError}
              </div>
            )}
            {showRedirectMsg && (
              <div className="p-2 border-round bg-green-50 border-1 border-green-200 text-green-700 text-xs">
                <i className="pi pi-check-circle mr-2 text-xs" />
                <div className="flex flex-column gap-1">
                  <span>Account setup completed successfully!</span>
                  <span>Redirecting to Login in {timerCountDown} seconds...</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate('/login');
                      }
                    }}
                    className="text-teal-600 cursor-pointer hover:text-teal-700 font-medium mt-1"
                    onClick={() => navigate('/login')}
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    Click here to login now →
                  </span>
                </div>
              </div>
            )}
            {!generalError && !completed && !showRedirectMsg && (
              <p className="text-center text-700 text-lg uppercase letter-spacing-1">
                Complete your profile
              </p>
            )}
          </div>

          <div className="flex flex-column gap-3">
            {/* Read-only Info Card */}
            <Divider layout="horizontal" className="px-1 m-0" />
            <div className="p-3 pb-1 border-round-xl grid grid-nogutter border-none border-100">
              <div className="col-8 mb-2">
                <label className="text-sm text-500 block pb-1" htmlFor="signup-email">
                  <i className="pi pi-envelope text-xs text-500 mr-2" />
                  Email Address
                </label>
                <span id="signup-email" className="text-sm font-medium text-700 line-height-1">
                  {email || 'N/A'}
                </span>
              </div>
              <div className="col-4 mb-2">
                <label className="text-sm text-500 block pb-1" htmlFor="signup-role">
                  <i className="pi pi-shield text-xs text-500 mr-2" />
                  Role
                </label>
                <span id="signup-role" className="text-sm font-medium text-700 line-height-1">
                  {role || 'N/A'}
                </span>
              </div>

              <div className="col-8">
                <label className="text-sm text-500 block pb-1" htmlFor="signup-username">
                  <i className="pi pi-user text-xs text-500 mr-2" />
                  Username
                </label>
                <span id="signup-username" className="text-sm font-medium text-700 line-height-1">
                  {username || 'N/A'}
                </span>
              </div>
              <div className="col-4 mb-2">
                <label className="text-sm text-500 block pb-1" htmlFor="signup-status">
                  <i className="pi pi-info-circle text-xs text-500 mr-2" />
                  Status
                </label>
                <span
                  id="signup-status"
                  className={classNames('text-sm font-medium line-height-1', {
                    'text-green-600': userId,
                    'text-gray-400': !userId,
                  })}
                >
                  {userId ? 'Active' : 'N/A'}
                </span>
              </div>
            </div>
            <Divider layout="horizontal" className="p-1 m-0" />

            {/* Editable Fields */}
            <div className="flex flex-column gap-1">
              <label
                className="text-xs font-bold text-700 ml-1 required"
                htmlFor="signup-displayname"
              >
                Display Name
              </label>
              <InputText
                id="signup-displayname"
                disabled={!userId}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (displayNameError) setDisplayNameError('');
                }}
                onBlur={() => setTouched({ ...touched, displayName: true })}
                onKeyPress={handleKeyPress}
                className={classNames('p-inputtext-sm border-round-3xl', {
                  'p-invalid': displayNameError,
                })}
                placeholder="How should we call you?"
                autoComplete="name"
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
              {displayNameError && (
                <small className="text-red-500 text-xs ml-2">{displayNameError}</small>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-nogutter gap-3">
              <div className="col flex flex-column gap-1">
                <label
                  className="text-xs font-bold text-700 ml-1 required"
                  htmlFor="signup-password"
                >
                  New Password
                </label>
                <InputText
                  id="signup-password"
                  disabled={!userId}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  onKeyPress={handleKeyPress}
                  className={classNames('p-inputtext-sm border-round-3xl', {
                    'p-invalid': passwordError,
                  })}
                  placeholder="Enter password"
                  autoComplete="new-password"
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
              </div>
              <div className="col flex flex-column gap-1">
                <label
                  className="text-xs font-bold text-700 ml-1 required"
                  htmlFor="signup-password1"
                >
                  Confirm
                </label>
                <InputText
                  id="signup-password1"
                  disabled={!userId}
                  type="password"
                  value={password1}
                  onChange={(e) => {
                    setPassword1(e.target.value);
                    if (passwordMatchError) setPasswordMatchError('');
                  }}
                  onBlur={() => setTouched({ ...touched, password1: true })}
                  onKeyPress={handleKeyPress}
                  className={classNames('p-inputtext-sm border-round-3xl', {
                    'p-invalid': passwordMatchError,
                  })}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
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
              </div>
            </div>

            {/* Password validation messages */}
            {passwordError && (
              <small className="text-red-500 text-xs ml-2 flex align-items-center gap-1">
                <i className="pi pi-times-circle" />
                {passwordError}
              </small>
            )}
            {passwordMatchError && (
              <small className="text-red-500 text-xs ml-2 flex align-items-center gap-1">
                <i className="pi pi-times-circle" />
                {passwordMatchError}
              </small>
            )}
            {!passwordError &&
              !passwordMatchError &&
              touched.password &&
              touched.password1 &&
              password &&
              password === password1 && (
                <small className="text-green-600 text-xs ml-2 flex align-items-center gap-1">
                  <i className="pi pi-check-circle" />
                  All requirements met - ready to complete setup
                </small>
              )}

            <div className="grid">
              <div className="col-6">{renderPasswordRequirements()}</div>
              <div className="col-6">
                <div className="flex flex-column gap-2 flex-grow-2">
                  <div className="flex justify-content-between align-items-center">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 border-round-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Button
                label="Complete Setup"
                icon="pi pi-check"
                className="w-full p-button-sm border-round-3xl"
                disabled={!isFormValid() || completed}
                onClick={handleUserAccountComplete}
                tooltip={!isFormValid() ? 'Please fill all required fields correctly' : ''}
                tooltipOptions={{ position: 'top' }}
                pt={{
                  root: {
                    style: {
                      transition: 'all 0.2s ease',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAccountSetupPage;
