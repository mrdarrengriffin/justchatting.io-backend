import * as express from 'express';
const router = express.Router();
const emoteController = require("../../controllers/twitch/emotes");


router.get("/global/:emote?", emoteController.global);
router.get("/streamer/:streamer/:emote?", emoteController.streamer);

module.exports = router;