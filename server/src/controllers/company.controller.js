
const prisma = require("../db");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const {
  companyProfileSchema,
} = require("../validators/company.validator");

// Get the logged-in company's profile
const getCompanyProfile = async (req, res) => {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get company profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve company profile.",
    });
  }
};

// Update the logged-in company's profile
const updateCompanyProfile = async (req, res) => {
  try {
    const validation = companyProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid company profile details.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const company = await prisma.companyProfile.update({
      where: {
        userId: req.user.id,
      },
      data: {
        companyName: validation.data.companyName,
        industry: validation.data.industry,
        description: validation.data.description,
        city: validation.data.city,
        address: validation.data.address,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully.",
      company,
    });
  } catch (error) {
    console.error("Update company profile error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not update company profile.",
    });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
};

async function uploadCompanyLogo(req, res) {
  let savedPath;
  try {
    if (!req.file) return res.status(400).json({success:false,message:"Select a logo image first."});
    const b=req.file.buffer;const valid={"image/jpeg":b[0]===0xff&&b[1]===0xd8&&b[2]===0xff,"image/png":b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),"image/webp":b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP"};
    if(!valid[req.file.mimetype])return res.status(400).json({success:false,message:"The selected file is not a valid image."});
    const ext={"image/jpeg":".jpg","image/png":".png","image/webp":".webp"}[req.file.mimetype];const name=`${randomUUID()}${ext}`;const dir=path.join(__dirname,"../../uploads/company-logos");await fs.mkdir(dir,{recursive:true});savedPath=path.join(dir,name);await fs.writeFile(savedPath,b,{flag:"wx"});
    const company=await prisma.companyProfile.update({where:{userId:req.user.id},data:{logoStorageKey:`company-logos/${name}`},select:{id:true,logoStorageKey:true}});return res.json({success:true,company});
  }catch(error){if(savedPath)await fs.unlink(savedPath).catch(()=>{});console.error("Company logo upload error:",error);return res.status(500).json({success:false,message:"Could not upload company logo."});}
}
