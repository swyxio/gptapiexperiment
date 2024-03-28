
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
console.log("responseJSON", responseJSON.choices[0].message.tool_calls[0].function); 




// JSON MODE

const responseJSON = await openai.chat.completions.create({
  model: "gpt-4-1106-preview",
  messages: [
    {
      role: "system",
      content: "you are a helpful assistant",
    },
    {
      role: "user",
      content: `Choose a famous pop artist, and give me 3 songs by them.

  Return json in this schema:
${JSON.stringify(zodToJsonSchema(z.object({
  artist: z.string({ description: "The name of the artist" }),
  tags: z.array(tagSchema).min(3).max(6),
})), null, 2)}
      
      `,
    },
  ],
  response_format: { type: "json_object" },
  // tools,
  // tool_choice: "auto", // auto is default, but we'll be explicit
});
console.log("responseJSON", responseJSON.choices[0].message.tool_calls[0].function); 

// response2 {
//   role: 'assistant',
//   content: '{\n' +
//     '  "type": "object",\n' +
//     '  "properties": {\n' +
//     '    "artist": {\n' +
//     '      "type": "string",\n' +
//     '      "description": "Adele"\n' +
//     '    },\n' +
//     '    "tags": {\n' +
//     '      "type": "array",\n' +
//     '      "items": [\n' +
//     '        {\n' +
//     '          "type": "object",\n' +
//     '          "properties": {\n' +
//     '            "title": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "Hello"\n' +
//     '            },\n' +
//     '            "description": {\n' +
//     '              "type": "string",\n' +
//     `              "description": "A soulful ballad from Adele's third studio album, touching on themes of nostalgia and regret."\n` +
//     '            },\n' +
//     '            "date": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "2015"\n' +
//     '            }\n' +
//     '          },\n' +
//     '          "required": [\n' +
//     '            "title",\n' +
//     '            "description",\n' +
//     '            "date"\n' +
//     '          ],\n' +
//     '          "additionalProperties": false\n' +
//     '        },\n' +
//     '        {\n' +
//     '          "type": "object",\n' +
//     '          "properties": {\n' +
//     '            "title": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "Someone Like You"\n' +
//     '            },\n' +
//     '            "description": {\n' +
//     '              "type": "string",\n' +
//     `              "description": "A poignant expression of a once-loved relationship that ended, characterized by Adele's signature vocal power."\n` +
//     '            },\n' +
//     '            "date": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "2011"\n' +
//     '            }\n' +
//     '          },\n' +
//     '          "required": [\n' +
//     '            "title",\n' +
//     '            "description",\n' +
//     '            "date"\n' +
//     '          ],\n' +
//     '          "additionalProperties": false\n' +
//     '        },\n' +
//     '        {\n' +
//     '          "type": "object",\n' +
//     '          "properties": {\n' +
//     '            "title": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "Rolling in the Deep"\n' +
//     '            },\n' +
//     '            "description": {\n' +
//     '              "type": "string",\n' +
//     `              "description": "An upbeat, soul-pop anthem that showcases Adele's abilities to convey deep emotion whilst empowering listeners."\n` +
//     '            },\n' +
//     '            "date": {\n' +
//     '              "type": "string",\n' +
//     '              "description": "2010"\n' +
//     '            }\n' +
//     '          },\n' +
//     '          "required": [\n' +
//     '            "title",\n' +
//     '            "description",\n' +
//     '            "date"\n' +
//     '          ],\n' +
//     '          "additionalProperties": false\n' +
//     '        }\n' +
//     '      ],\n' +
//     '      "minItems": 3,\n' +
//     '      "maxItems": 3\n' +
//     '    }\n' +
//     '  },\n' +
//     '  "required": [\n' +
//     '    "artist",\n' +
//     '    "tags"\n' +
//     '  ],\n' +
//     '  "additionalProperties": false,\n' +
//     '  "$schema": "http://json-schema.org/draft-07/schema#"\n' +
//     '}'
// }