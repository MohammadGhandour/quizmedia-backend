const express = require("express");
const usersCtrl = require("../controllers/usersCtrl");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/", usersCtrl.getAllUsers);
router.post("/", usersCtrl.createUser);
router.get("/check-if-connected", usersCtrl.checkIfConnected);
router.get("/:id", usersCtrl.getUserById);
router.delete("/:id", usersCtrl.deleteUser);
router.post("/login", usersCtrl.login);
router.post("/logout", auth, usersCtrl.logout);

module.exports = router;
