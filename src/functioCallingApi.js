import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";

dotenv.config();

function sum(obj) {
    return obj.num1 + obj.num2;
}

function sqr(obj) {
    return obj.num1 * obj.num1;
}

function mul(obj) {
    return obj.num1 * obj.num2;
}

const SumDeclaration = {
    name: "sum",
    description: "Get the sum of two numbers",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: {
                type: "NUMBER",
                description: "First number for addition. Example: 12"
            },
            num2: {
                type: "NUMBER",
                description: "Second number for addition. Example: 23"
            }
        },
        required: ["num1", "num2"]
    }
};

const SqrDeclaration = {
    name: "sqr",
    description: "Get the square of a number",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: {
                type: "NUMBER",
                description: "Number to square. Example: 12"
            }
        },
        required: ["num1"]
    }
};

const MulDeclaration = {
    name: "mul",
    description: "Get multiplication of two numbers",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: {
                type: "NUMBER",
                description: "First number for multiplication"
            },
            num2: {
                type: "NUMBER",
                description: "Second number for multiplication"
            }
        },
        required: ["num1", "num2"]
    }
};

const available = {
    sum,
    sqr,
    mul
};

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const history = [];

async function runChat(userQuestion) {
    //user ki chat ko history mai push karna
    history.push({
        role: "user",
        parts: [{ text: userQuestion }]
    });

    while (true) {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                tools: [
                    {
                        functionDeclarations: [SumDeclaration,SqrDeclaration,MulDeclaration]
                    }
                ]
            }
        });

        const functionCalls = response.functionCalls;
        //agar function call ki need hai to 
        if (functionCalls && functionCalls.length > 0) {
            for (const funcCall of functionCalls) {
                //ek ek karke function nikalo, functionCalls array se and unko call karo, 
                const { name, args } = funcCall;

                const fun = available[name];

                if (!fun) {
                    throw new Error(`Unknown function: ${name}`);
                }

                const result = fun(args);

                history.push({//history main karna, ki model ne function call kiya
                    role: "model",
                    parts: [
                        {
                            functionCall: funcCall
                        }
                    ]
                });

                history.push({//function se jo reply aaya, usko history mai push karna 
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name,
                                response: {
                                    result
                                }
                            }
                        }
                    ]
                });
            }
        }
        else {//agar koi function call nahi hai to simple response print kra do
            history.push({
                role: "model",
                parts: [{ text: response.text }]
            });

            console.log("\nAI_Agent:", response.text);
            break;
        }
    }
}

async function StartChat() {
    while (true) {
        const userQuestion = readlineSync.question("\nAsk me ---> ");

        if (userQuestion.toLowerCase() === "exit") {
            console.log("Chat ended.");
            break;
        }

        await runChat(userQuestion);
    }
}

StartChat();