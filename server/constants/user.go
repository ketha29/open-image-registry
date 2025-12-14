package constants

const (
	ReasonPasswordRecoveryNewAccountSetup = iota + 1 // 1
	ReasonPasswordRecoveryForgotPassowrd             // 2
	ReasonPasswordRecoveryResetPassword              // 3
)

const (
	ReasonLockedNewAccountVerficationRequired = iota + 1 // 1
	ReasonLockedFailedLoginAttempts                      // 2
	ReasonLockedAdminLocked                              // 3
)

const (
	PasswordNotSet    = "not-set-yet"
	SaltNotSet        = "not-set-yet"
	DisplayNameNotSet = "not set yet"
)

const (
	RoleAdmin      = "Admin"
	RoleMaintainer = "Maintainer"
	RoleDeveloper  = "Developer"
	RoleGuest      = "Guest"
)