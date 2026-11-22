
const { z } = require("zod");

const companyProfileSchema = z.object({
  companyName: z.string().trim().min(2).max(150),
  industry: z.string().trim().min(2).max(100),
  description: z.string().trim().max(3000).nullable().optional(),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().max(250).nullable().optional(),
});

module.exports = {
  companyProfileSchema,
};
