const Voiceovers = require("../models/Voiceovers");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { Op } = require("sequelize");

const { AUDIOS_UPLOADS_FOLDER, AUDIOS_DOMAIN, VOICEMAKER_URL, VOICEMAKER_API_KEY } = require("../config/env");

exports.getAllVoiceovers = async (req, res) => {
    try {
        const { page = 1, limit = 10, query = "", sortBy = "createdAt", order = "DESC" } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = query ? { question: { [Op.like]: `%${query}%` } } : {};

        const voiceovers = await Voiceovers.findAll({
            where: whereCondition,
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            raw: true
        });

        for (let voiceover of voiceovers) {
            voiceover.audioUrl = `${AUDIOS_DOMAIN}/${voiceover.id}.mp3`;
        }

        const totalCount = await Voiceovers.count({ where: whereCondition });

        return res.status(200).json({ voiceovers, hasMore: offset + limit < totalCount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getVoiceOver = async (req, res) => {
    try {
        const { texts } = req.body;

        const voice_maker_options = {
            "Engine": "neural",
            "VoiceId": "ai2-fr-FR-Erwan",
            "LanguageCode": "fr-FR",
            "AccentCode": "fr-FR",
            "OutputFormat": "mp3",
            "SampleRate": "48000",
            "Effect": "default",
            "MasterVolume": "0",
            "MasterSpeed": "0",
            "MasterPitch": "0"
        };

        if (!texts || !texts.length) return res.status(400).json({ error: "Missing texts for voiceovers" });

        const objectToReturn = {};

        for (let instance of texts) {
            const { identifier, text } = instance;
            const trimmed = text.trim();

            const questionWithVoiceAlreadyExists = await Voiceovers.findOne({ raw: true, where: { question: trimmed } });

            if (questionWithVoiceAlreadyExists) {
                console.log(`file already exist for: ${trimmed}`);
                objectToReturn[identifier] = `${AUDIOS_DOMAIN}/${questionWithVoiceAlreadyExists.id}.mp3`;
            } else {
                console.log("Generating new MP3 for:", text);
                const voicemakerResponse = await axios.post(VOICEMAKER_URL, { ...voice_maker_options, Text: text },
                    { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${VOICEMAKER_API_KEY}` } }
                );

                const generatedFileUrl = voicemakerResponse?.data?.path;
                if (!generatedFileUrl) {
                    return res.status(500).json({ error: "Voicemaker API did not return a valid file URL" });
                }

                const voiceover = await Voiceovers.create({ question: trimmed });
                const filename = `${voiceover.id}.mp3`;

                const response = await axios.get(generatedFileUrl, { responseType: "stream" });

                const filePath = path.join(AUDIOS_UPLOADS_FOLDER, filename);
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on("finish", () => {
                    console.log("File saved:", filename);
                    objectToReturn[identifier] = `${AUDIOS_DOMAIN}/${filename}`;
                });

                writer.on("error", (err) => {
                    console.error("File download error:", err);
                    return res.status(500).json({ error: "Failed to save file" });
                });
            }
        }
        return res.status(200).json(objectToReturn);
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.playgroundVoiceOver = async (req, res) => {
    try {
        const { data } = req.body;
        const voicemakerResponse = await axios.post(
            VOICEMAKER_URL,
            data,
            { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${VOICEMAKER_API_KEY}` } }
        );
        const generatedFileUrl = voicemakerResponse?.data?.path;
        if (!generatedFileUrl) {
            return res.status(500).json({ error: "Voicemaker API did not return a valid file URL" });
        }
        return res.status(200).json(generatedFileUrl);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error?.response?.data || error.message);
    }
};

exports.deleteVoiceover = async (req, res) => {
    try {
        const { id } = req.params;

        const voiceover = await Voiceovers.findByPk(id, { raw: true });
        if (!voiceover) {
            return res.status(404).json({ error: "Voiceover not found" });
        }

        const audioFilePath = path.join(AUDIOS_UPLOADS_FOLDER, `${id}.mp3`);

        if (fs.existsSync(audioFilePath)) {
            fs.unlinkSync(audioFilePath);
        }

        await Voiceovers.destroy({ where: { id } });
        return res.status(200).json("Voiceover deleted successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
