const express = require("express");
const getDB = require("./db"); // Not named 'db' to avoid redeclaring later
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { exec } = require("child_process");
require("dotenv").config(); // ✅ simpler dotenv call

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files & frontend routing
app.use(express.static(path.join(__dirname, "./frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "landing_page", "index.html"));
});

// Routes
app.use("/api", authRoutes);

// ✅ Login route (intentionally vulnerable for testing)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`; // unsafe on purpose

  try {
    const db = await getDB(); // get pool

    db.query(sql, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "❌ Internal server error" });
      }

      if (result.length > 0) {
        const role = username === "admin" ? "admin" : "user";
        return res.status(200).json({ role, success: true, message: "✅ Login success" });
      } else {
        return res.status(401).json({ success: false, message: "❌ Invalid credentials" });
      }
    });
  } catch (err) {
    console.error("❌ Failed to get DB:", err.message);
    return res.status(500).json({ message: "❌ DB unavailable" });
  }
});

// 🛍 Product count (intentional command injection vector)
const productCounts = {
  Iran: 3,
  Afghanistan: 5,
  Somalia: 2,
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
