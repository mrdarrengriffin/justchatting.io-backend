import * as express from 'express';
const router = express.Router();
const auth = require("../../config/auth");
const userController = require("../../controllers/auth/user");

router.post("/register", userController.registerNewUser);
router.post("/login", userController.loginUser);
router.get("/me", auth, userController.getUserDetails);

module.exports = router;