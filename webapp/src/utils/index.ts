const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,32}$/;

export function isValidEmail(email: string) {
  return emailRegex.test(email);
}

export function validateUsernameWithError(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 32) {
    return { isValid: false, error: "Username must not exceed 32 characters" };
  }

  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, dots, underscores, and hyphens",
    };
  }

  return { isValid: true };
}
