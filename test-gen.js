const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

function log(msg) {
    console.log(msg);
    fs.appendFileSync('api-log.txt', msg + '\n');
}

async function testGen() {
    log("Testing Generation with configured model...");
    const key = process.env.AI_API_KEY;
    // const modelName = process.env.AI_MODEL;
    const modelName = "gemini-flash-latest";

    log(`Model: ${modelName}`);

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });

        log("Sending prompt...");
        const result = await model.generateContent("Say 'Hello Agri-Doctor!'");
        const response = await result.response;
        const text = response.text();

        log("SUCCESS! Response:");
        log(text);
    } catch (error) {
        log("Generation Failed: " + error.message);
    }
}

testGen();
