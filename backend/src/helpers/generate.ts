const crypto = require("crypto");

module.exports.generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

module.exports.generateOrderCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < 4; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return `ORD${year}${month}${day}${hours}${minutes}${seconds}${randomString}`;
};

export {};
