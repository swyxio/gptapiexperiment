import { SmolLogger } from "@smol-ai/logger";

const logger = new SmolLogger({ logToConsole: true, logToStore: true }); // easy to turn off
const log = logger.log; // optional convenient alias for less verbosity

const randID = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);
const dot = (a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0);
const norm = (a) => Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));

export class SmolVector {
  store = [];
  similarityFn = (a, b) => dot(a, b) / (norm(a) * norm(b));
  constructor(embeddingFn) {
    this.embeddingFn = embeddingFn;
  }
  async add(objects) {
    // in parallel, check if item already has an embedding, and if not, run it through embeddingFn
    await Promise.all(
      objects.map(async (object) => {
        if (typeof object === "string") object = { chunk: object }; // reformat it
        object.id = object.id ?? randID();
        object.embedding =
          object.embedding ?? (await this.embeddingFn(object.chunk)).data;
        this.store.push(object);
      })
    );
  }
  async query(opts) {
    // loop through store and calculate similarity
    let queryVector = opts.query;
    if (typeof opts.query === "string")
      queryVector = (await this.embeddingFn(opts.query)).data;
    let results = this.store.map((item) => {
      return {
        ...item,
        similarity: this.similarityFn(queryVector, item.embedding),
      };
    });
    return results.sort((a, b) => b.similarity - a.similarity);
  }
}

// usage
import { pipeline } from "@xenova/transformers";

let pl = null; // must memoize pipeline fn, bc every time you call `await pipeline` it allocates new memory - Xenova
const embeddingFn = async (str) => {
  pl = pl ?? (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2"));
  return pl(str, { pooling: "mean", normalize: true });
};
const myDB = new SmolVector(embeddingFn);
await myDB.add([
  { id: 2323, chunk: "strawberry" },
  { chunk: "duck" },
  { chunk: "mango" },
  { chunk: "dog" },
  { chunk: "apple" },
  { chunk: "horse" },
  { id: 2323, chunk: "banana" },
  { id: 2323, chunk: "armadillo" },
]);
const val = await myDB.query({ query: "my favorite two-legged animal" });
console.log(
  val.map(
    // exclude embedding
    ({ embedding, ...item }) => item
  )
);
