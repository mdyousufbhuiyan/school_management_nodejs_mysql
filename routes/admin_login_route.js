const express = require("express");
const loginController = require('../controllers/auth_controller')
const utils = require("../utils/util_methods");
const router = express.Router();

//login
router.post("/login", loginController.loginController);

// // Verify whether the token is correct
// router.post("/verifyToken", utils.extractToken,loginController.verifyTokenCon);

module.exports = router;
