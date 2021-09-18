const emailRegexp = /^[\w.-]+@([\w-]+\.)+[\w-]+$/;
const passwordRegexp = /^[a-zA-Z0-9]+$/;
const usernameRegexp = /^\p{L}([\p{L}0-9]+[\s_-]?)+$/u;
const phoneRegexp = /^\+?[0-9\s-()]+$/;

function isEmailTemplateValid(email) {
  return emailRegexp.test(email);
}

function isPasswordTemplateValid(password) {
  return passwordRegexp.test(password);
}

function isUserNameTemplateValid(userName) {
  return usernameRegexp.test(userName);
}

function isPhoneTemplateValid(phone) {
  return phoneRegexp.test(phone);
}

export {
  isEmailTemplateValid,
  isPasswordTemplateValid,
  isUserNameTemplateValid,
  isPhoneTemplateValid,
};
