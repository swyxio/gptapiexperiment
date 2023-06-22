
import { Configuration, OpenAIApi } from "openai"
import { zodToJsonSchema } from "zod-to-json-schema"

import { SmolLogger } from '@smol-ai/logger'

const logger = new SmolLogger(true)
const log = logger.log

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
  const fn = registeredFunctions[fnName]
  return {
    name: fnName,
    zodSchema: fn.zodSchema,
    parameters: zodToJsonSchema(fn.zodSchema),
    fullFunction: fn.fullFunction,
  }
}

function listFunctions() {
  return Object.keys(registeredFunctions).map(getFunction)
}


const retryLimit = 5
let attempts = 0
export async function extraChat(messages, function_call) {
  log('starting extraChat', messages, function_call)
  let chatCompletion = null
  let functions = listFunctions()
  const logStack = [logger.logName] // store original logName fn at the bottom of the stack
  logger.logName = (name) => logStack.reduce((prev, fn) => fn(prev), name)
  const wrap = logger.wrap(openai.createChatCompletion.bind(openai), {

    wrapLogName: 'chatGPT APIcall', // optional - customize the name that shows up on the log. defaults to "wrap(fn.name)"
    logTransformer: (args, result) => ({ // can be async
      // ...result, // optional - if you want the full raw result itself
      prompt: args[0].messages,
      response: result.data.choices[0].message,
    })
  });
  let shouldRetry = false
  do {
    shouldRetry = false
    chatCompletion = await wrap({
      // model: "gpt-4-0613",
      model: "gpt-3.5-turbo-0613",
      messages,
      functions: functions.map(fn => ({
        name: fn.name,
        parameters: fn.parameters
      })),
      function_call,
    });
    logStack.unshift(name => '   ' + name)

    let selectedFunction
    let args
    if (chatCompletion.data.choices[0].message.function_call) {
      function_call = chatCompletion.data.choices[0].message.function_call
      selectedFunction = getFunction(function_call.name)
      if (selectedFunction) {
        try {
          log('Attempt ' + attempts + ': attempting arg parse', function_call.arguments)
          const json = JSON.parse(function_call.arguments)
          log('Attempt ' + attempts + ': attempting schema parse', json)
          args = selectedFunction.zodSchema.parse(json)
        } catch (err) {
          log('Attempt ' + attempts + ': invalid arguments', err)
          messages.push({ role: "function", name: selectedFunction.name, content: function_call.arguments })
          messages.push({ role: "user", content: "Your function call involved invalid arguments. " + err }) // todo: maybe break this up based on the schema parse. hard bc have 2 points of failure based on the json parse as well
          function_call = undefined // or else will infinitely recurse
          shouldRetry = true
          // throw new Error('temporary error here just to how exactly this happens')
        }
      } else {
        log('Attempt ' + attempts + ': function not found', chatCompletion.data.choices[0].message.function_call)
        throw new Error('unexpected error2')
      }
    } else {
      // not a function call
      log('Attempt ' + attempts + ': not a function call', chatCompletion.data.choices[0].message)
      messages.push(chatCompletion.data.choices[0].message)
      shouldRetry = true
      selectedFunction = false
      // throw new Error('unexpected error - not a function call')
    }
    if (!shouldRetry && selectedFunction) {
      // function found, args found
      log('trying function', selectedFunction, 'with args', args)
      const results = await selectedFunction.fullFunction(args) // call the function
      log('returned results', results)
      messages.push({ role: "function", name: selectedFunction.name, content: JSON.stringify(results) })
      log('added function results to messages', messages)
    }
    logStack.shift()
  } while (shouldRetry && attempts++ < retryLimit)
  log('finished extraChat', messages, function_call)
  return chatCompletion;
}