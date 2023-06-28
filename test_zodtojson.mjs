// import zod to json schema
import { zodToJsonSchema } from "zod-to-json-schema"
import { z, ZodType } from 'zod'



const tagSchema = z.array(z.array(
  z.string({ description: "A short tag describing the topic of the conversation, using acronyms and phrasing familiar for a developer and investor audience. e.g. Docker, CLIs, Compute, Audio, AI, 3D, Security, Gaming." }),
  z.number({ description: "Confidence level for the tag tag, a value between 0 to 1." }).min(0).max(1)))
// const confidenceSchema = z.number({ description: "Confidence level for each tag, a value between 0 to 1." }).min(0).max(1);

const printSchema = z.object({
  title: z.string({ description: "Verbatim title of the story" }),
  tags: z.array(tagSchema).min(3).max(6),
  // tags_confidence: z.array(confidenceSchema)
});

console.log('printSchema', printSchema)



const jsonSchema = printSchema instanceof ZodType
? zodToJsonSchema(printSchema)
: printSchema;
console.log("adding function", jsonSchema);