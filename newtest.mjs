
import {SmolLogger} from '@smol-ai/logger';

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
    response: result.data.choices[0].message,
  })
})
// const wrapped = openai.createChatCompletion.bind(openai)

const response = await wrapped({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: 'you are a helpful assistant',
    },
    {
      role: 'user',
      content: 'Choose a famous pop artist, and give me 3 songs by them',
    }
  ]
})

console.log('response', response) 