const fs = require("fs");
const path = require("path");
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

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "expensewise_uploads",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ width: 1200, height: 1200, crop: "limit" }],
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadsDir),
      filename: (req, file, cb) => {
        const safeName = file.originalname
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_+/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
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
