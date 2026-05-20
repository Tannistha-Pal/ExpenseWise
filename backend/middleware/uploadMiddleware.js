const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expensewise_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    return cb(null, true);
  },
});

module.exports = { upload, MAX_FILE_SIZE_BYTES };
