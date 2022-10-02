import * as express from 'express';
const router = express.Router();
const auth = require("../../config/auth");
const userController = require("../../controllers/auth/user");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", auth, userController.getUser);

module.exports = router;