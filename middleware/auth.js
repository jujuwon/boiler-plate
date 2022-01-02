const { User } = require("../models/User");

let auth = (req, res, next) => {
    // 인증 처리
    // client cookie 에서 token get
    let token = req.cookies.x_auth;

    // token decode 이후 user 찾기
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true });

        req.token = token;
        req.user = user;
        next();
    });
    // user 가 있으면 인증 ok
    // user 가 없으면 인증 false
};

module.exports = { auth };
