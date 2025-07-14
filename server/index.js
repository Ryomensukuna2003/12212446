require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const { generateShortcode } = require("./controllers/shortcode.js");
const { initLogger, Log } = require("../logger/index.js");

const app = express();
app.use(cors());
app.use(express.json());

// Init logger
initLogger(process.env.LOGGER_TOKEN);

// In-memory storage
const urlDatabase = new Map();
const clickStats = new Map();

// POST /shorturls
app.post("/shorturls", async (req, res) => {
    const { url, validity, shortcode } = req.body;

    if (!url) {
        await Log("backend", "error", "route", "Missing URL");
        return res.status(400).json({ message: "Missing URL" });
    }

    await Log("backend", "info", "route", `Shortening ${url}`);

    let finalShortcode = shortcode;

    if (shortcode && urlDatabase.has(shortcode)) {
        await Log("backend", "warn", "db", `Shortcode ${shortcode} already exists. Generating new one.`);
        finalShortcode = null;
    }

    if (!finalShortcode) {
        if (!shortcode) {
            await Log("backend", "warn", "route", "No shortcode provided, generating automatically");
        }
        do {
            finalShortcode = generateShortcode();
        } while (urlDatabase.has(finalShortcode));
    }

    if (!validity) {
        await Log("backend", "warn", "route", "No validity provided, using default 30 mins");
    }

    const expiryTime = new Date(Date.now() + (validity || 30) * 60 * 1000);

    urlDatabase.set(finalShortcode, {
        originalUrl: url,
        createdAt: new Date(),
        expiryTime,
        shortcode: finalShortcode,
    });

    clickStats.set(finalShortcode, {
        clickCount: 0,
        clicks: [],
    });

    await Log("backend", "info", "db", `Stored shortcode ${finalShortcode} for ${url}`);
    await Log("backend", "debug", "db", `Database now contains: ${Array.from(urlDatabase.keys()).join(', ')}`);

    res.status(201).json({
        shortLink: `http://localhost:3000/${finalShortcode}`,
        expiry: expiryTime.toISOString(),
    });
});

// GET /:shortcode - redirect
app.get("/:shortcode", async (req, res) => {
    const { shortcode } = req.params;

    // Debug logging
    await Log("backend", "debug", "route", `Looking for shortcode: ${shortcode}`);
    await Log("backend", "debug", "db", `Available shortcodes: ${Array.from(urlDatabase.keys()).join(', ')}`);

    const urlData = urlDatabase.get(shortcode);

    if (!urlData) {
        await Log("backend", "error", "route", `Shortcode ${shortcode} not found in database`);
        return res.status(404).json({ message: "Short URL not found" });
    }

    if (new Date() > urlData.expiryTime) {
        await Log("backend", "warn", "route", `Shortcode ${shortcode} has expired`);
        return res.status(410).json({ message: "Short URL has expired" });
    }

    const stats = clickStats.get(shortcode);
    stats.clickCount++;
    stats.clicks.push({ timestamp: new Date() });

    await Log("backend", "info", "route", `Redirecting ${shortcode} to ${urlData.originalUrl}`);

    res.redirect(urlData.originalUrl);
});

// GET /shorturls/:shortcode - stats
app.get("/shorturls/:shortcode", async (req, res) => {
    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);
    const stats = clickStats.get(shortcode);

    if (!urlData) {
        await Log("backend", "error", "route", `Stats requested for unknown shortcode: ${shortcode}`);
        return res.status(404).json({ message: "Short URL not found" });
    }

    await Log("backend", "info", "route", `Stats served for shortcode: ${shortcode}`);

    res.json({
        shortcode,
        originalUrl: urlData.originalUrl,
        createdAt: urlData.createdAt.toISOString(),
        expiryTime: urlData.expiryTime.toISOString(),
        clickCount: stats.clickCount,
        clicks: stats.clicks.map((click) => ({
            timestamp: click.timestamp.toISOString(),
        })),
    });
});

// Debug endpoint to check database contents
app.get("/debug/urls", async (req, res) => {
    await Log("backend", "info", "route", "Debug endpoint accessed");
    res.json({
        urls: Array.from(urlDatabase.entries()).map(([key, value]) => ({
            shortcode: key,
            originalUrl: value.originalUrl,
            createdAt: value.createdAt,
            expiryTime: value.expiryTime
        })),
        stats: Array.from(clickStats.entries()).map(([key, value]) => ({
            shortcode: key,
            clickCount: value.clickCount,
            clicks: value.clicks.length
        }))
    });
});

// 404 handler
app.use((req, res) => {
    Log("backend", "warn", "route", `Unknown route: ${req.method} ${req.path}`);
    res.status(404).json({ message: "Route not found" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
