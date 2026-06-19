const express = require("express");
const path = require("path");

// Routes
const timeRoutes = require("./routes/time.routes");
const snapshotRoutes = require("./routes/snapshot.routes");
const pingRoutes = require("./routes/ping.routes");

function createApp(db) {
    const app = express();

    // =========================
    // GLOBAL ACCESS (optional)
    // =========================
    app.locals.db = db;

    // =========================
    // MIDDLEWARE
    // =========================
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "public")));

    // =========================
    // ROUTES
    // =========================
    app.use("/ping", pingRoutes);
    app.use("/time", timeRoutes);
    app.use("/snapshot", snapshotRoutes);
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index", "index.html"));
    });

    return app;
}

module.exports = { createApp };