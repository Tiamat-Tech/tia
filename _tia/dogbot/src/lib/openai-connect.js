const OpenAI = require("openai");
const openai = new OpenAI();

module.exports.promptAI = async function (message) {
  await promptAI(message);
}

var promptAI = async function (message) {
  console.log('AI prompted with : ' + message)

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  })

  const JSON = require('JSON')

  aiResponse = completion.choices[0]
  aiText = aiResponse['message']['content']
  console.log('AI responds : ' + aiText)
  return aiText
}

/*


*/

// AI responds : {"index":0,"message":{"role":"assistant","content":"How can I assist you today?"},"finish_reason":"stop"}