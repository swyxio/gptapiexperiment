
import {SmolLogger} from '@smol-ai/logger';

import {
  Configuration,
  OpenAIApi,
} from 'smolai';

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const logger = new SmolLogger({ logToConsole: true, logToStore: true });
const log = logger.log;

const wrapped = logger.wrap(
  openai.chat.completions.create.bind(openai), // binding is impt bc of how OpenAI internally retrieves its config
  {
    logTransformer: (args, result) => ({
      // ...result, // optional - if you want the full raw result itself
      prompt: args[0].messages,
      response: result.choices[0].message,
    }),
  }
);
// const wrapped = openai.createChatCompletion.bind(openai)

const response = await wrapped({
  model: "gpt-3.5-turbo-0613",
  messages: [
    {
      role: "system",
      content: "you are a helpful assistant",
    },
    {
      role: "user",
      content: "Choose a famous pop artist, and give me 3 songs by them",
    },
  ],
});

console.log("response", response); 


// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env["OPENAI_API_KEY"],
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "user", content: "Say this is a test" }],
//     model: "gpt-3.5-turbo",
//   });

//   console.log(completion.choices);
// }

// main();