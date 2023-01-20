const User = require("./UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secret = "ilovechicken";

const login = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ message: "Invalid username" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const payload = {
      id: user._id,
      username: user.username,
    };
    const token = jwt.sign(payload, secret);

    return res.json({ token, username: user.username, id: user._id });
  } else {
    return res.json({ message: "Incorrect password" });
  }
};

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);

  let user = new User({
    username,
    email,
    password: encryptedPassword,
    wins: 0,
  });

  const userExists = await User.findOne({ username: username }).exec();

  if (userExists) {
    res.json({
      error: "Username already taken.",
    });
  } else {
    user
      .save()
      .then((user) => {
        res.json({
          success: "Account successfully created!",
        });
      })
      .catch((error) => {
        res.json({
          error: "User failed to add",
        });
      });
  }
};

const changePassword = async (req, res, next) => {
  const { username, currentPassword, newPassword } = req.body;

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ error: "Invalid username/password" });
  }

  if (await bcrypt.compare(currentPassword, user.password)) {
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const userPassword = await User.findOneAndUpdate(
      { username },
      { password: encryptedPassword }
    ).exec();
    return res.json({ success: "Password Changed!" });
  } else {
    return res.json({ error: "Incorrect password" });
  }
};

const leaderboard = async (req, res, next) => {
  const leaderboard = await User.find({}, "username wins").lean();
  if (leaderboard) {
    return res.json({ leaderboard });
  } else {
    res.json({
      error: "Leaderboard doesn't exist",
    });
  }
};

const increaseWins = async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOneAndUpdate(
    { username },
    { $inc: { wins: 1 } }
  ).exec();
  if (user) {
    return res.json({ wins: user.wins });
  } else {
    return res.json({ error: "error adding win" });
  }
};

module.exports = {
  register,
  login,
  leaderboard,
  increaseWins,
  changePassword,
};
