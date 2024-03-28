
import OpenAI from "openai";
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema"

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});


// const response = await openai.chat.completions.create({
//   model: "gpt-4-1106-preview",
//   messages: [
//     {
//       role: "system",
//       content: "you are a helpful assistant",
//     },
//     {
//       role: "user",
//       content: "Choose a famous pop artist, and give me 3 songs by them",
//     },
//   ],
// });

// console.log("response", response); 



const tagSchema = z.object({
  title: z.string({ description: "title of song" }),
  description: z.string({ description: "Music critic's description of song" }),
  date: z.string({ description: "Music critic's description of song" }),
})

const tools = [
  {
    type: "function",
    function: {
      name: "get_artist",
      description: "Choose a famous pop artist like Adele, and give me 3 songs by them",
      parameters: zodToJsonSchema(z.object({
        artist: z.string({ description: "The name of the artist" }),
        tags: z.array(tagSchema).min(3).max(6),
      }))
    }
  }
]

console.log('tools', tools)


const response2 = await openai.chat.completions.create({
  model: "gpt-4-1106-preview",
  messages: [
    {
      role: "system",
      content: "you are a helpful assistant",
    },
    {
      role: "user",
      content: "Choose a famous pop artist like Adele, and give me 3 songs by them",
    },
  ],
  tools,
  tool_choice: "auto", // auto is default, but we'll be explicit
});

console.log("response2", response2.choices[0].message.tool_calls[0].function); 
// response2 {
//   name: 'get_artist',
//   arguments: `{"artist":"Adele","tags":[{"title":"Hello","description":"A soulful ballad from her third studio album, '25', which showcases Adele's powerful vocals and emotive lyrics about nostalgia and regret.","date":"2015"},{"title":"Someone Like You","description":"A poignant, piano-driven song about coming to terms with a breakup, from her critically acclaimed second album, '21'.","date":"2011"},{"title":"Rolling in the Deep","description":"An uptempo bluesy song that combines gospel and disco elements, which became a defining hit from her '21' album.","date":"2010"}]}`
// }