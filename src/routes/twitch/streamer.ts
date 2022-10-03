import * as express from 'express';
const router = express.Router();
const twitchController = require("../../controllers/twitch");


router.post("/:streamer", twitchController.info);

module.exports = router;