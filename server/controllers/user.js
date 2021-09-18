const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generate: generatePassword } = require("generate-password");

const mysqlConnection = require("mysql/connection");
const { createUser, getUserData, setUserData } = require("mysql/queries");
const { initMailer } = require("utils/nodemailer");
const {
  ConflictError,
  BadRequestError,
  errorHandler,
} = require("utils/errors");
const getDateString = require("utils/getDateString");

const saltRounds = 10;
const { JWT_LIFETIME, CLIENT } = process.env;

async function create(req, res) {
  try {
    const { userName, email, password } = req.body;
    const emailUsed = await isEmailUsed_Boolean(email);
    if (emailUsed) throw new ConflictError("Email is already in use");
    const hashedPass = await bcrypt.hash(password, saltRounds);
    const regDate = getDateString();
    await mysqlConnection.query(
      createUser(userName, email, hashedPass, regDate)
    );
    res.status(201).json({ message: "User created" });
  } catch (error) {
    errorHandler(error, res);
  }
}

async function update(req, res) {
  try {
    const { network, userId } = req.user;
    let avatar = req.file ? req.file.path : null;
    let changingValues = { ...req.body };
    if (avatar) {
      avatar = avatar.replace(/uploads\\/, "/");
      changingValues.avatar = avatar;
    }
    await mysqlConnection.query(setUserData(userId, changingValues, network));
    res.status(200).json(changingValues);
  } catch (error) {
    errorHandler(error, res);
  }
}

async function initPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const emailUsed = await isEmailUsed_Boolean(email);
    if (!emailUsed) throw new ConflictError("Email is not used");
    const newPass = generatePassword({ length: 8, numbers: true });
    const hashedPass = await bcrypt.hash(newPass, saltRounds);
    const [[{ pass: oldPass }]] = await mysqlConnection.query(
      getUserData(email, "pass")
    );
    const token = jwt.sign({ hashedPass, email }, oldPass, {
      expiresIn: JWT_LIFETIME * 6, // 1 hour
    });
    const url = `${CLIENT}/confirm-recovery?token=${token}&pass=${hashedPass}`;
    const sendRecoveryRequest = await initMailer();
    await sendRecoveryRequest(email, url, newPass);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    errorHandler(error, res);
  }
}

async function confirmPasswordReset(req, res) {
  try {
    const { token, pass: newPass } = req.body;
    if (!token || !newPass) throw new BadRequestError("Invalid recovery URL");
    const { email } = jwt.decode(token);
    const emailUsed = await isEmailUsed_Boolean(email);
    if (!emailUsed) throw new ConflictError("Email is not used");
    const [[{ pass: oldPass }]] = await mysqlConnection.query(
      getUserData(email, "pass")
    );
    jwt.verify(token, oldPass);
    await mysqlConnection.query(setUserData(email, { pass: newPass }));
    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    errorHandler(error, res);
  }
}

async function isEmailUsed(req, res) {
  try {
    const { email } = req.body;
    const emailUsed = await isEmailUsed_Boolean(email);
    if (!emailUsed) throw new ConflictError("Email is not used");
    res.status(200).json({ message: "Email is used" });
  } catch (error) {
    errorHandler(error, res);
  }
}

async function isEmailUsed_Boolean(email) {
  let [[userData]] = await mysqlConnection.query(getUserData(email, "email"));
  return !!userData;
}

export {
  create,
  update,
  initPasswordReset,
  confirmPasswordReset,
  isEmailUsed,
  isEmailUsed_Boolean,
};
