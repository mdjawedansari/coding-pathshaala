import path from "path";
import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// Define allowed file types
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".webp", ".png", ".mp4"];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_FILE_TYPES.includes(ext)) {
    cb(new Error(`Unsupported file type! ${ext}`), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_FILE_SIZE },
  storage,
  fileFilter,
});

export default upload;
