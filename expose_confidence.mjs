
import { SmolLogger } from '@smol-ai/logger';
import { z, ZodType } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema"
import {
  Configuration,
  OpenAIApi,
  SmolAI
} from 'smolai';

const tagSchema = z.string({ description: "Suggested tags that should be short. e.g. Docker, Audio, AI, 3D, Security, Gaming." });
const confidenceSchema = z.number({ description: "Confidence level for each tag, a value between 0 to 1." }).min(0).max(1);

const printSchema = z.object({
  title: z.string({ description: "Verbatim title of the story" }),
  tags: z.array(tagSchema).min(3).max(6),
  tags_confidence: z.array(confidenceSchema)
});

let counter = 0
console.log('printSchema ' + counter++, printSchema)



// const jsonSchema = printSchema instanceof ZodType
// ? zodToJsonSchema(printSchema)
// : printSchema)



const logger = new SmolLogger(true);
console.log('printSchema ' + counter++, printSchema)

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log('printSchema ' + counter++, printSchema)
const openai = new OpenAIApi(configuration);
console.log('printSchema ' + counter++, printSchema)
const smolai = new SmolAI(openai, `You are a bot that suggests appropriate tags given a Hacker News blog post title and comments, together with the degree of confidence in the tag.
        
Suggested tags should be short. One word, as far as possible.
e.g. Docker, Audio, AI, 3D, Security.

The user will give you a title, respond with the tags you think are appropriate.
`);

console.log('printSchema ' + counter++, printSchema)

function print({ title, tags, tags_confidence }) {
  console.log("Title: " + title);
  console.log("Tags: " + tags);
  console.log("Confidence: " + tags_confidence);
}

console.log('printSchema ' + counter++, printSchema)
// console.log("adding function", jsonSchema);
logger.log('printSchema', printSchema);
smolai.log = logger.log;

smolai.addFunction(print, printSchema);

const wrapped = logger.wrap(openai.createChatCompletion.bind(openai),  // binding is impt bc of how OpenAI internally retrieves its config
  {
    logTransformer: (args, result) => ({
      // ...result, // optional - if you want the full raw result itself
      prompt: args[0].messages,
      response: result.data// .choices, //[0].message,
    })
  })

async function generateTitle({ title, comments }) {
  // const response = await wrapped({
  const response = await smolai.chat({
    messages: [
      'The blog post title: ' + title,
      'The HN comments: ' + comments
    ],
    // functions: [
    //   {
    //     name: 'print',
    //     description: 'Prints suggested tags and their confidence level.',
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         tags: {
    //           type: "array",
    //           description: "Suggested tags that should be short. e.g. Docker, Audio, AI, 3D, Security, Gaming.",
    //           items: {
    //             type: "string",
    //           },
    //           "minItems": 3,
    //           "maxItems": 6,
    //           // required: true,
    //         },
    //         tags_confidence: {
    //           type: "array",
    //           description: "Confidence level for each tag, a value between 0 to 1.",
    //           items: {
    //             type: "number",
    //             // minimum and maximum values of the number
    //             minimum: 0,
    //             maximum: 1,
    //           },
    //           // mark this field as required
    //           // required: true,
    //         }
    //       }
    //     }
    //   }
    // ],
    // // function_call: 'print',
    // max_tokens: 500,
    // temperature: 0.7,
    // // top 3 choices
    // // n: 3
  })
  logger.log('response', response);
  const args = JSON.parse(response.data.choices[0].message.function_call.arguments);
  logger.log('args', args);
  // console.log(`Startup idea: ${ args.company_name } - ${ args.description }`);
  return args
}

// await get_top_stories(2).then(async (stories) => {
//   logger.log('stories', stories)
//   const tags = await Promise.all(stories.map((story) => generateTitle(story)))
//   logger.log('finalResult', stories.map(story => [story, tags[stories.indexOf(story)]]));
// })



async function get_top_stories(limit = 10) {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
  );
  const ids = await response.json();
  const stories = await Promise.all(
    ids.slice(0, limit).map((id) => get_story(id)),
  );
  return stories;
}

async function get_story(id) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
  );
  const data = await response.json();
  const title = data.title;
  const comments = await Promise.all(
    data.kids.slice(0, 10).map((_id) => fetch(
      `https://hacker-news.firebaseio.com/v0/item/${_id}.json`,
    ).then(res => res.json()).then(res => res.text)),
  );
  // console.log(comments)
  return { title, comments }
}