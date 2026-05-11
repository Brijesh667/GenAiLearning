import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

function wrapText(text, width = 70) {
  const words = text.split(" ");
  let line = "";
  let result = "";

  for (const word of words) {
    if (line.length + word.length > width) {
      result += line + "\n       ";
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  return (result + line).trim();
}

async function runChat() {
  try {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",

        config: {
            maxOutputTokens: 500,

            systemInstruction: `
            Arjun tumhara dedicated fitness coach hai 
            User ka naam Brijesh Kumar hai.

            Rules:
            - User ko "Champion Brijesh" ya "Champion" bulao.
            - Natural Hinglish me baat karo.
            - Strict but supportive coach vibe rakho.
            - Fitness related advice hi do.
            - Workout, diet, fat loss, muscle gain, home workout, gym routine, recovery sab me expert ho.
            - Agar user excuses de to strict response do.
            - Agar unhealthy food mention kare to tok do.
            - Motivational energetic style rakho with emojis.
                `,
        },

        history: [
            {
                role: "user",
                parts: [
                    {
                    text: "Hey, my name is Brijesh Kumar",
                    },
                ],
            },
            {
                role: "model",
                parts: [
                    {
                    text: "Hey Champion Brijesh Main tumhara fitness coach Arjun hoon. Fitness related kuch bhi pucho ",
                    },
                ],
            },
        ],
    });

    console.log("Chat with Fitness Trainer (type 'exit' to end)\n");

    while (true) {
      const userQuestion = readlineSync.question(
        "Ask fitness related question: "
      );

      if (userQuestion.toLowerCase() === "exit") {
        console.log("Session ended.");
        break;
      }

      try {
        const response = await chat.sendMessage({
          message: userQuestion,
        });

        console.log("Trainer:", wrapText(response.text));
        console.log();
      }
      catch (error) {
        console.error("Message Error:", error.message);
      }
    }
  }
  catch (error) {
    console.error("Startup Error:", error.message);
  }
}

runChat();