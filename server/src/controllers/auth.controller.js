const { randomBytes, createHash } = require("node:crypto");
const { loginSchema } = require("../validators/auth.validator");
const argon2 = require("argon2");
const prisma = require("../db");

const {
  studentRegistrationSchema,
  companyRegistrationSchema,
} = require("../validators/auth.validator");

async function registerStudent(req, res) {
  const validation = studentRegistrationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid registration details.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const data = validation.data;
    const email = data.email.toLowerCase();

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            university: data.university,
            programme: data.programme,
            studyYear: data.studyYear,
            phone: data.phone,
            city: data.city,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        studentProfile: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Student registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create student account.",
    });
  }
}

async function registerCompany(req, res) {
  const validation = companyRegistrationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid registration details.",
      errors: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const data = validation.data;
    const email = data.email.toLowerCase();

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "COMPANY",
        companyProfile: {
          create: {
            companyName: data.companyName,
            industry: data.industry,
            city: data.city,
            registrationNumber: data.registrationNumber || null,
            verificationStatus: "PENDING",
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        companyProfile: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Company account created. Awaiting administrator verification.",
      user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This email or company registration number is already in use.",
      });
    }

    console.error("Company registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create company account.",
    });
  }
}
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: SESSION_DURATION,
  };
}

async function login(req, res) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email and password.",
    });
  }

  try {
    const email = validation.data.email.toLowerCase();
    const password = validation.data.password;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "This account has been suspended. Contact an administrator." });
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate a random session token.
    const sessionToken = randomBytes(32).toString("hex");

    // Store only the SHA-256 hash in the database.
    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send the original token in a protected cookie.
    res.cookie(
      "attachment_session",
      sessionToken,
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
}

async function logout(req, res) {
  try {
    const sessionToken = req.cookies?.attachment_session;

    if (sessionToken) {
      const tokenHash = createHash("sha256")
        .update(sessionToken)
        .digest("hex");

      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    res.clearCookie("attachment_session", {
      ...getCookieOptions(),
      maxAge: undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log out.",
    });
  }
}
async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}
module.exports = {
  registerStudent,
  registerCompany,
  login,
  logout,
  getCurrentUser,
};
