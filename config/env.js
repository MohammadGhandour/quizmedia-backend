require("dotenv").config();
const variables = {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_DIALECT,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ORIGINS,
    VOICEMAKER_URL,
    VOICEMAKER_API_KEY,

    AUDIOS_UPLOADS_FOLDER,
    IMAGES_UPLOADS_FOLDER,
    AUDIOS_DOMAIN,
    IMAGES_DOMAIN,
} = process.env;

module.exports = {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_DIALECT,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ORIGINS,
    VOICEMAKER_URL,
    VOICEMAKER_API_KEY,

    AUDIOS_UPLOADS_FOLDER,
    IMAGES_UPLOADS_FOLDER,
    AUDIOS_DOMAIN,
    IMAGES_DOMAIN,
};