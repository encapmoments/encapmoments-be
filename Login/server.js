const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const socialRoutes = require("./routes/socialRoutes");
const authRoutes = require("./routes/authRoutes"); // 일반 로그인 라우트 추가

dotenv.config();
const app = express();

// 정적 파일 제공 (이미지 사용 가능)
app.use(express.static("public"));

// 뷰 엔진 설정 (EJS 사용)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 요청 데이터 처리 (form 데이터 받기 위해 추가)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 라우트 등록
app.use("/", socialRoutes);
app.use("/auth", authRoutes); // 일반 로그인도 추가

// 홈 화면
app.get("/", (req, res) => {
  res.render("index", {
    naverLoginURL: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=RANDOM_STATE`,
    kakaoLoginURL: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`
  });
});

//회원가입 화면 
app.get("/register", (req, res) => {
    res.render("register"); // register.ejs 파일을 렌더링
  });
  
// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT} 에서 서버 실행 중`);
});
