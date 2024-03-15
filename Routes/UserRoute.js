const express = require("express");
const router = express();
const controller = require("../controller/userForm");

router.route("/signup").post(controller.userSignUp)
router.route("/otp").post(controller.userRegByVerification)
router.route("/login").post(controller.userLogin);
router.route("/access").post(controller.userAccess);
router.route("/getuser").get(controller.getUser);

module.exports = router;