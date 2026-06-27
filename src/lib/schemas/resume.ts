import { z } from "zod";

const iso8601Pattern =
  /^([1-2]\d{3}(-[0-1]\d(-[0-3]\d)?)?)?$/;

const iso8601 = z
  .string()
  .regex(iso8601Pattern, "Invalid date format. Use YYYY, YYYY-MM, or YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

const locationSchema = z.object({
  address: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  city: z.string().optional().default(""),
  countryCode: z.string().optional().default(""),
  region: z.string().optional().default(""),
});

const profileSchema = z.object({
  network: z.string().optional().default(""),
  username: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

const basicsSchema = z.object({
  name: z.string().optional().default(""),
  label: z.string().optional().default(""),
  image: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  url: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  location: locationSchema.optional().default({
    address: "",
    postalCode: "",
    city: "",
    countryCode: "",
    region: "",
  }),
  profiles: z.array(profileSchema).optional().default([]),
});

const workSchema = z.object({
  name: z.string().optional().default(""),
  location: z.string().optional().default(""),
  description: z.string().optional().default(""),
  position: z.string().optional().default(""),
  url: z.string().optional().default(""),
  startDate: iso8601.default(""),
  endDate: iso8601.default(""),
  summary: z.string().optional().default(""),
  highlights: z.array(z.string()).optional().default([]),
});

const volunteerSchema = z.object({
  organization: z.string().optional().default(""),
  position: z.string().optional().default(""),
  url: z.string().optional().default(""),
  startDate: iso8601.default(""),
  endDate: iso8601.default(""),
  summary: z.string().optional().default(""),
  highlights: z.array(z.string()).optional().default([]),
});

const educationSchema = z.object({
  institution: z.string().optional().default(""),
  url: z.string().optional().default(""),
  area: z.string().optional().default(""),
  studyType: z.string().optional().default(""),
  startDate: iso8601.default(""),
  endDate: iso8601.default(""),
  score: z.string().optional().default(""),
  courses: z.array(z.string()).optional().default([]),
});

const awardSchema = z.object({
  title: z.string().optional().default(""),
  date: iso8601.default(""),
  awarder: z.string().optional().default(""),
  summary: z.string().optional().default(""),
});

const certificateSchema = z.object({
  name: z.string().optional().default(""),
  date: iso8601.default(""),
  url: z.string().optional().default(""),
  issuer: z.string().optional().default(""),
});

const publicationSchema = z.object({
  name: z.string().optional().default(""),
  publisher: z.string().optional().default(""),
  releaseDate: iso8601.default(""),
  url: z.string().optional().default(""),
  summary: z.string().optional().default(""),
});

const skillSchema = z.object({
  name: z.string().optional().default(""),
  level: z.string().optional().default(""),
  keywords: z.array(z.string()).optional().default([]),
});

const languageSchema = z.object({
  language: z.string().optional().default(""),
  fluency: z.string().optional().default(""),
});

const interestSchema = z.object({
  name: z.string().optional().default(""),
  keywords: z.array(z.string()).optional().default([]),
});

const referenceSchema = z.object({
  name: z.string().optional().default(""),
  reference: z.string().optional().default(""),
});

const projectSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  highlights: z.array(z.string()).optional().default([]),
  keywords: z.array(z.string()).optional().default([]),
  startDate: iso8601.default(""),
  endDate: iso8601.default(""),
  url: z.string().optional().default(""),
  roles: z.array(z.string()).optional().default([]),
  entity: z.string().optional().default(""),
  type: z.string().optional().default(""),
});

const metaSchema = z.object({
  canonical: z.string().optional().default(""),
  version: z.string().optional().default(""),
  lastModified: z.string().optional().default(""),
});

export const resumeSchema = z.object({
  basics: basicsSchema.default(() => basicsSchema.parse({})),
  work: z.array(workSchema).default([]),
  volunteer: z.array(volunteerSchema).default([]),
  education: z.array(educationSchema).default([]),
  awards: z.array(awardSchema).default([]),
  certificates: z.array(certificateSchema).default([]),
  publications: z.array(publicationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  languages: z.array(languageSchema).default([]),
  interests: z.array(interestSchema).default([]),
  references: z.array(referenceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  meta: metaSchema.default(() => metaSchema.parse({})),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Work = z.infer<typeof workSchema>;
export type Volunteer = z.infer<typeof volunteerSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Award = z.infer<typeof awardSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Interest = z.infer<typeof interestSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Meta = z.infer<typeof metaSchema>;

export function createEmptyResume(): Resume {
  return resumeSchema.parse({});
}

export function validateResume(data: unknown): {
  success: boolean;
  data?: Resume;
  errors?: string[];
} {
  const result = resumeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    ),
  };
}
