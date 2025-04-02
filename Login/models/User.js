require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// 회원가입
exports.register = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  User.createUser(email, hashedPassword, (err, result) => {
    if (err) return res.status(500).json({ error: "회원가입 실패" });
    res.status(201).json({ message: "회원가입 성공!" });
  });
};

// 일반 로그인
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ error: "DB 조회 오류" });
    if (results.length === 0) return res.status(400).json({ error: "이메일이 존재하지 않음" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "비밀번호가 틀렸습니다" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "로그인 성공!", token });
  });
};

// 네이버 로그인 처리
exports.naverLogin = async (req, res) => {
  const code = req.query.code;
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&code=${code}`;

  const response = await fetch(api_url);
  const tokenRequest = await response.json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userInfo = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userInfo.json();
    console.log("네이버 사용자 정보:", userData);
    return res.send("네이버 로그인 성공");
  }

  res.status(500).send("네이버 로그인 실패");
};

// 카카오 로그인 처리
exports.kakaoLogin = async (req, res) => {
  const code = req.query.code;
  const api_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`;

  const response = await fetch(api_url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const tokenRequest = await response.json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userInfo = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userInfo.json();
    console.log("카카오 사용자 정보:", userData);
    return res.send("카카오 로그인 성공");
  }

  res.status(500).send("카카오 로그인 실패");
};
