const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const { MongoClient } = require("mongodb"); 
const path = require("path");

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const KOREADER_API = process.env.KOREADER_API
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; 
const MONGO_URI = process.env.MONGODB_URI; 

// Don´t change anything unless you know what you´re doing above this line! ----------------------------------------------------------------------------------------------------------------------------------------------

// CHANGE YOU STATUS TEXT HERE:D
const STATUS_TEMPLATE = process.env.STATUS_TEMPLATE || "Reading {title} ({percentage}%) • Last read: {timeText}";
const STATUS_EMOJI = process.env.STATUS_EMOJI || "❤️"; // An Emoji at the start of the text, leave empty if you don´t want a emoji.


// Don´t change anything unless you know what you´re doing beneath this line! ----------------------------------------------------------------------------------------------------------------------------------------------

let db, booksCollection;
let lastSentStatus = ""; // Cache to prevent sending identical status updates to Discord

async function connectDB() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db("koreader_db");
    booksCollection = db.collection("books");
    console.log("Connected to MongoDB Atlas");
}

async function updateStatuses(book) {
    if (!book || !DISCORD_TOKEN) return;

    const diffMs = Date.now() - book.lastSync;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    
    let timeText = totalMinutes < 1 ? "Just now" : 
                   `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')} hours ago`;
    
    const statusText = STATUS_TEMPLATE
        .replace("{title}", book.title)
        .replace("{percentage}", book.percentage)
        .replace("{timeText}", timeText);

    // RATE LIMIT PROTECTION: If the status string hasn't changed at all, skip the API call.
    if (statusText === lastSentStatus) {
        return; 
    }

    const statusData = { text: statusText };
    if (STATUS_EMOJI) {
        statusData.emoji_name = STATUS_EMOJI;
    }

    try {
        await axios.patch(
            'https://discord.com/api/v9/users/@me/settings',
            { custom_status: statusData },
            { headers: { authorization: DISCORD_TOKEN } }
        );
        console.log(`Updated Discord: ${statusText}`);
        lastSentStatus = statusText; // Save successful update to cache
    } catch (error) {
        console.error("Discord update failed:", error.message);
    }
}

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/add-book", async (req, res) => {
    const { title, docId } = req.body;
    await booksCollection.findOneAndUpdate(
        { docId },
        { $set: { title, percentage: 0, lastSync: Date.now() } },
        { upsert: true } 
    );
    res.redirect("/");
});

app.post("/rename-book", async (req, res) => {
    const { title, docId } = req.body;
    await booksCollection.updateOne(
        { docId },
        { $set: { title } }
    );
    res.redirect("/");
});

app.get("/books", async (req, res) => {
    const books = await booksCollection.find({}).toArray();
    res.json(books);
});

app.use("/api/koreader", async (req, res) => {
    let targetPath = req.originalUrl.replace("/api/koreader", "");
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
    const targetUrl = KOREADER_API + targetPath;

    console.log(`\n[PROXY] Incoming ${req.method} request from device`);
    
    if (req.method === "PUT" && targetPath.includes("/progress")) {
        try {
            const docId = req.body.document;
            const percentage = Math.round(req.body.percentage * 100);
            
            const result = await booksCollection.findOneAndUpdate(
                { docId },
                { 
                    $set: { percentage, lastSync: Date.now() },
                    $setOnInsert: { title: "Unknown Novel" } 
                },
                { upsert: true, returnDocument: "after" }
            );

            const updatedBook = result.value || result; 
            if (updatedBook) updateStatuses(updatedBook);
        } catch (err) {
            console.error("[DB ERROR]:", err);
        }
    }

    try {
        const headers = { ...req.headers };
        delete headers.host;
        delete headers.connection;
        delete headers["content-length"];
        delete headers["accept-encoding"]; 

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: req.body,
            responseType: "json", 
            validateStatus: () => true
        });
        
        res.setHeader('Content-Type', 'application/json');
        res.status(response.status).json(response.data);

    } catch (err) {
        console.error("[PROXY ERROR]:", err.message);
        res.status(502).send("Bad Gateway");
    }
});

app.post("/delete-book", async (req, res) => {
    const { docId } = req.body; 
    try {
        const result = await booksCollection.deleteOne({ docId }); 
        if (result.deletedCount === 1) console.log("Book deleted successfully");
        res.redirect("/"); 
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).send("Error deleting book");
    }
});

cron.schedule('*/15 * * * *', async () => {
    if (!booksCollection) return;
    try {
        const activeBook = await booksCollection.findOne({}, { sort: { lastSync: -1 } });
        if (activeBook) updateStatuses(activeBook);
    } catch (err) {
        console.error("Cron job error:", err);
    }
});

async function startServer() {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Proxy listening on port", PORT);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB, server not started:", err);
        process.exit(1);
    }
}

startServer();
