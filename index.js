require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const path = require("path");
const propertyRoutes = require("./routes/property");
app.use(bodyParser.json());
// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

console.log("in index backend");

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
