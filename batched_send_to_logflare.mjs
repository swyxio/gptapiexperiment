
import { Configuration, OpenAIApi } from "openai"
import fs from 'fs'
import path from 'path'
import { zodToJsonSchema } from "zod-to-json-schema"

import { SmolLogger } from '@smol-ai/logger'

const logger = new SmolLogger(true)
const log = logger.log

const logMessages = []

function throttle(func, delay = 1000) {
  let timeout = null;
  return function(...args) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.call(this, ...args);
        timeout = null;
      }, delay);
    }
  };
}

const sendToLogFlare = ({ logName, loggedLine, payload, secondsSinceStart, secondsSinceLastLog }) => {
  fetch("https://api.logflare.app/logs/json?source=11b491d8-317c-49e3-a4b6-7310a396d3a2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-API-KEY": "INr4xzvNt9Bc"
    },
    body: JSON.stringify({"batch": logMessages})
  })
  .then(() => logMessages = [])
}

log.store = throttle(sendToLogFlare, 1000)

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
const attempts = 0
export async function extraChat(messages, function_call) {
  log('starting extraChat', messages, function_call)
  let chatCompletion = null
  let shouldRetry = false
  let functions = listFunctions()
  do {
      chatCompletion = await openai.createChatCompletion({
        // model: "gpt-4-32k-0613",
        model: "gpt-3.5-turbo-0613",
        ...log('calling OpenAI with args', {
          messages,
          functions,
          function_call,
        })
      });
  
    function_call = chatCompletion.data.choices[0].message.function_call
    const selectedFunction = getFunction(function_call.name)
    let args

    if (selectedFunction) {
      try {
        log('Attempt ' + attempts + ': attempting arg parse', function_call.arguments)
        const json = JSON.parse(function_call.arguments)
        log('Attempt ' + attempts + ': attempting schema parse', json)
        args = selectedFunction.zodSchema.parse(json)
      } catch (err) {
        log('Attempt ' + attempts + ': invalid arguments', err)
        messages.push({role: "user", content: "Your function call involved invalid arguments. " + err})
        shouldRetry = true
        // throw new Error('temporary error here just to how exactly this happens')
      }
    } else {
      log('Attempt ' + attempts + ': function not found', chatCompletion.data.choices[0].message.function_call)
      throw new Error('unexpected error2')
    }
    if (!shouldRetry) {
      // function found, args found
      log('trying function', selectedFunction, 'with args', args)
      const results = await selectedFunction.fullFunction(args) // call the function
      log('returned results', results)
      messages.push({role: "function", name: selectedFunction.name, content: JSON.stringify(results)})
      log('added function results to messages', messages)
    }
  } while (shouldRetry && attempts < retryLimit)
  log('finished extraChat', messages, function_call)
  return chatCompletion;
}