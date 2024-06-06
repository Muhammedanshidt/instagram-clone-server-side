
const express = require("express");
const router = express();
const controller = require('../controller/messageForm');


// conversation

router.route("/createroom").post(controller.createRoom)
router.route("/getroom/:userId").get(controller.getRoom)

// messages

router.route("/createmessage").post(controller.createmessage)
router.route("/getmessage/:conversationId").get(controller.getMessage)

module.exports = router