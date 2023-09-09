import OpenAI from "openai";
// write to disk
import fs from "fs";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";

// error if process.env["OPENAI_API_KEY"] empty
if (!process.env["OPENAI_API_KEY"]) {
  throw new Error("OPENAI_API_KEY is empty");
}

const openai = new OpenAI({
  // apiKey: 'my api key', // defaults to process.env["OPENAI_API_KEY"]
});

function notNull(
  val: CreateChatCompletionRequestMessage | null
): val is CreateChatCompletionRequestMessage {
  return !!val;
}
const defaultModel = async (opt: {
  system?: string;
  context?: string;
  message: string;
  model?: string;
}) => {
  let messages = [
    opt.system && { role: "system" as const, content: opt.system },
    opt.context && { role: "user" as const, content: opt.context },
    { role: "user" as const, content: opt.message },
  ] as XMessage[];
  messages = messages.filter(notNull);
  return openai.chat.completions.create({
    model: opt.model || "gpt-3.5-turbo",
    messages,
    stream: true,
  });
};
export class AI {
  private memory: Memory = { store: [] };
  private context: VectorDB = { store: [] };
  stream = new ReadableStream();
  model = defaultModel;
  systemPrompt = "You are a helpful assistant.";
  controller: ReadableStreamDefaultController | null = null;
  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.controller = null;

    // Create a ReadableStream and store the controller for future use
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
    });
  }

  // Method to fetch data from OpenAI API and enqueue it into our stream
  async chat(messages: string[]) {
    try {
      //  Type 'Stream<ChatCompletionChunk> | ChatCompletion' must have a '[Symbol.asyncIterator]()' method that returns an async iterator.
      const stream: any = await this.model({
        model: "gpt-3.5-turbo",
        system: this.systemPrompt,
        message: messages.join("\n"),
      });

      for await (const part of stream) {
        this.controller?.enqueue(part.choices[0]?.delta?.content || "");
      }
    } catch (error) {
      console.error("Error fetching from OpenAI:", error);
      this.controller?.error(error);
    }
  }

  // Method to close the stream manually
  close() {
    if (this.controller) {
      this.controller.close();
    }
  }

  // Method to subscribe to the stream
  subscribe(onData: Function, onError?: Function, onComplete?: Function) {
    const reader = this.stream.getReader();

    const read = async () => {
      try {
        const { done, value } = await reader.read();

        if (done) {
          if (onComplete) await onComplete();
        } else {
          await onData(value);
          read(); // Recursively read the next chunk
        }
      } catch (error) {
        if (onError) await onError(error);
      }
    };

    read();
  }
}

type Memory = {
  store: XMessage[];
};

type ID = number | string;

interface Author {
  id: ID;
  userId?: ID;
  personaId: ID;
  createdAt: Date;
  deletedAt?: Date;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface BaseMessage {
  role: "user" | "assistant" | "function" | "system"; // string
  name?: string; // only used by openai when it is calling function. dont overload
  function_call?: FunctionCall;
  content: string;

  // stuff added by extended msg standard
  messageId: string; // the unique identifying ID of this message
  chatId: string; // the id of the chat this message is associated with
  fromAuthor: Author;
  toAuthor: Author;
  created_at: Date;
  deleted_at?: Date;
}

export type AssistantMessage = BaseMessage & {
  role: "assistant";
  assistantMessageType: "log" | "error";
  assistantMessageDetails: string; // eg 'rate-limit'
};

export type XMessage = BaseMessage | AssistantMessage;
