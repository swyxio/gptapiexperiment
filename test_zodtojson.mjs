// import zod to json schema
import { zodToJsonSchema } from "zod-to-json-schema"
import { z, ZodType } from 'zod'


const tagSchema = z.string({ description: "Suggested tags that should be short. e.g. Docker, Audio, AI, 3D, Security, Gaming." });
const confidenceSchema = z.number({ description: "Confidence level for each tag, a value between 0 to 1." }).min(0).max(1);

const printSchema = z.object({
  title: z.string({ description: "Verbatim title of the story" }),
  tags: z.array(tagSchema).min(3).max(6),
  tags_confidence: z.array(confidenceSchema)
});

console.log('printSchema', printSchema)



const jsonSchema = printSchema instanceof ZodType
? zodToJsonSchema(printSchema)
: printSchema;
console.log("adding function", jsonSchema);