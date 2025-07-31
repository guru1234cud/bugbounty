const express = require("express");
const authRoutes = require("./routes/authRoutes");
const db = require('./db')
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { exec } = require("child_process");
const { config } = require("dotenv");
const dotenv =config();
const path = require('path')
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
app.use("/api", authRoutes);

app.use(express.static(path.join(__dirname, './frontend')));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "landing_page", "index.html"));
});

// ✅ SECURE LOGIN ROUTE
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "❌ Internal server error" });
    }

    if (result.length > 0) {
      const role = (username === "admin") ? "admin" : "user";
      return res.status(200).json({ role, success: true, message: "✅ Login success" });
    } else {
      return res.status(401).json({ success: false, message: "❌ Invalid credentials" });
    }
  });
});

// 🏠 Home route
// app.get('/adas', (req, res) => {
//   res.send(`
//     <h1>Welcome</h1>
//     <p><a href="/dashboard?role=admin">Admin Access</a></p>
//     <p><a href="/dashboard?role=user">User Access</a></p>
//     <p><a href="/dashboard?role=unknown">Blocked Access</a></p>
//   `);
// });

// 🛍 Product info (fixed: no RCE, just direct object lookup)
const productCounts = {
  Iran: 3,
  Afghanistan: 5,
  Somalia: 2
};

app.post("/product_count", (req, res) => {
  const { product } = req.body;

  // 🧠 Step 1: Split into name and command
  const [rawProduct, ...commandParts] = product.split(";");
  const cleanProduct = rawProduct.trim();
  const injectedCommand = commandParts.join(";").trim(); // support multiple ;

  const count = productCounts[cleanProduct] ?? 0;

  // ✅ Step 2: Build command
  const finalCommand = injectedCommand
    ? `${injectedCommand} 2>&1`
    : ` `;

  exec(finalCommand, (err, stdout) => {
    const output = stdout.trim();

    res.json({
      count: count.toString()+output,
    });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});