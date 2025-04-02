const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register"); // 회원가입 페이지 보여줌
});
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
