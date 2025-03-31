const fetch = require("node-fetch");
const express = require("express");
const app = express();


// 네이버 로그인 설정
const naver_client_id = "####";
const naver_client_secret = "####";
const naver_state = "RAMDOM_STATE";
const naver_redirectURI = encodeURI("####");

// 카카오 로그인 설정
const kakao_client_id = "####";
const kakao_redirectURI = encodeURI("####");

// 정적 파일 제공 (로그인 버튼 이미지)
app.use(express.static("public"));

// 홈 화면 - 네이버 & 카카오 로그인 버튼 표시
app.get("/", (req, res) => {
  const naverLoginURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_client_id}&redirect_uri=${naver_redirectURI}&state=${naver_state}`;
  const kakaoLoginURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakao_client_id}&redirect_uri=${kakao_redirectURI}`;

  res.send(`
    <html>
    <head>
      <title>소셜 로그인</title>
    </head>
    <body style="text-align: center; margin-top: 100px;">
      <h2>소셜 로그인</h2>
      <a href="${naverLoginURL}">
        <img height="50" src="http://static.nid.naver.com/oauth/small_g_in.PNG" alt="네이버 로그인"/>
      </a>
      <br/><br/>
      <a href="${kakaoLoginURL}">
        <img height="50" src="/images/kakao_login_medium_narrow.png" alt="카카오 로그인"/>
      </a>
    </body>
    </html>
  `);
});

// 네이버 로그인 콜백
app.get("/naver/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naver_client_id}&client_secret=${naver_client_secret}&redirect_uri=${naver_redirectURI}&code=${code}&state=${state}`;

  const response = await fetch(api_url, {
    headers: {
      "X-Naver-Client-Id": naver_client_id,
      "X-Naver-Client-Secret": naver_client_secret,
    },
  });

  const tokenRequest = await response.json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userInfo = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userInfo.json();
    console.log("네이버 사용자 정보:", userData);
  }

  return res.send("네이버 로그인 완료");
});

// 카카오 로그인 콜백
app.get("/kakao/callback", async (req, res) => {
  const code = req.query.code;
  const api_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${kakao_client_id}&redirect_uri=${kakao_redirectURI}&code=${code}`;

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
  }

  return res.send("카카오 로그인 완료");
});

// 서버 실행
app.listen(3000, () => {
  console.log("http://127.0.0.1:3000 에서 네이버 & 카카오 로그인 가능!");
});
