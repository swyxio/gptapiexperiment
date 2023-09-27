import { Pipeline, pipeline } from "@xenova/transformers";

type Item = {
  id?: string;
  metadata?: JSON;
  chunk?: string;
  embedding?: number[];
};

function randID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(8);
}
const dot = (a: number[], b: number[]) =>
  a.reduce((acc, v, i) => acc + v * b[i], 0);
const norm = (a: number[]) => Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
export class SmolVector {
  store: Item[] = [];
  similarityFn = (a: number[], b: number[]) => dot(a, b) / (norm(a) * norm(b));
  extractor: Pipeline | undefined;
  constructor(extractor?: Pipeline) {
    (async () => {
      this.extractor =
        extractor ??
        (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2"));
      console.log("hiiii");
    })();
  }
  async add(objects: (Item | string)[]) {
    // in parallel, check if item already has an embedding, and if not, run it through extractor
    await Promise.all(
      objects.map(async (object) => {
        if (typeof object === "string") object = { chunk: object }; // reformat it
        object.id = object.id ?? randID();
        object.embedding =
          object.embedding ?? (await this.extractor!(object.chunk).data);
        this.store.push(object);
      })
    );
  }
  async query(opts: {
    query: string | number[];
    nResults?: number;
    topSimilarity?: number;
  }) {
    // if query is string, embed it using minilm https://github.com/xenova/transformers.js/releases/tag/2.1.0
    // Allocate a pipeline for sentiment-analysis
    // let extractor = await pipeline("feature-extraction","Xenova/all-MiniLM-L6-v2");
    // let out = await extractor("I love transformers!");
    // loop through store and calculate similarity
    let queryVector: number[];
    if (typeof opts.query === "string") {
      queryVector = await this.extractor!(opts.query).data;
    } else {
      queryVector = opts.query as number[];
    }
    let results = this.store.map((item) => {
      return {
        id: item.id,
        similarity: this.similarityFn(queryVector, item.embedding),
      };
    });
    return results;
  }
}
