const fs = require('fs');
const path = require('path');

// Dynamic import for node-fetch if needed, but Node 24 has global fetch.
// We need to construct a multipart request. 
// Since we might not have 'form-data' package installed, we will use a boundary manually or check if we can use native FormData (Node 18+).

async function testApi() {
    try {
        // create a dummy file for upload if not exists
        const dummyPath = path.join(__dirname, 'test-upload.jpg');
        if (!fs.existsSync(dummyPath)) {
            fs.writeFileSync(dummyPath, 'fake image content');
        }

        const formData = new FormData();
        // In Node.js environment with native fetch, we can use File/Blob object if available, 
        // or we might need to look at how to send files. 
        // Actually, native FormData in Node handles Blob.

        const fileContent = fs.readFileSync(dummyPath);
        const blob = new Blob([fileContent], { type: 'image/jpeg' });

        formData.append('image', blob, 'test-upload.jpg');
        formData.append('cropType', 'Tomato');
        formData.append('growthStage', 'Vegetative');
        formData.append('season', 'Summer');
        formData.append('language', 'ta');

        console.log("Sending request to http://localhost:3000/api/analyze...");

        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response received:");
        console.log(JSON.stringify(data, null, 2));

        if (data.diseaseName && data.treatment) {
            console.log("\nSUCCESS: Received mock diagnosis!");
            console.log("Disease:", data.diseaseName);
        } else {
            console.log("\nFAILURE: Response format incorrect.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testApi();
