import express from "express";
import OpenAI from "openai";
import { config } from "dotenv";
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let liked_jobs = [];


config();


const apiKey = process.env.API_KEY;
if (!apiKey) {
   console.error("API_KEY is not set in the environment variables");
   process.exit(1);
}


const openai = new OpenAI({ apiKey });


const app = express();
app.use(express.json());


app.use(express.static(path.join(__dirname, 'CareerMatchmaking')));


app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, 'CareerMatchmaking/view.html'));
});


app.get("/questions", (req, res) => {
   res.sendFile(path.join(__dirname, 'CareerMatchmaking/quiz.html'));
});


app.post("/ask", async (req, res) => {
   const { q1, q2, q3, q4, q5, q6, q7, q8 } = req.body;
   const question = `My preferences: Programming languages - ${q1}, Computer science interest - ${q2}, Software development area - ${q3}, Work environment preference - ${q4}, Specialization - ${q5}, Location - ${q6}, Salary expectation - ${q7}, Experience - ${q8}. What career path would suit me best? Output it in the format of Job title: | Location: | Salary: | and Description: |`;
 
   try {
       const completion = await openai.chat.completions.create({
           messages: [{ role: "system", content: question }],
           model: "gpt-3.5-turbo",
           max_tokens: 150
       });


       let parts = completion.choices[0].message.content.split("|").map(part => part.trim());


       res.send(`<!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Generated Career Path</title>
           <link rel="stylesheet" href="style.css">
       </head>
       <body>
           <div class="card-container">
               <div class="card" id="card1">
                   <h2>${parts[0]}</h2>
                   <p>${parts[1]}</p>
                   <p>${parts[2]}</p>
                   <p>${parts[3]}</p>
                   <div class="buttons">
                   <button id="dislikeBtn" onclick="console.log('Dislike button clicked');
                   fetch('/ask', {
                       method: 'POST',
                       headers: {'Content-Type': 'application/json'},
                       body: JSON.stringify({
                           q1: '${q1}', q2: '${q2}', q3: '${q3}', q4: '${q4}',
                           q5: '${q5}', q6: '${q6}', q7: '${q7}', q8: '${q8}'
                       })
                   })
                   .then(response => {
                       if (!response.ok) throw new Error('Network response was not ok.');
                       return response.text();
                   })
                   .then(html => {
                       document.body.innerHTML = html;
                   })
                   .catch(error => console.error('Error:', error));"
                   ></button>








                       <button id="likeBtn" onclick="console.log('Like button clicked');
                       fetch('/ask', {
                           method: 'POST',
                           headers: {'Content-Type': 'application/json'},
                           body: JSON.stringify({
                               q1: '${q1}', q2: '${q2}', q3: '${q3}', q4: '${q4}',
                               q5: '${q5}', q6: '${q6}', q7: '${q7}', q8: '${q8}'
                           })
                       })
                       .then(response => {
                           if (!response.ok) throw new Error('Network response was not ok.');
                           return response.text();
                       })
                       .then(html => {
                           document.body.innerHTML = html;
                           fetch('/like', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                   title: '${parts[0]}',
                                   location: '${parts[1]}',
                                   salary: '${parts[2]}',
                                   description: '${parts[3]}'
                               })
                           })
                           .then(response => {
                               if (!response.ok) throw new Error('Failed to like the job');
                               console.log('Job liked successfully');
                           })
                           .catch(error => {
                               console.error('Error liking job:', error);
                           });
                       })
                       .catch(error => console.error('Error:', error));"
                       ></button>


                       <button id="liked_button" onclick="fetch('/liked')
                   .then(response => {
                       if (!response.ok) {
                           throw new Error('Network response was not ok.');
                       }
                       return response.text(); // Handle response as text
                   })
                   .then(html => {
                       document.body.innerHTML = html; // Update the DOM with the received HTML
                   })
                   .catch(error => {
                       console.error('Error:', error);
                   });">Liked Jobs</button>


      
                       </div>
               </div>
           </div>
       </body>
       </html>`);
   } catch (error) {
       console.error("Error:", error);
       res.status(500).send("Internal Server Error");
   }
});


app.post("/like", (req, res) => {
   liked_jobs.push(req.body);
   res.status(200).send("Job liked successfully");
});


app.get("/liked", (req, res) => {
   let htmlOutput = "<html><head><title>Liked Jobs</title></head><body><h1>Liked Jobs</h1>";
   liked_jobs.forEach(job => {
       htmlOutput += `<div><h2>${job.title}</h2><p>${job.description}</p><p>Location: ${job.location}</p><p>Salary: ${job.salary}</p></div>`;
   });
   htmlOutput += "</body></html>";
   res.send(htmlOutput);
});


app.listen(3000, () => {
   console.log("Server is running on port 3000");
});



