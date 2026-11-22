
const multer = require("multer");
const path = require("node:path");

// Temporarily hold uploaded files in memory.
const storage = multer.memoryStorage();

// Check that the file extension and MIME type match.
function createFileFilter(allowedTypes) {
  return (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedMimeType = allowedTypes[extension];

    if (!expectedMimeType || file.mimetype !== expectedMimeType) {
      return callback(
        new Error("Invalid file type. Please upload an allowed file format.")
      );
    }

    callback(null, true);
  };
}

// Profile photo uploads.
const profilePhotoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: createFileFilter({
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  }),
});

// CV uploads.
const cvUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: createFileFilter({
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  }),
});

// Logo content is validated from its file signature in the controller. Some
// valid image files are reported by browsers with a generic or mismatched MIME
// type, so accept only known image extensions here and verify the bytes later.
const companyLogoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".jfif", ".png", ".webp"].includes(extension)) {
      return callback(new Error("Choose a JPG, PNG, or WebP image for your company logo."));
    }
    return callback(null, true);
  },
});

module.exports = {
  uploadProfilePhoto: profilePhotoUpload.single("photo"),
  uploadCompanyLogo: companyLogoUpload.single("photo"),
  uploadCV: cvUpload.single("cv"),
};
