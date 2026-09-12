import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // A fixed whitelist (jpeg/png/webp/gif) rejected real photos with no explanation —
    // iPhones default to HEIC ("image/heic") since iOS 11, and browsers keep adding new
    // image mimetypes (avif, svg+xml, etc). Any image/* is a photo; only non-image uploads
    // (pdf, video, etc.) are the actual thing worth blocking here.
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});
