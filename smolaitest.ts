import { AI } from "./smolaiprototype";

async function ss() {
  const myAI = new AI("You are a helpful chatbot.");
  await myAI.chat(["What is the capital of France?"]);
  myAI.subscribe((value: Uint8Array) => {
    console.log("value", value);
  });
}

ss();
