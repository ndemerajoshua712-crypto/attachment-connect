
const { createHash } = require("node:crypto");
const prisma = require("../db");

async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.attachment_session;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }

      res.clearCookie("attachment_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api",
      });

      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please log in again.",
      });
    }

    if (!session.user.isActive) {
      await prisma.session.deleteMany({ where: { userId: session.user.id } });
      res.clearCookie("attachment_session", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api" });
      return res.status(403).json({ success: false, message: "This account has been suspended. Contact an administrator." });
    }

    req.user = session.user;
    req.sessionId = session.id;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication could not be verified.",
    });
  }
}

// Restrict routes to specified user roles.
function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  allowRoles,
};
