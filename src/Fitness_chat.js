import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync'; 
import dotenv from 'dotenv';
dotenv.config();


const ai = new GoogleGenAI({ apiKey:process.env.API_KEY});

const history = [];
async function main(userQuestion) {
    const user = {
        role:'user',
        parts:[{text:userQuestion}]
    }
    history.push(user)
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
  });
  const model_response = {
    role:'model',
    parts:[{text:response.text}]
  }
  history.push(model_response)
  console.log(response.text);
}

async function StartChat()
{
    const userQuestion = readlineSync.question("Ask me fitness related question only: ")
    await main(userQuestion)
    StartChat()
}
StartChat();