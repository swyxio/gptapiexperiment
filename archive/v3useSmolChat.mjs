import zod from 'zod'
import { addFunction, extraChat } from './prototypeFunctionChat.mjs'
// import {
//   Configuration,
//   OpenAIApi,
//   SmolAI
// } from 'smolai';


const RecipeSchema = zod.object({
  ingredients: zod.array(
    zod.object({
      name: zod.string({ description: "The name of the ingredient." }),
      unit: zod.enum(["grams", "ml", "cups", "pieces", "teaspoons"], { description: "The unit of measurement for the ingredient." }),
      amount: zod.number({ description: "The amount of the ingredient." }),
    })
  ),
  instructions: zod.array(zod.string({ description: "The instructions for preparing the recipe." })),
  time_to_cook: zod.number({ description: "The total time to prepare the recipe in minutes." }),
});

/*
  * @param {RecipeSchema} inputs
  * @returns {RecipeSchema}
* */ 
function set_recipe(inputs) {
  console.log('========recipe========');
  console.log(inputs);
  console.log('========recipe========');
  return inputs
}

let counter = 0;
console.log('RecipeSchema ' + counter++, RecipeSchema);



(async function xx() {
  console.log('ReceipSchema', RecipeSchema)

  addFunction(set_recipe, RecipeSchema);
  console.log('ReceipSchema', RecipeSchema)

  extraChat([
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Provide a recipe for spaghetti bolognese"}
  ])

})()

