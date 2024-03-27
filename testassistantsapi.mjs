import OpenAI from 'openai';

const openai = new OpenAI();


// // step 1 - create tutor - careful not to run 2x
// async function main() {
//   const asst = await openai.beta.assistants.create({
//     name: 'Singing Tutor',
//     instructions: "You are a personal singing tutor. Answer questions briefly, in a sentence or less.",
//     model: "gpt-4-1106-preview",
//   })
  
//   console.log({asst})
// }

async function main() {
  const thread = await openai.beta.threads.create()
  const message = await openai.beta.threads.messages.create({
      thread_id: thread.id,
      role: "user",
      content: "I need to solve the equation `3x + 11 = 14`. Can you help me?",
  })
  console.log(thread)
  console.log(message)
}

main();