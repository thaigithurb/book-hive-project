const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryConfig = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: {
    folder: "book-store",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

console.log("here");

module.exports = upload;