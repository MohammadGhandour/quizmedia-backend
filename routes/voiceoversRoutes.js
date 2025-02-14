const express = require("express");
const voiceoversCtrl = require("../controllers/voiceoversCtrl");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/", voiceoversCtrl.getAllVoiceovers);
router.post("/playground/voicemaker", voiceoversCtrl.playgroundVoiceOver);
router.post("/get-voice-over", voiceoversCtrl.getVoiceOver);
router.delete("/:id", voiceoversCtrl.deleteVoiceover);

module.exports = router;
