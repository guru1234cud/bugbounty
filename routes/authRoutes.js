const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const user = {
  username: "admin",
  password: "123"
};

router.post("/auth", (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    const payload = {
      username,
      password
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });  
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

router.get("/leakedpass",(req,res)=>{
  res.json(user)
})

module.exports = router;
