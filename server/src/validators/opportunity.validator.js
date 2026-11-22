
const { z } = require("zod");

const opportunitySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(30).max(5000),

  requirements: z
    .array(z.string().trim().min(2).max(250))
    .max(30)
    .default([]),

  fieldOfStudy: z.string().trim().max(150).nullable().optional(),

  locationCity: z.string().trim().min(2).max(100),

  durationMonths: z.number().int().min(1).max(36).nullable().optional(),

  positionsAvailable: z.number().int().min(1).max(100).default(1),

  applicationDeadline: z.coerce.date(),

  startDate: z.coerce.date().nullable().optional(),

  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).default("DRAFT"),
});

module.exports = {
  opportunitySchema,
};
