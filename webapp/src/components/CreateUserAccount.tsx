import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";
import { isValidEmail, validateUsernameWithError } from "../utils";
import HttpClient from "../client";
import { useToast } from "./ToastComponent";
import { ProgressSpinner } from "primereact/progressspinner";

const Roles = ["Developer", "Maintainer", "Guest", "Admin"];

export type CreateUserAccountDialogProps = {
  visible: boolean;
  hideCallback: (reloadUsers: boolean) => void;
};

const CreateUserAccountDialog = (props: CreateUserAccountDialogProps) => {
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const [emailValidationMsg, setEmailValidationMsg] = useState<string>("");
  const [roleValidationMsg, setRoleValidationMsg] = useState<string>("");
  const [usernameValidationMsg, setUsernameValidationMsg] =
    useState<string>("");

  const { showSuccess, showError } = useToast();

  const [showProgressView, setShowProgressView] = useState<boolean>(false);

  useEffect(() => {
    setEmailValidationMsg("");
    setRoleValidationMsg("");
    setUsernameValidationMsg("");
  }, [props.visible]);

  const resetFields = () => {
    setUsername("");
    setEmail("");
    setRole("");
    setDisplayName("");
  };

  const handleButtonClick = () => {
    let emailMsg = "";

    if (!email) {
      emailMsg = "Enter email!";
    } else if (!isValidEmail(email as string)) {
      emailMsg = "Enter valid email!";
    } else {
      if (!emailValidationMsg.includes("taken")) {
        emailMsg = "";
      } else {
        emailMsg = emailValidationMsg;
      }
    }

    let roleMsg = "";

    if (!role) {
      roleMsg = "Select a role!";
      setRoleValidationMsg("Select a role!");
    } else {
      setRoleValidationMsg("");
    }

    let usernameMsg = "";

    let res = validateUsernameWithError(username as string);
    if (!username) {
      usernameMsg =
        "Enter a username. Users can update it during account setup.";
    } else if (!res.isValid) {
      usernameMsg = res.error as string;
    } else {
      if (!usernameValidationMsg.includes("taken")) {
        usernameMsg = "";
      }
      {
        usernameMsg = usernameValidationMsg;
      }
    }

    setEmailValidationMsg(emailMsg);
    setUsernameValidationMsg(usernameMsg);
    setRoleValidationMsg(roleMsg);

    if (emailMsg == "" && roleMsg == "" && usernameMsg == "") {
      setShowProgressView(true);
      validateUsernameEmailAPICall(createUserAccountAPICall);
    }
  };

  const validateUsernameEmailAPICall = (successFn: () => void) => {
    HttpClient.getInstance("http://localhost:8000/api/v1")
      .valiateUser({
        username: username,
        email: email,
      })
      .then((data) => {
        if (data.error) {
          showError(data.error);
          setTimeout(() => {
            setShowProgressView(false);
          }, 200);
          return;
        }
        if (!data.email_available) {
          setEmailValidationMsg("Email is already taken!");
          setTimeout(() => {
            setShowProgressView(false);
          }, 200);
        } else if (!data.username_available) {
          setUsernameValidationMsg("Username is already taken!");
          setTimeout(() => {
            setShowProgressView(false);
          }, 200);
        } else {
          successFn();
        }
      })
      .catch((err) => {
        showError("Unexpected error occurred!");
        setTimeout(() => {
          setShowProgressView(false);
        }, 150);
      });
  };

  const createUserAccountAPICall = () => {
    HttpClient.getInstance("http://localhost:8000/api/v1")
      .createUserAccount({
        username: username,
        email: email,
        display_name: displayName,
        role: role,
      })
      .then((data) => {
        if (data.error) {
          showError(data.error);
          setTimeout(() => {
            setShowProgressView(false);
          }, 150);
          return;
        }
        setTimeout(() => {
          setShowProgressView(false);
        }, 200);
        showSuccess(
          "Successfully created user account & send intivation to " + email
        );
        resetFields();
        props.hideCallback(true);
      })
      .catch((err) => {
        console.log(err);
        setTimeout(() => {
          setShowProgressView(false);
        }, 200);
        showError(err);
        return;
      });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailValidationMsg("");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameValidationMsg("");
  };

  return (
    <React.Fragment>
      <Dialog
        visible={props.visible}
        onHide={() => props.hideCallback(false)}
        className="w-4 p-0 m-0"
        modal
        content={({ hide }) => {
          return (
            <div className="flex flex-column  p-0 m-0 bg-white border-round-lg">
              <div
                className="flex-grow-0  border-round-top-lg 
                        flex flex-row  align-items-center justify-content-between gap-2 p-3 pb-2 "
              >
                <div className="font-medium text-lg text-color-secondary">
                  Create User Account
                </div>

                <div>
                  <span
                    className="pi pi-times text-sm  cursor-pointer"
                    onClick={(e) => hide(e)}
                  ></span>
                </div>
              </div>
              <Divider className="m-0 p-0" />
              <div className="flex-grow-1 flex flex-column gap-2 p-4 pb-2">
                <div className=" border-round-lg flex flex-column">
                  <div className="p-0  grid">
                    <div className="col-6 flex align-items-center text-xs pb-0 mb-0 required">
                      <i className="pi pi-envelope text-xs"></i>
                      &nbsp;&nbsp;&nbsp; Email Address
                    </div>
                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {emailValidationMsg && (
                        <span className="text-red-300">
                          {emailValidationMsg}
                        </span>
                      )}
                    </div>

                    <div className="col-12">
                      <InputText
                        value={email}
                        className="border-1 text-xs"
                        required
                        onChange={handleEmailChange}
                      />
                    </div>

                    <div className="col-6 text-xs flex align-items-center pb-0 mb-0 required">
                      <i className="pi pi-shield text-xs"></i>
                      &nbsp;&nbsp;&nbsp; Role
                    </div>

                    <div className="col-6 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {roleValidationMsg && (
                        <span className="text-red-300">
                          {roleValidationMsg}
                        </span>
                      )}
                    </div>

                    <div className="col-12">
                      <Dropdown
                        pt={{
                          input: {
                            className: "text-xs",
                          },
                        }}
                        required
                        className="w-full border-1 p-0 text-xs"
                        panelClassName="text-xs animate-fadein"
                        options={Roles}
                        value={role}
                        onChange={(e) => setRole(e.value)}
                      />
                    </div>

                    <div className="col-4 text-xs flex align-items-center mb-0 pb-0">
                      <i className="pi pi-user text-xs"></i>
                    </div>
                    <div className="col-8 flex text-xs justify-content-end align-items-center pb-0 mb-0">
                      {usernameValidationMsg && (
                        <span className="text-red-300">
                          {usernameValidationMsg}
                        </span>
                      )}
                    </div>
                    <div className="col-5 text-xs required">Username</div>
                    <div className="col-2"></div>
                    <div className="col-5 text-xs">Display Name</div>

                    <div className="col-5">
                      <InputText
                        value={username}
                        className="border-1 text-xs"
                        onChange={handleUsernameChange}
                      />
                    </div>
                    <div className="col-2"></div>
                    <div className="col-5">
                      <InputText
                        value={displayName}
                        className="border-1 text-xs"
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <Divider layout="horizontal" className="p-0 m-0" />
                    </div>

                    <div className="col-12 flex flex-row justify-content-end">
                      <Button
                        className="border-round-3xl border-1 text-xs"
                        size="small"
                        onClick={handleButtonClick}
                      >
                        <span className="text-xs">Save & Send Invite</span>
                        &nbsp;&nbsp;
                        <span className="pi pi-send text-xs"></span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      ></Dialog>
      {showProgressView && (
        <div
          className="fixed top-0 left-50 bottom-0 h-full w-full surface-50 opacity-70 flex align-items-center justify-content-center"
          style={{ zIndex: 1000 }}
        >
          <div className="flex flex-column align-items-center">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default CreateUserAccountDialog;