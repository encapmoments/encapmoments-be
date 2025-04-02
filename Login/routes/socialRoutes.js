const express = require("express");
const socialController = require("../controllers/socialController");
const router = express.Router();

// 네이버 & 카카오 로그인
router.get("/naver/callback", socialController.naverLogin);
router.get("/kakao/callback", socialController.kakaoLogin);

module.exports = router;
