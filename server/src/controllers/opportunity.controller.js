
const prisma = require("../db");
const {
  opportunitySchema,
} = require("../validators/opportunity.validator");

// Get the logged-in company's profile
async function getCompany(req) {
  return prisma.companyProfile.findUnique({
    where: {
      userId: req.user.id,
    },
  });
}

// CREATE OPPORTUNITY
const createOpportunity = async (req, res) => {
  try {
    const validation = opportunitySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const company = await getCompany(req);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const data = validation.data;

    if (
      data.status === "OPEN" &&
      company.verificationStatus !== "APPROVED"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your company must be approved before publishing opportunities.",
      });
    }

    if (data.applicationDeadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be in the future.",
      });
    }

    if (
      data.startDate &&
      data.startDate < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past.",
      });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        ...data,
        companyId: company.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Opportunity created successfully.",
      opportunity,
    });
  } catch (error) {
    console.error("Create opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create opportunity.",
    });
  }
};

// GET COMPANY OPPORTUNITIES
const getCompanyOpportunities = async (req, res) => {
  try {
    const company = await getCompany(req);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const opportunities = await prisma.opportunity.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error("Get company opportunities error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve opportunities.",
    });
  }
};

// UPDATE COMPANY OPPORTUNITY
const updateOpportunity = async (req, res) => {
  try {
    const validation = opportunitySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const company = await getCompany(req);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const existingOpportunity = await prisma.opportunity.findFirst({
      where: {
        id: req.params.id,
        companyId: company.id,
      },
    });

    if (!existingOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    const data = validation.data;

    if (
      data.status === "OPEN" &&
      company.verificationStatus !== "APPROVED"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your company must be approved before publishing opportunities.",
      });
    }

    if (
      data.status === "OPEN" &&
      existingOpportunity.status === "CLOSED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Closed opportunities cannot be reopened.",
      });
    }

    if (data.applicationDeadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be in the future.",
      });
    }

    if (
      data.startDate &&
      data.startDate < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past.",
      });
    }

    const opportunity = await prisma.opportunity.update({
      where: {
        id: existingOpportunity.id,
      },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Opportunity updated successfully.",
      opportunity,
    });
  } catch (error) {
    console.error("Update opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update opportunity.",
    });
  }
};

// CLOSE COMPANY OPPORTUNITY
const closeOpportunity = async (req, res) => {
  try {
    const company = await getCompany(req);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const existingOpportunity = await prisma.opportunity.findFirst({
      where: {
        id: req.params.id,
        companyId: company.id,
      },
    });

    if (!existingOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    if (existingOpportunity.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Opportunity is already closed.",
      });
    }

    const opportunity = await prisma.opportunity.update({
      where: {
        id: existingOpportunity.id,
      },
      data: {
        status: "CLOSED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Opportunity closed successfully.",
      opportunity,
    });
  } catch (error) {
    console.error("Close opportunity error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not close opportunity.",
    });
  }
};
// GET AVAILABLE OPPORTUNITIES FOR STUDENTS
const getAvailableOpportunities = async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: "OPEN",
        applicationDeadline: {
          gt: new Date(),
        },
        company: {
          verificationStatus: "APPROVED",
        },
      },
      include: {
        company: {
          select: {
            companyName: true,
            industry: true,
            city: true,
            description: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error("Get available opportunities error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve available opportunities.",
    });
  }
};

async function applyToOpportunity(req, res) {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: "Student profile not found." });
    const opportunity = await prisma.opportunity.findFirst({ where: { id: req.params.id, status: "OPEN", applicationDeadline: { gt: new Date() }, company: { verificationStatus: "APPROVED" } } });
    if (!opportunity) return res.status(404).json({ success: false, message: "Opportunity is unavailable." });
    const cvDocumentId = req.body?.cvDocumentId || null;
    if (cvDocumentId && !(await prisma.document.findFirst({ where: { id: cvDocumentId, studentId: student.id } }))) return res.status(400).json({ success: false, message: "Selected CV is invalid." });
    const application = await prisma.application.create({ data: { studentId: student.id, opportunityId: opportunity.id, cvDocumentId, coverLetter: req.body?.coverLetter?.trim() || null } });
    await prisma.notification.create({ data: { userId: req.user.id, title: "Application submitted", message: `Your application for ${opportunity.title} was submitted.` } });
    return res.status(201).json({ success: true, application });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "You have already applied to this opportunity." });
    console.error("Apply error:", error); return res.status(500).json({ success: false, message: "Could not submit application." });
  }
}
async function getMyApplications(req, res) {
  try { const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } }); if (!student) return res.status(404).json({ success:false, message:"Student profile not found." });
    const applications = await prisma.application.findMany({ where: { studentId: student.id }, include: { opportunity: { include: { company: { select: { companyName:true, city:true } } } }, cvDocument: { select: { id:true, originalName:true } } }, orderBy: { submittedAt:"desc" } }); return res.json({ success:true, applications });
  } catch(error) { console.error(error); return res.status(500).json({ success:false, message:"Could not retrieve applications." }); }
}
async function getApplicants(req,res) {
  try { const company=await getCompany(req); if(!company) return res.status(404).json({success:false,message:"Company profile not found."});
    const applications=await prisma.application.findMany({where:{opportunity:{companyId:company.id}},include:{student:{include:{user:{select:{email:true}}}},opportunity:{select:{id:true,title:true}},cvDocument:{select:{id:true,originalName:true}}},orderBy:{submittedAt:"desc"}}); return res.json({success:true,applications});
  } catch(error){console.error(error);return res.status(500).json({success:false,message:"Could not retrieve applicants."});}
}
async function updateApplicationStatus(req,res) {
  const allowed=["UNDER_REVIEW","SHORTLISTED","REJECTED","ACCEPTED"];
  if(!allowed.includes(req.body?.status)) return res.status(400).json({success:false,message:"Invalid application status."});
  try { const company=await getCompany(req); if(!company) return res.status(404).json({success:false,message:"Company profile not found."});
    const application=await prisma.application.findFirst({where:{id:req.params.id,opportunity:{companyId:company.id}},include:{student:{select:{userId:true}},opportunity:{select:{title:true}}}}); if(!application) return res.status(404).json({success:false,message:"Application not found."});
    const updated=await prisma.application.update({where:{id:application.id},data:{status:req.body.status}}); await prisma.notification.create({data:{userId:application.student.userId,title:"Application status updated",message:`Your application for ${application.opportunity.title} is now ${req.body.status.replaceAll("_"," ").toLowerCase()}.`}}); return res.json({success:true,application:updated});
  } catch(error){console.error(error);return res.status(500).json({success:false,message:"Could not update application."});}
}
module.exports = {
  createOpportunity,
  getCompanyOpportunities,
  updateOpportunity,
  closeOpportunity,
  getAvailableOpportunities,
  applyToOpportunity, getMyApplications, getApplicants, updateApplicationStatus,
};
