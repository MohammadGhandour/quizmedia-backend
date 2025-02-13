const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
const path = require("path");

const AUDIOS_UPLOADS_FOLDER = process.env.AUDIOS_UPLOADS_FOLDER;
const IMAGES_UPLOADS_FOLDER = process.env.IMAGES_UPLOADS_FOLDER;

const AUDIOS_DOMAIN = process.env.AUDIOS_DOMAIN;
const IMAGES_DOMAIN = process.env.IMAGES_DOMAIN;

const VOICEMAKER_URL = "https://developer.voicemaker.in/voice/api";
const VOICEMAKER_API_KEY = "dba93450-e966-11ef-8514-cd4b8a71db41";


exports.generateVoice = async (req, res) => {
    try {
        const { text } = req.body;

        const voice_maker_options = {
            "Engine": "neural",
            "VoiceId": "ai3-Emily",
            "LanguageCode": "en-US",
            "OutputFormat": "mp3",
            "SampleRate": "48000",
            "Effect": "default",
            "MasterVolume": "0",
            "MasterSpeed": "0",
            "MasterPitch": "0"
        }

        if (!text) {
            return res.status(400).json({ error: "Missing text input" });
        }

        const sanitizedText = text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 50);

        const filename = `${sanitizedText}.mp3`;
        const filePath = path.join(AUDIOS_UPLOADS_FOLDER, filename);
        console.log({ filePath, filename });


        // ✅ Step 1: Check if file already exists
        if (fs.existsSync(filePath)) {
            console.log("File already exists:", filename);
            return res.status(200).json({ fileUrl: `${AUDIOS_DOMAIN}/${filename}` });
        }

        // ✅ Step 2: Request Voicemaker API to generate new MP3
        console.log("Generating new MP3 for:", text);

        const voicemakerResponse = await axios.post(
            VOICEMAKER_URL,
            { ...voice_maker_options, Text: text },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${VOICEMAKER_API_KEY}`
                }
            }
        );
        const generatedFileUrl = voicemakerResponse?.data?.path;
        if (!generatedFileUrl) {
            return res.status(500).json({ error: "Voicemaker API did not return a valid file URL" });
        }


        // ✅ Step 3: Download and Save the MP3 to the Server
        const response = await axios.get(generatedFileUrl, { responseType: "stream" });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            console.log("File saved:", filename);
            return res.status(200).json({ fileUrl: `${AUDIOS_DOMAIN}/${filename}` });
        });

        writer.on("error", (err) => {
            console.error("File download error:", err);
            return res.status(500).json({ error: "Failed to save file" });
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
