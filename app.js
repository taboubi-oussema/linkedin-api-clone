const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require("./routes/api/auth");
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const comments = require("./routes/api/comments");
const connections = require("./routes/api/connections");
const messages = require("./routes/api/messages");
const jobs = require("./routes/api/jobs");

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, "uploads")));

// Mount routers
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/comments", comments);
app.use("/api/connections", connections);
app.use("/api/messages", messages);
app.use("/api/jobs", jobs);

// Error handler middleware
app.use(errorHandler);

// Serve client in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

module.exports = app;
