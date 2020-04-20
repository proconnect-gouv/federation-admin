export enum AuthenticationActions {
  TOKEN_SIGNUP = 'token_signup',
  TOTP = 'totp',
  SIGNIN = 'signin',
  SIGNOUT = 'signout',
}

export enum AuthenticationStates {
  GRANTED = 'granted',
  DENIED = 'denied',
  DENIED_USER_NOT_FOUND = 'denied because the user could not be found in database',
  DENIED_PASSWORD_AND_TOKEN = 'denied because if the username is valid, the password and token are invalid',
  DENIED_TOKEN = 'denied because if user and password are valid, the token is invalid',
  DENIED_PASSWORD = 'denied because if user (and token) is/are valid, the password is invalid',
  DENIED_NEW_USER_TOKEN_EXPIRED = 'denied because the user authentication token expired',
  DENIED_MAX_AUTHENTICATION_ATTEMPTS_REACHED = 'denied because the user exceedeed his allowed authentication attempts',
  DENIED_BLOCKED_USER = 'denied beacause the user is blocked',
  DENIED_TOTP = 'denied because the totp is invalid',
}
