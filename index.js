const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
    .connect(config.mongoURI)
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World~!"));

app.post("/register", (req, res) => {
    // 회원가입 할 때 필요한 정보들을 client 에서 가져오면
    // DB 에 insert
    const user = new User(req.body);

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({ success: true });
    });
});

app.post("/login", (req, res) => {
    // 요청된 email을 DB 에서 search
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다.",
            });
        }
        // 요청된 email이 DB 에 있다면 비밀번호 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 일치하지 않습니다.",
                });
            // 비밀번호가 동일하다면 token 생성
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // token 저장 -> 쿠키, localstorage 등
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id });
            });
        });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
