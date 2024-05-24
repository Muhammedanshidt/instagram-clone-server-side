const express = require("express");
const router = express();
const controller = require("../controller/userForm");

router.route("/signup").post(controller.userSignUp)
router.route("/otp").post(controller.userRegByVerification)
router.route("/login").post(controller.userLogin);
router.route("/access").get(controller.userAccess);
router.route("/getuser").get(controller.getUser);
router.route("/profile/edit").post(controller.bioRes)
router.route("/logout").post(controller.logBack)
router.route("/userProfileImage").post(controller.userProfileImage)
router.route("/findUser").post(controller.userFindByName)
router.route("/findUserId/:id").get(controller.userFindById)
router.route("/follow").put(controller.userFollow)
router.route("/unfollow").delete(controller.userUnfollow)
router.route("/getfollowers").get(controller.getFollowers)
router.route("/getfollowing").get(controller.getFollowing)
router.route("/post").post(controller.creatPost)
router.route("/postvideo").post(controller.createVideo)
router.route("/getUserPost").get(controller.getUserPost)
router.route("/getreels").get(controller.getReels)
router.route("/getExplorePost").get(controller.explorePost)
router.route("/userLike").post(controller.likeHandler)
router.route("/userComment").post(controller.commentHandle)
router.route("/getOwnPost").get(controller.getOwnPost)
router.route("/userSearch").get(controller.getUserSearch)
router.route("/grtPostModal").get(controller.getPost)
router.route("/editUser").post(controller.userNameEdit)
router.route("/notification").get(controller.notification)
router.route("/editCaption").put(controller.editCaption)
router.route("/postDelete/:userId/:postId").delete(controller.deletePost)
router.route("/commentDelete/:userId/:commentId/:postId").delete(controller.deleteComment)
router.route("/editComment").put(controller.editComment)
router.route("/savepost/:userId/:postId").post(controller.savePost)
router.route("/getsavepost/:userId").get(controller.getSavePost)

// router.param('userId', controller.checkIDParam).get(controller.getOneUserData) // get user data by id


module.exports = router;