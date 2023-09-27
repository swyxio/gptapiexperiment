import { AI } from "./smolaiprototype";

async function ss() {
  const myAI = new AI("You are a helpful chatbot.");
  // myAI.chat([
  //   "Explain how large language models work in 5 levels - from absolute beginniner to the industry expert.",
  // ]);

  const { ChromaClient } = require("chromadb");
  const client = new ChromaClient();
  const collection = await client.createCollection({ name: "my_collection" });
  await collection.add({
    ids: ["id1", "id2"],
    metadatas: [{ source: "my_source" }, { source: "my_source" }],
    documents: ["This is a document", "This is another document"],
  });

  const results = await collection.query({
    nResults: 2,
    queryTexts: ["This is a query document"],
  });
  console.log(results);
  myAI.context = collection;

  myAI.subscribe((value: Uint8Array) => {
    console.log("value", value);
  });
}

ss();
