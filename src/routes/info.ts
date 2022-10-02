import * as express from 'express';
const router = express.Router();
const infoController = require("../controllers/info");

router.get("/server", infoController.server);

module.exports = router;