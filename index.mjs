import OpenAI from "openai";
// write to disk
import fs from "fs";

// error if process.env["OPENAI_API_KEY"] empty
if (!process.env["OPENAI_API_KEY"]) {
  throw new Error("OPENAI_API_KEY is empty");
}

try {
  const openai = new OpenAI({
    // apiKey: 'my api key', // defaults to process.env["OPENAI_API_KEY"]
  });

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello world" }],
  });
  console.log("chatCompletion", chatCompletion.choices[0].message);
} catch (err) {
  fs.writeFileSync("chat.json", JSON.stringify(err, null, 2));
}
