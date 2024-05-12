import express from "express";
import OpenAI from "openai";
import path from "path"; // Import the path module

const openai = new OpenAI({ apiKey: 'sk-proj-NfCYYHf2RGUrZ28BaQLHT3BlbkFJwkm7iyCiLmOiKvZA6rRP' });

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World, Server is Running");
});

app.get("/questions", (req, res) => {
  // Send a file instead of plain texts
  res.sendFile("/Users/thegreat/Desktop/CareerMatchmaker-1/CareerMatchmaking/quiz.html"); 
});

app.post("/ask", (req, res) => {
    // Extract form data from the request body
    const { q1, q2, q3, q4, q5, q6, q7, q8 } = req.body;

    // Construct a question based on form inputs
    const question = `My preferences: Programming languages - ${q1}, Computer science interest - ${q2}, Software development area - ${q3}, Work environment preference - ${q4}, Specialization - ${q5}, Location - ${q6}, Salary expectation - ${q7}, Experience - ${q8}. What career path would suit me best?`;

    async function main() {
        try {
            // Call OpenAI API for completion
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: question }],
                model: "gpt-3.5-turbo",
                max_tokens: 150
            });
            // res.json(completion.choices[0]);
            res.json(completion.choices[0].message.content);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    main();
});

app.listen(3000, () => {
    console.log("server is running");
});
