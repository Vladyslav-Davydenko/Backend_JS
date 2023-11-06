const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogin = async (req, res) => {
  const { user, psw } = req.body;
  if (!user || !psw)
    return res.status(400).json({
      message: "Username and password are required.",
    });

  const foundUser = userDB.users.find((person) => person.username === user);
  if (!foundUser) return res.sendStatus(401);
  const match = await bcrypt.compare(psw, foundUser.password);
  if (match) {
    // create JWTs
    const accessToken = jwt.sign(
      {
        username: foundUser.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "600s" }
    );
    const refreshToken = jwt.sign(
      {
        username: foundUser.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const othersUsers = userDB.users.filter(
      (person) => person.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    userDB.setUsers([...othersUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDB.users)
    );
    res.cookie("vldavy_jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
