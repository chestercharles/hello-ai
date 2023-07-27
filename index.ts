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

const completion = await openai
  .createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content:
          "If I'm throwing a dinner party and a guest brings brie, what kind of cheese should I serve?",
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

const completionResponse = completion?.data.choices[0].message;

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
