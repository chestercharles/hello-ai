import { apiKey } from "./secrets.js";
import { Configuration, OpenAIApi } from "openai";

function getWinePairing(cheese: string) {
  if (cheese === "cheddar") {
    return "cabernet sauvignon";
  }
  if (cheese === "brie") {
    return "chardonnay";
  }
  if (cheese === "gouda") {
    return "merlot";
  }
  if (cheese === "gorgonzola") {
    return "riesling";
  }
  if (cheese === "parmesan") {
    return "chianti";
  }
  if (cheese === "provolone") {
    return "pinot noir";
  }
  if (cheese === "swiss") {
    return "sauvignon blanc";
  }
  return "pinot noir";
}

const configuration = new Configuration({ apiKey });

const openai = new OpenAIApi(configuration);

async function sendMessage(message: string) {
  const completion = await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You respond in pig latin",
        },
        {
          role: "user",
          content: message,
        },
      ],
      functions: [
        {
          name: "getWinePairing",
          description: "Get a wine pairing for a cheese",
          parameters: {
            type: "object",
            properties: {
              cheese: {
                type: "string",
                desciption: "The cheese to get a wine pairing for",
              },
            },
            required: ["cheese"],
          },
        },
      ],
    })
    .catch((e) => {
      console.log(e.message);
    });

  const completionResponseMessage = completion?.data.choices[0].message;

  console.log(completion?.data.choices);

  return completionResponseMessage ?? null;
}

const completionResponse = await sendMessage(
  "I'm throwing a party and one of my guests is bringing some brie. What kind of wine should I serve?"
);

if (!completionResponse) {
  console.log("No response from OpenAI");
}

if (!completionResponse?.content) {
  const functionCallName = completionResponse?.function_call?.name;
  console.log(
    "calling function:",
    functionCallName,
    "with arguments:",
    completionResponse?.function_call?.arguments
  );
  const completionArguments = JSON.parse(
    completionResponse?.function_call?.arguments!
  );
  const completion_text = getWinePairing(completionArguments.cheese);
  console.log("The answer is", completion_text);
}
