import { Configuration, OpenAIApi } from "openai";
// write to disk
import fs from 'fs'

try {
  const openai = new OpenAIApi({
    apiKey: "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"
  });

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: "Hello world"}],
  });
} catch (err) {
  fs.writeFileSync('chat.json', JSON.stringify(err, null, 2));
}

