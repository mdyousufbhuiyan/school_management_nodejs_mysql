const express = require("express");
const subjectsController = require('../controllers/subjects_controller')
const utils = require("../utils/util_methods");
const router = express.Router();

//add subjects
router.post("/", subjectsController.addSubsects);

// Verify whether the token is correct
router.post("/verifyToken", utils.extractToken,loginController.verifyTokenCon);

module.exports = router;
