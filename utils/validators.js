// Email validator
exports.validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Password validator - at least 8 chars, one uppercase, one lowercase, one number
exports.validatePassword = (password) => {
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(password);
};

// Name validator - only letters and spaces, at least 2 chars
exports.validateName = (name) => {
  const re = /^[a-zA-Z\s]{2,}$/;
  return re.test(name);
};

// URL validator
exports.validateURL = (url) => {
  const re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return re.test(url);
};
