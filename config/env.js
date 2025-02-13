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
    ORIGINS
} = process.env;

module.exports = { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT, JWT_SECRET, JWT_EXPIRES_IN, ORIGINS };