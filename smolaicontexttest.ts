import { SmolVector } from "./smolaiContext";
import { Pipeline, pipeline } from "@xenova/transformers";

async function ss() {
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const myDB = new SmolVector(extractor);
  await myDB.add([
    "strawberry",
    "mango",
    "pineapple",
    "duck",
    "dog",
    "horse",
    "armadillo",
  ]);
  const val = await myDB.query({ query: "fruits" });
  console.log(val);
}

ss();
