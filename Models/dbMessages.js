import mongoose from "mongoose";

const whatsAppSchema = new mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
});

const WhatsApp = mongoose.model("WhatsApp", whatsAppSchema);

export default WhatsApp;