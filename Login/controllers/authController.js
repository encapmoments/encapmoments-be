const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // MySQL 연결 파일
require("dotenv").config(); // 환경 변수 로드

// 회원가입
exports.register = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: "모든 필드를 입력하세요." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (email, password, nickname, provider) VALUES (?, ?, ?, 'local')";
    db.query(sql, [email, hashedPassword, nickname], (err, result) => {
      if (err) return res.status(500).json({ message: "회원가입 실패", error: err });
      res.status(201).json({ message: "회원가입 성공!" });
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error });
  }
};

// 로그인
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("이메일과 비밀번호를 입력하세요.");
  
    try {
      db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).send("존재하지 않는 사용자입니다.");
  
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("비밀번호가 틀렸습니다.");
  
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
        // 로그인 성공 후 메시지 출력 (나중에 대시보드로 이동 가능)
        res.send(`<h2>로그인 성공!</h2><p>토큰: ${token}</p>`);
      });
    } catch (error) {
      res.status(500).send("서버 오류 발생");
    }
  };
  