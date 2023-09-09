import { SmolLogger } from '@smol-ai/logger';
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema"
import {
  Configuration,
  OpenAIApi,
  SmolAI
} from 'smolai'; // just a nice DX overlay on top of OpenAI's API

const logger = new SmolLogger()

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const smolai = new SmolAI(openai, `You are a bot that suggests appropriate Wikipedia-style news story tags given a Hacker News blog post title and comments, together with the degree of confidence in the tag. Suggested tags should be short. One word, as far as possible. e.g. Docker, Audio, AI, 3D, Security. The user will give you a title, respond with the tags you think are appropriate.`);
smolai.model = 'gpt-4-0613'

// print function
const generate = ({ plan }) => plan // dont really care about the impl of print
smolai.addFunction(
  generate, 
  z.string({ description: "Generate a " })
); // schema is validated coming in and going out
// print function



const response = await smolai.chat({
  messages: [
    'The post title: ' + title,
    'The HN comments: ' + comments
  ],
})