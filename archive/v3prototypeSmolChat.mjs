// this is the prototype of the functionality that is now in smolai.chat. you shouldnt need this anymore except for reference

import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { SmolLogger } from "./logger";

class ChatAssistant {
  constructor(apiKey, retryLimit = 5) {
    this.config = new Configuration({ apiKey });
    this.openai = new OpenAIApi(this.config);
    this.registeredFunctions = {};
    this.isLoggingActive = isLoggingActive;
    this.retryLimit = retryLimit;
    this.attempts = 0;
    this.logger = new SmolLogger(true);
  }

  addFunction(fn, optionalZodSchema) {
    this.registeredFunctions[fn.name] = {
      fullFunction: fn,
      zodSchema: optionalZodSchema,
    };
  }

  deregisterFunction(fn) {
    delete this.registeredFunctions[fn.name];
  }

  getFunction(fnName) {
    const fn = this.registeredFunctions[fnName];
    return {
      name: fnName,
      zodSchema: fn.zodSchema,
      parameters: zodToJsonSchema(fn.zodSchema),
      fullFunction: fn.fullFunction,
    };
  }

  listFunctions() {
    return Object.keys(this.registeredFunctions).map((fnName) =>
      this.getFunction(fnName)
    );
  }

  async extraChat(messages, function_call) {
    this.logger.log("starting extraChat", messages, function_call);
    let chatCompletion = null;
    let shouldRetry = false;
    let functions = this.listFunctions();

    do {
      chatCompletion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages,
        functions,
        function_call,
      });

      function_call = chatCompletion.data.choices[0].message.function_call;
      const selectedFunction = this.getFunction(function_call.name);
      let args;

      if (selectedFunction) {
        try {
          this.logger.log("attempting arg parse", function_call.arguments);
          const json = JSON.parse(function_call.arguments);
          this.logger.log("attempting schema parse", json);
          args = selectedFunction.zodSchema.parse(json);
        } catch (err) {
          this.logger.log("invalid arguments", err);
          messages.push({
            role: "user",
            content: "Your function call involved invalid arguments. " + err,
          });
          shouldRetry = true;
          throw new Error(
            "temporary error here just to show exactly how this happens"
          );
        }
      } else {
        this.logger.log(
          "function not found",
          chatCompletion.data.choices[0].message.function_call
        );
        throw new Error("unexpected error2");
      }

      this.logger.log("trying function", selectedFunction, "with args", args);
      const results = await selectedFunction.fullFunction(args);
      this.logger.log("returned results", results);
      messages.push({
        role: "function",
        name: selectedFunction.name,
        content: JSON.stringify(results),
      });
      this.logger.log("added function results to messages", messages);
    } while (shouldRetry && this.attempts < this.retryLimit);

    this.logger.log("finished extraChat", messages, function_call);
    return chatCompletion;
  }
}
