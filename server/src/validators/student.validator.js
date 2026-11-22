
const { z } = require("zod");

const studentProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),

  phone: z.string().trim().max(25).optional().nullable(),

  university: z.string().trim().min(2).max(120),
  programme: z.string().trim().min(2).max(120),

  studyYear: z.number().int().min(1).max(8),

  city: z.string().trim().max(80).optional().nullable(),

  bio: z.string().trim().max(1000).optional().nullable(),

  skills: z.array(
    z.string().trim().min(1).max(40)
  ).max(30),
}).strict();

module.exports = {
  studentProfileSchema,
};
