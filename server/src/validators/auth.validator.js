
const { z } = require("zod");

const studentRegistrationSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(12).max(128),
  university: z.string().trim().min(2).max(150),
  programme: z.string().trim().min(2).max(150),
  studyYear: z.number().int().min(1).max(8),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(),

});

const companyRegistrationSchema = z.object({
  companyName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  password: z.string().min(12).max(128),
  industry: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  registrationNumber: z.string().trim().max(100).optional(),
 
});
 const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});
 module.exports = {
  studentRegistrationSchema,
  companyRegistrationSchema,
  loginSchema,
};