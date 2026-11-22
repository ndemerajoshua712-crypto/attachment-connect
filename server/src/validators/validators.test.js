const { test } = require("node:test");
const assert = require("node:assert/strict");
const { studentProfileSchema } = require("./student.validator");
const { companyProfileSchema } = require("./company.validator");
const { opportunitySchema } = require("./opportunity.validator");

test("student profile accepts valid academic details and rejects extra fields", () => {
  const valid = { firstName:"Alex",lastName:"Kim",university:"State University",programme:"Computer Science",studyYear:2,skills:["React"] };
  assert.equal(studentProfileSchema.safeParse(valid).success,true);
  assert.equal(studentProfileSchema.safeParse({...valid,role:"ADMIN"}).success,false);
});
test("company profile requires a name, industry, and city", () => {
  assert.equal(companyProfileSchema.safeParse({companyName:"Acme",industry:"Technology",city:"Nairobi"}).success,true);
  assert.equal(companyProfileSchema.safeParse({companyName:"A",industry:"Technology",city:"Nairobi"}).success,false);
});
test("opportunity validates dates and minimum description length", () => {
  const valid = {title:"Software attachment",description:"A practical attachment placement for a motivated student.",locationCity:"Nairobi",applicationDeadline:"2030-01-01",status:"DRAFT"};
  assert.equal(opportunitySchema.safeParse(valid).success,true);
  assert.equal(opportunitySchema.safeParse({...valid,description:"Short"}).success,false);
});
