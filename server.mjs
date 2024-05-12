import express from "express";
import OpenAI from "openai";
import { config } from "dotenv";
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Proper handling of directory paths for Node.js ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("API_KEY is not set in the environment variables");
    process.exit(1); // Exit if no API key is found
}

const openai = new OpenAI({ apiKey });

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
    res.send("Hello World, Server is Running");
});

app.get("/questions", (req, res) => {
    // Send a file instead of plain text
    res.sendFile(path.join(__dirname, 'CareerMatchmaking/quiz.html')); 
});

app.post("/ask", async (req, res) => {
    // Extract form data from the request body
    const { q1, q2, q3, q4, q5, q6, q7, q8 } = req.body;

    // Construct a question based on form inputs
    const question = `My preferences: Programming languages - ${q1}, Computer science interest - ${q2}, Software development area - ${q3}, Work environment preference - ${q4}, Specialization - ${q5}, Location - ${q6}, Salary expectation - ${q7}, Experience - ${q8}. What career path would suit me best?`;

    try {
        // Call OpenAI API for completion
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: question }],
            model: "gpt-3.5-turbo",
            max_tokens: 150
        });

        // Directly create and send HTML content
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generated Career Path</title>
            <link rel="stylesheet" href="style.css">
            <script src="career.js"></script>
        </head>
        <body>
            <div class="card-container">
                <div class="card" id="card1">
                    <h2>${completion.choices[0].message.content}</h2>
                    <p>Company Location</p>
                    <p>Salary</p>
                    <p>Description</p>
                    <div class="buttons">
                        <button id="dislikeBtn">Dislike</button>
                        <button id="likeBtn">Like</button>
                    </div>
                </div>
            </div>
        </body>
        </html>`);

        console.log(completion.choices[0].message)

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
