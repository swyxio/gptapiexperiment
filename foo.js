import { log } from "console";

const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const zod = require('zod');
const { zodToJsonSchema } = require("zod-to-json-schema");

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config)

export const registeredFunctions = {}

export function addFunction(fn, optionalZodSchema) {
  registeredFunctions[fn.name] = {
    fullFunction: fn,
    zodSchema: optionalZodSchema,
  }
}
export function deregisterFunction(fn) {
  // delete registeredFunctions[fn.name]
  delete registeredFunctions[fn.name]
}

function getFunction(fnName) {
  return {
    name: fnName,
    parameters: zodToJsonSchema(registeredFunctions[fnName].zodSchema),
  }
}

function getFunctions() {
  return Object.keys(registeredFunctions).map(getFunction)
}


const retryLimit = 5
const attempts = 0
export async function extraChat(messages, function_call) {
  logStuff('starting extraChat', messages, function_call)
  let chatCompletion = null
  let shouldRetry = false
  let functions = getFunctions()
  do {
      chatCompletion = await openai.createChatCompletion({
        model: "gpt-4-32k-0613",
        messages,
        functions,
        function_call,
      });
  
    if (chatCompletion.data.choices[0].message.function_call) {
      const selectedFunction = functions[function_call.name]
      let args
      if (selectedFunction) {
        try {
          const json = JSON.parse(function_call.arguments)
          args = Schema.parse(json)
        } catch (err) {
          logStuff('invalid arguments', err)
          message.append({role: "user", content: "Your function call involved invalid arguments. " + err})
          shouldRetry = true
        }
      } else {
        logStuff('function not found', function_call.name)
      }
      // function found, args found
      logStuff('trying function', selectedFunction, 'with args', args)
      const results = await selectedFunction.fullFunction(args) // call the function
      logStuff()
      messages.append({"role": "function", "name": selectedFunction.name, "content": results})
      shouldRetry = true
    }
  } while (shouldRetry && attempts < retryLimit)
  return chatCompletion;
}


const IsLoggingActive = true
const counter = 0
function logStuff(...args) {
  if (IsLoggingActive) {
    console.log('log ' + counter, ...args)
    fs.writeFileSync('chat' + counter++ + '.json', JSON.stringify(args, null, 2));
  }
}