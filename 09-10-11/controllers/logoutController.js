const userDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");

const handleLogout = async (req, res) => {
  // On client also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.vldavy_jwt) return res.sendStatus(204);

  const refreshToken = cookies.vldavy_jwt;

  const foundUser = userDB.users.find(
    (person) => person.refreshToken === refreshToken
  );
  if (!foundUser) {
    res.clearCookie("vldavy_jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  const otherUsers = userDB.users.filter(
    (person) => person.refreshToken !== foundUser.refreshToken
  );
  const currentUser = { ...foundUser, refreshToken: "" };
  userDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "model", "users.json"),
    JSON.stringify(userDB.users)
  );

  res.clearCookie("vldavy_jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.sendStatus(204);
};

module.exports = { handleLogout };
