require("dotenv").config();
import express from "express";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import OpenAI from "openai";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";
import { Request, Response } from "express";

const openai = new OpenAI();
const app = express();
app.use(cors())
app.use(express.json())

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    
    const response = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra" },
            { role: 'user', content: prompt }
        ],
        model: 'gpt-4'
        });

    const answer = response.choices[0].message.content?.trim(); // react or node
    if (answer == "react") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if (answer === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }

    res.status(403).json({message: "You cant access this"})
    return;

})

app.post("/chat", async (req: Request, res: Response) => {
    const messages = req.body.messages;
    
    // Format messages for OpenAI (add system message at the beginning)
    const formattedMessages = [
        { role: 'system', content: getSystemPrompt() },
        ...messages.map((message: any) => ({
            role: message.role,
            content: message.content
        }))
    ];
    
    const response = await openai.chat.completions.create({
        messages: formattedMessages,
        model: 'gpt-4'
    });

    console.log(response);

    res.json({
        response: response.choices[0].message.content
    });
})

app.listen(3000);