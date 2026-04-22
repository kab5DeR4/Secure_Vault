const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ================= CONFIG =================
const PORT = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/secureVaultDB";
const JWT_SECRET = "super_secret_vault_key";
const UPLOAD_DIR = path.join(__dirname, 'vault_storage');

// Ensure storage folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// ================= DATABASE =================
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// ================= USER MODEL =================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

// ================= FILE MODEL =================
const fileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  originalName: String,
  storedName: String,
  size: Number,
  mimetype: String,
  uploadDate: { type: Date, default: Date.now },
  iv: String
});

const FileModel = mongoose.model("VaultFile", fileSchema);

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid Token" });
  }
};

// ================= AUTH ROUTES =================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  const existing = await User.findOne({ username });
  if (existing)
    return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword
  });

  await newUser.save();

  res.json({ success: true });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).json({ error: "Invalid Credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(400).json({ error: "Invalid Credentials" });

  const token = jwt.sign(
    { id: user._id, username },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, username });
});

// ================= CRYPTO HELPERS =================
const ALGORITHM = "aes-256-cbc";

const getKeyFromPassword = (password) => {
  return crypto.scryptSync(password, "salt", 32);
};

const upload = multer({ dest: "temp_uploads/" });

// ================= UPLOAD =================
app.post(
  "/api/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    const { password } = req.body;
    const file = req.file;

    if (!file || !password)
      return res.status(400).json({ error: "File & Password required" });

    try {
      const iv = crypto.randomBytes(16);
      const key = getKeyFromPassword(password);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      const inputPath = file.path;
      const storedFilename = `${file.filename}.enc`;
      const outputPath = path.join(UPLOAD_DIR, storedFilename);

      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);

      input.pipe(cipher).pipe(output);

      output.on("finish", async () => {
        const newFile = new FileModel({
          userId: req.user.id,
          originalName: file.originalname,
          storedName: storedFilename,
          size: file.size,
          mimetype: file.mimetype,
          iv: iv.toString("hex")
        });

        await newFile.save();
        fs.unlinkSync(inputPath);

        res.json({ success: true });
      });

    } catch (err) {
      res.status(500).json({ error: "Encryption Failed" });
    }
  }
);

// ================= LIST FILES =================
app.get("/api/files", authMiddleware, async (req, res) => {
  const files = await FileModel
    .find({ userId: req.user.id })
    .sort({ uploadDate: -1 });

  res.json(files);
});

// ================= DOWNLOAD =================
app.post("/api/download", authMiddleware, async (req, res) => {
  const { fileId, password } = req.body;

  const fileDoc = await FileModel.findOne({
    _id: fileId,
    userId: req.user.id
  });

  if (!fileDoc)
    return res.status(404).json({ error: "File not found" });

  try {
    const key = getKeyFromPassword(password);
    const iv = Buffer.from(fileDoc.iv, "hex");
    const filePath = path.join(UPLOAD_DIR, fileDoc.storedName);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileDoc.originalName}"`
    );
    res.setHeader("Content-Type", fileDoc.mimetype);

    const input = fs.createReadStream(filePath);
    input.pipe(decipher).pipe(res);

  } catch (err) {
    res.status(500).json({ error: "Decryption Failed" });
  }
});

// ================= DELETE =================
app.delete("/api/files/:id", authMiddleware, async (req, res) => {
  const fileDoc = await FileModel.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (fileDoc) {
    const filePath = path.join(UPLOAD_DIR, fileDoc.storedName);

    if (fs.existsSync(filePath))
      fs.unlinkSync(filePath);

    await FileModel.deleteOne({ _id: req.params.id });
  }

  res.json({ success: true });
});

// ================= START SERVER =================
app.listen(PORT, () =>
  console.log(`🔒 Secure Vault running on port ${PORT}`)
);
