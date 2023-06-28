import { SmolLogger } from '@smol-ai/logger';
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema"
import {
  Configuration,
  OpenAIApi,
  SmolAI
} from 'smolai'; // just a nice DX overlay on top of OpenAI's API

const logger = new SmolLogger()
const tagSchema = z.object({
    tag: z.string({ description: "A short Wikipedia-style news story tag describing the topic of the conversation, using acronyms and phrasing familiar for a developer and investor audience. e.g. Docker, CLIs, Compute, Audio, AI, 3D, Security, Gaming." }),
    confidence: z.number({ description: "Confidence level for the tag, a value between 0 to 1." }).min(0).max(1)
})

const printSchema = zodToJsonSchema(z.object({
  title: z.string({ description: "Verbatim title of the story" }),
  tags: z.array(tagSchema).min(3).max(6),
}));

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const smolai = new SmolAI(openai, `You are a bot that suggests appropriate Wikipedia-style news story tags given a Hacker News blog post title and comments, together with the degree of confidence in the tag. Suggested tags should be short. One word, as far as possible. e.g. Docker, Audio, AI, 3D, Security. The user will give you a title, respond with the tags you think are appropriate.`);

const print = ({ title, tags }) => title + tags // dont really care about the impl of print
smolai.addFunction(print, printSchema); // schema is validated coming in and going out
smolai.model = 'gpt-4-0613'

const stories = await get_top_stories(1)
const tags = await Promise.all(stories.map((story) => generateTitle(story)))
logger.log('finalResult', stories.map(story => ({...story, ...tags[stories.indexOf(story)]})));

async function generateTitle({ title, comments }) {
  // const response = await wrapped({
  const response = await smolai.chat({
    messages: [
      'The post title: ' + title,
      'The HN comments: ' + comments
    ],
  })
  const args = JSON.parse(response.choices[0].message.function_call.arguments);
  return args
}
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
  // logger.log('data', data)
  const title = data.title;
  let comments 
  if (data.kids) {
    comments = await Promise.all(
      data.kids.slice(0, 10).map((_id) => fetch(
        `https://hacker-news.firebaseio.com/v0/item/${_id}.json`,
      ).then(res => res.json()).then(res => res.text)),
    );
  }
  return { title, comments }
}