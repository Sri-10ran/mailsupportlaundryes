const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'bathran14sri@gmail.com',
        pass: 'gbnq ktzt nayj jirk', // Use environment variables instead of hardcoding
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle complaint submission
app.post("/send-email", upload.fields([{ name: "photo" }, { name: "voice_note" }]), async (req, res) => {
    try {
        const { order_id, problem_description } = req.body;
        const photo = req.files["photo"] ? req.files["photo"][0] : null;
        const voiceNote = req.files["voice_note"] ? req.files["voice_note"][0] : null;

        const mailOptions = {
            from: process.env.EMAIL, // Use configured email
            to: "bathranpro@gmail.com",
            subject: `New Complaint - Order ID: ${order_id}`,
            text: `Order ID: ${order_id}\nProblem Description: ${problem_description}`,
            attachments: []
        };

        if (photo) {
            mailOptions.attachments.push({
                filename: photo.originalname,
                path: photo.path
            });
        }

        if (voiceNote) {
            mailOptions.attachments.push({
                filename: voiceNote.originalname,
                path: voiceNote.path
            });
        }

        await transporter.sendMail(mailOptions);

        // Clean up uploaded files after email is sent
        if (photo) fs.unlinkSync(photo.path);
        if (voiceNote) fs.unlinkSync(voiceNote.path);

        res.status(200).json({ message: "Complaint submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting complaint" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
