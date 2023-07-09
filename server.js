// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./Models/dbMessages.js";
import Pusher from "pusher";
import cors from "cors"
import dotenv from "dotenv"

const env = dotenv.config();

// app config 
const app = express();
const port = process.env.PORT || 9000;

// middleware 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use(cors());

// db config 
const DB_USERNAME = "thefarhandeveloper"
const DB_PASSWORD = "sNoPE1RpPGjxeuMs"
const connectionUrl = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.trcvz8g.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionUrl)
.then(() => {
    console.log("Database Connected");
})
.catch((error) => {
    console.log(error);
});

// ???
const pusher = new Pusher({
    appId: "1631649",
    key: "c0c5cc845a36643e8dcf",
    secret: "f70a7ce28e2456f2add1",
    cluster: "eu",
    useTLS: true
  });

const db = mongoose.connection;

db.once("open", () => {
    console.log("Db connected");

    const msgCollection = db.collection("whatsapps");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                user: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            });
        }
    });
});

// api routes 
app.post("/api/v1/messages/new", async (req, res) => {
    const dbMessage= req.body;
    if (!dbMessage) {
        return res.status(422).json({error: "Please fill all feilds"});
    };
    const message = await Messages.create(dbMessage);
    if (message) {
        res.status(201).json({message});
    }
});
app.get("/messages/sync", async (req, res) => {
    const messages = await Messages.find({});
    if (!messages) {
        return res.status(422).json({error: "No Result Found"});
    }
    res.status(200).json({messages});
});


// listen 
app.listen(port, () => {
    console.log(`Listening on the port ${port}`);
});