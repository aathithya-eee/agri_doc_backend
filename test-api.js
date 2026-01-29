const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

function log(msg) {
    console.log(msg);
    fs.appendFileSync('api-log.txt', msg + '\n');
}

async function testKey() {
    log("Testing API Key...");
    let key = process.env.AI_API_KEY;

    if (!key) {
        log("Error: AI_API_KEY is undefined in environment.");
        return;
    }

    // Trim checks
    if (key.trim() !== key) {
        log("WARNING: Key has surrounding whitespace! Trimming...");
        key = key.trim();
    }

    log(`Key: ${key.substring(0, 5)}...${key.substring(key.length - 4)}`);
    log(`Key length: ${key.length}`);

    // Test List Models (to verify key permissions)
    try {
        log("Listing models...");
        // Using fetch to bypass SDK if model is not found, to check plain connectivity
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            log(`ListModels Failed: ${response.status} ${response.statusText}`);
            const errText = await response.text();
            log("Error Body: " + errText);
        } else {
            const data = await response.json();
            log("Models available: " + data.models?.length);
            if (data.models) {
                data.models.forEach(m => log(` - ${m.name}`));
            }
        }

    } catch (error) {
        log("ListModels Exception: " + error.message);
    }
}

testKey();
