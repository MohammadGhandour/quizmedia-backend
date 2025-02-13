const { Sequelize } = require("sequelize");
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT } = require("./env");
require("dotenv").config();

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    logging: false
});

const createDatabaseIfNotExists = async () => {
    const rootSequelize = new Sequelize("", DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        logging: false,
    });

    try {
        await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER set='utf8mb4' collate='utf8mb4_general_ci';`);
        console.log(`✅ Database '${DB_NAME}' is ready!`);
    } catch (error) {
        console.error(`❌ Error creating database: ${error.message}`);
    } finally {
        await rootSequelize.close();
    }
};

const connectDB = async () => {
    await createDatabaseIfNotExists();
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error);
    }
};

module.exports = { sequelize, connectDB };
