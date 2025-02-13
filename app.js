const express = require("express");
const cors = require("cors");
const { frmtDate } = require("./utils");
const { connectDB, sequelize } = require("./config/database");
require("dotenv").config();
require("./models");
const cookieParser = require("cookie-parser");
const path = require("path");

const { ORIGINS } = require("./config/env");

const PORT = 5000;

const app = express();
app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const WELL_KNOWN_PATH = "/usr/local/lsws/express.quizmedia.com/.well-known/acme-challenge/";
app.use("/.well-known/acme-challenge", express.static(WELL_KNOWN_PATH));

app.use("/audios", express.static(path.join(__dirname, "./audios")));

app.get("/", async (req, res) => {
    return res.status(200).json({ message: "Quizmedia backend" })
});

const usersRoutes = require("./routes/usersRoutes");
const voiceoversRoutes = require("./routes/voiceoversRoutes");
app.use("/user", usersRoutes);
app.use("/voiceover", voiceoversRoutes);



const startApp = async () => {
    await connectDB();
    await sequelize.sync({ force: false });
    console.log("✅ Database synced!");

    app.listen(PORT, () => {
        console.log(`🚀 App running on port ${PORT}, started At : ${frmtDate(new Date(), false, true)}`)
    });
};

startApp();
