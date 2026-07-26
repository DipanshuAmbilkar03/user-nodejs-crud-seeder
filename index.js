const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "delta_app",
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    console.error("Check your .env values and ensure MySQL is running.");
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function renderError(res, status, title, message) {
  res.status(status).render("error", { status, title, message });
}

// Home - total user count
app.get("/", async (req, res) => {
  try {
    const rows = await query("SELECT COUNT(*) AS total FROM user");
    res.render("home", { count: rows[0].total });
  } catch (err) {
    console.error(err);
    renderError(res, 500, "Database Error", "Unable to load dashboard stats.");
  }
});

// List users
app.get("/user", async (req, res) => {
  try {
    const users = await query(
      "SELECT id, username, email FROM user ORDER BY username ASC"
    );
    res.render("users", { users, notice: req.query.notice || null });
  } catch (err) {
    console.error(err);
    renderError(res, 500, "Database Error", "Unable to load users.");
  }
});

// New user form
app.get("/user/new", (req, res) => {
  res.render("new", { error: null, form: { username: "", email: "" } });
});

// Create user
app.post("/user", async (req, res) => {
  const username = (req.body.username || "").trim();
  const email = (req.body.email || "").trim();
  const password = (req.body.password || "").trim();
  const form = { username, email };

  if (!username || !email || !password) {
    return res.status(400).render("new", {
      error: "Username, email, and password are required.",
      form,
    });
  }

  try {
    await query(
      "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)",
      [uuidv4(), username, email, password]
    );
    res.redirect("/user?notice=User%20created%20successfully");
  } catch (err) {
    console.error(err);
    const message =
      err.code === "ER_DUP_ENTRY"
        ? "Username or email already exists."
        : "Unable to create user.";
    res.status(400).render("new", { error: message, form });
  }
});

// Edit form
app.get("/user/:id/edit", async (req, res) => {
  try {
    const users = await query(
      "SELECT id, username, email FROM user WHERE id = ?",
      [req.params.id]
    );
    if (!users.length) {
      return renderError(res, 404, "Not Found", "User was not found.");
    }
    res.render("edit", { user: users[0], error: null });
  } catch (err) {
    console.error(err);
    renderError(res, 500, "Database Error", "Unable to load user.");
  }
});

// Update username (password required)
app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const newUsername = (req.body.username || "").trim();
  const formPass = req.body.password || "";

  try {
    const users = await query("SELECT * FROM user WHERE id = ?", [id]);
    if (!users.length) {
      return renderError(res, 404, "Not Found", "User was not found.");
    }

    const user = users[0];
    if (formPass !== user.password) {
      return res.status(401).render("edit", {
        user: { id: user.id, username: newUsername || user.username, email: user.email },
        error: "Wrong password. Username was not updated.",
      });
    }

    if (!newUsername) {
      return res.status(400).render("edit", {
        user: { id: user.id, username: user.username, email: user.email },
        error: "Username cannot be empty.",
      });
    }

    await query("UPDATE user SET username = ? WHERE id = ?", [newUsername, id]);
    res.redirect("/user?notice=Username%20updated%20successfully");
  } catch (err) {
    console.error(err);
    const message =
      err.code === "ER_DUP_ENTRY"
        ? "That username is already taken."
        : "Unable to update user.";
    res.status(400).render("edit", {
      user: { id, username: newUsername, email: "" },
      error: message,
    });
  }
});

// Delete user
app.delete("/user/:id", async (req, res) => {
  try {
    const result = await query("DELETE FROM user WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return renderError(res, 404, "Not Found", "User was not found.");
    }
    res.redirect("/user?notice=User%20deleted%20successfully");
  } catch (err) {
    console.error(err);
    renderError(res, 500, "Database Error", "Unable to delete user.");
  }
});

// 404
app.use((req, res) => {
  renderError(res, 404, "Page Not Found", "The page you requested does not exist.");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
