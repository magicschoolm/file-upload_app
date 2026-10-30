
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads");
mkdirSync(uploadsDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }
    callback(new Error("Only image files are allowed."));
  }
});

app.post("/api/upload", upload.array("images"), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: "Select at least one image to upload." });
  }
  res.json({ message: `${req.files.length} image${req.files.length === 1 ? "" : "s"} uploaded successfully.` });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Each image must be 1 MB or smaller." });
  }
  if (error.message === "Only image files are allowed.") {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: "Upload failed. Please try again." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});









// Test the backend server
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Test an API endpoint
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Dharsan" },
    { id: 2, name: "Alex" }
  ]);
});