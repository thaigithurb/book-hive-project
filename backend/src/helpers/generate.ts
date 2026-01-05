const crypto = require("crypto");

module.exports.generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export {};
