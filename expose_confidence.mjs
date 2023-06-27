
import { SmolLogger } from '@smol-ai/logger';
// import { z } from 'zod';
import {
  Configuration,
  OpenAIApi,
} from 'smolai';

const logger = new SmolLogger(true);
const log = logger.log;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const wrapped = logger.wrap(openai.createChatCompletion.bind(openai),  // binding is impt bc of how OpenAI internally retrieves its config
  {
    logTransformer: (args, result) => ({
      // ...result, // optional - if you want the full raw result itself
      prompt: args[0].messages,
      response: result.data// .choices, //[0].message,
    })
  })

async function generateTitle(title) {
  const response = await wrapped({
    model: 'gpt-3.5-turbo-0613',
    messages: [
      {
        role: 'system',
        content: `You are a bot that suggests appropriate tags given a Hacker News blog post title, together with the degree of confidence in the tag.
        
        Suggested tags should be short. One word, as far as possible.
        e.g. Docker, Audio, AI, 3D, Security.

        The user will give you a title, respond with the tags you think are appropriate.
        `
      },
      {
        role: 'user',
        content: 'Create tags for the following blog post title: ' + title
      },
    ],
    functions: [
      {
        name: 'print',
        description: 'Prints suggested tags.',
        parameters: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              description: "Suggested tags that should be short. e.g. Docker, Audio, AI, 3D, Security, Gaming.",
              items: {
                type: "string",
              },
              "minItems": 3,
              "maxItems": 6,
              // required: true,
            },
            tags_confidence: {
              type: "array",
              description: "Confidence level for each tag, a value between 0 to 1.",
              items: {
                type: "number",
                // minimum and maximum values of the number
                minimum: 0,
                maximum: 1,
              },
              // mark this field as required
              // required: true,
            }
          }
        }
      }
    ],
    // function_call: 'print',
    max_tokens: 500,
    temperature: 0.7,
    // top 3 choices
    // n: 3
  });

  logger.log('response', response);
  const args = JSON.parse(response.data.choices[0].message.function_call.arguments);
  logger.log('args', args);
  // console.log(`Startup idea: ${ args.company_name } - ${ args.description }`);
  return args
}

await get_top_stories(2).then(async (stories) => {
  logger.log('stories', stories)
  const tags = await Promise.all(stories.map((story) => generateTitle(story)))
  logger.log('tags', {stories, tags});
})



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
  return data.title;
}