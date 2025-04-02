const fetch = require("node-fetch");
require("dotenv").config();

// 네이버 로그인
exports.naverLogin = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  
  const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&code=${code}&state=${state}`;

  try {
    const response = await fetch(tokenUrl);
    const tokenRequest = await response.json();

    if ("access_token" in tokenRequest) {
      const { access_token } = tokenRequest;
      const userInfo = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = await userInfo.json();
      console.log("네이버 사용자 정보:", userData);
      return res.json(userData);
    }

    res.status(400).json({ message: "네이버 로그인 실패" });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 카카오 로그인
exports.kakaoLogin = async (req, res) => {
  const code = req.query.code;

  const tokenUrl = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&code=${code}`;

  try {
    const response = await fetch(tokenUrl, {
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
      return res.json(userData);
    }

    res.status(400).json({ message: "카카오 로그인 실패" });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};
