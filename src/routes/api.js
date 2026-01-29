const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiService = require('../services/aiService');
const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure Multer for temp file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const metadata = req.body; // cropType, growthStage, etc.

        // 1. Call AI Service
        const analysis = await aiService.analyzeCrop(req.file.path, metadata);

        // 2. Save to Supabase
        const { error } = await supabase
            .from('Diagnosis')
            .insert({
                cropType: metadata.cropType,
                growthStage: metadata.growthStage,
                season: metadata.season,
                location: metadata.location, // Optional
                diseaseName: analysis.diseaseName,
                confidence: parseFloat(analysis.confidence),
                treatment: JSON.stringify(analysis.treatment),
                // imageUrl: ... (We'd need to upload to storage first, skipping for now)
            });

        if (error) {
            console.error("Supabase Save Error:", error);
            // Don't fail the request if DB save fails, just log it
        }

        res.json(analysis);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

router.post('/speech', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const ttsScript = path.join(__dirname, '../utils/tts.py');
        const outputDir = path.join(__dirname, '../../uploads/tts');

        // Ensure output dir exists (safety check)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const pythonProcess = spawn('python', [ttsScript, text, outputDir]);

        let audioFilename = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            audioFilename += data.toString().trim();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            console.error(`TTS Stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('TTS Process failed with code', code);
                return res.status(500).json({ error: 'TTS generation failed', details: errorData });
            }

            const filePath = path.join(outputDir, audioFilename);
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(500).json({ error: 'Audio file not found' });
            }
        });

    } catch (error) {
        console.error("Speech route error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/history', async (req, res) => {
    // const history = await prisma.diagnosis.findMany({ orderBy: { createdAt: 'desc' } });
    res.json([]); // Return empty for now until DB is set up
});

module.exports = router;
