require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const urls = new Set();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
    try {
        const { hostname } = new URL(req.body.url);
        dns.lookup(hostname, (err, address, family) => {
            if (!err) {
                urls.add(req.body.url);
                res.json({
                    original_url: req.body.url,
                    short_url: Array.from(urls).indexOf(req.body.url) + 1,
                });
            } else {
                res.json({ error: "Invalid URL" });
            }
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.get("/api/shorturl/:id", (req, res) => {
    const intIndex = parseInt(req.params.id) - 1;
    if (intIndex + 1 > urls.size || !Array.from(urls)[intIndex]) {
        res.json({ error: "No short URL found for the given input" });
    } else {
        const externalUrl = Array.from(urls)[intIndex];
        try {
            const externalUrlObject = new URL(externalUrl);
            res.redirect(externalUrl);
        } catch (error) {
            res.json({ error: error.message });
        }
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
