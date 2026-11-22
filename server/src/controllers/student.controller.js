
const prisma = require("../db");
const { studentProfileSchema } = require("../validators/student.validator");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

// GET: Retrieve the logged-in student's profile.
async function getStudentProfile(req, res) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve student profile.",
    });
  }
}

// PUT: Update the logged-in student's profile.
async function updateStudentProfile(req, res) {
  try {
    const validation = studentProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please correct the profile information.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const existingProfile = await prisma.studentProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: {
        userId: req.user.id,
      },
      data: validation.data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update student profile.",
    });
  }
}

async function uploadStudentPhoto(req, res) {
  let savedFilePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile photo.",
      });
    }

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Verify the actual file signature.
    const validSignatures = {
      "image/jpeg":
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff,

      "image/png":
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        ),

      "image/webp":
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP",
    };

    if (!validSignatures[mimeType]) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid supported image.",
      });
    }

    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const filename = `${randomUUID()}${extensions[mimeType]}`;
    const uploadDirectory = path.join(
      __dirname,
      "../../uploads/profile-photos"
    );

    await fs.mkdir(uploadDirectory, { recursive: true });

    savedFilePath = path.join(uploadDirectory, filename);

    await fs.writeFile(savedFilePath, buffer, { flag: "wx" });

    const storageKey = `profile-photos/${filename}`;

    const updatedProfile = await prisma.studentProfile.update({
      where: {
        userId: req.user.id,
      },
      data: {
        profilePhoto: storageKey,
      },
      select: {
        id: true,
        profilePhoto: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }

    console.error("Profile photo upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not upload profile photo.",
    });
  }
}


async function uploadStudentCV(req, res) {
  let savedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a CV to upload.",
      });
    }

    const fileBuffer = req.file.buffer;
    const extension = path.extname(req.file.originalname).toLowerCase();

    // Check the actual file signature, not just its extension or MIME type.
    const signatures = {
      ".pdf": fileBuffer.subarray(0, 5).toString() === "%PDF-",

      ".doc": fileBuffer.subarray(0, 8).equals(
        Buffer.from("D0CF11E0A1B11AE1", "hex")
      ),

      ".docx":
        fileBuffer[0] === 0x50 &&
        fileBuffer[1] === 0x4B &&
        fileBuffer[2] === 0x03 &&
        fileBuffer[3] === 0x04,
    };

    if (!signatures[extension]) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file does not match its file extension.",
      });
    }

    // Find the authenticated student's profile.
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Generate a safe server-side filename.
    const filename = `${randomUUID()}${extension}`;

    const uploadDirectory = path.join(
      __dirname,
      "../../uploads/cvs"
    );

    await fs.mkdir(uploadDirectory, { recursive: true });

    savedFilePath = path.join(uploadDirectory, filename);

    await fs.writeFile(savedFilePath, fileBuffer, { flag: "wx" });

    const storageKey = `cvs/${filename}`;

    // Save the CV details in PostgreSQL.
    const document = await prisma.document.create({
      data: {
        studentId: student.id,
        originalName: req.file.originalname,
        storageKey,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "CV uploaded successfully.",
      document,
    });
  } catch (error) {
    console.error("CV upload error:", error);

    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload CV.",
    });
  }
}

async function getStudentCVs(req, res) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    const documents = await prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("CV retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve CV documents.",
    });
  }
}

async function downloadStudentCV(req, res) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Find the document only if it belongs to this student.
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.documentId,
        studentId: student.id,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "CV not found.",
      });
    }

    // Resolve the stored path and prevent directory traversal.
    const uploadDirectory = path.resolve(
      __dirname,
      "../../uploads"
    );

    const filePath = path.resolve(
      uploadDirectory,
      document.storageKey
    );

    const relativePath = path.relative(
      uploadDirectory,
      filePath
    );

    if (
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid document path.",
      });
    }

    // Confirm that the file exists.
    await fs.access(filePath);

    res.setHeader("Content-Type", document.mimeType);

    return res.download(
      filePath,
      document.originalName,
      (error) => {
        if (error) {
          console.error("CV download error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Unable to download CV.",
            });
          }
        }
      }
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "The stored CV file could not be found.",
      });
    }

    console.error("CV download error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to download CV.",
    });
  }
}

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentPhoto,
  uploadStudentCV,
  getStudentCVs,
  downloadStudentCV,
};
