const express = require("express");
const path = require("path");
const app = express();
const { OpenAI } = require("openai");
require("dotenv").config({ path: ".env" });

// a simple logging function :)
const myLog = (str) => console.log(`[app:log] [${new Date().toISOString()}] ${str}`);

myLog(`process.env.OPENAI_API_KEY: ${process.env.OPENAI_API_KEY || null}`);

// openai api key settings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// a middleware function with no mount path. This code is anytime a request is triggered and not matching any router
app.use((req, res, next) => {
    myLog(
    `[middleware:app_level] [${new Date().toISOString()}] ${req.method} ${
      req.url
    }`
  );
  next();
});

// API GET to handle search requests
app.post("/search-bot", (req, res) => {
  const { my_prompt } = req.body;

  openai.completions
    .create({
        role:'system',
        prompt: `search ${my_prompt}`,
        model: "text-davinci-002", //'gpt-3.5-turbo'
        temperature: 0.5,
    })
    .then((response) => {
      res.send(response.choices[0].text);
    })
    .catch((err) => {
      if (err instanceof OpenAI.APIError) {
        // console.log(err.status); // 400
        // console.log(err.name); // BadRequestError
        // console.log(err.headers); // {server: 'nginx', ...}
        // console.log(err.error.code); // Error code from OpenAI
        myLog(`[openai:error] type: ${err.name}\tcode: ${err.error.code}\tmessage: ${err.error.message}`); // Error message from OpenAI
        res.send(`Oops! technical issues. ${err.error.code}: ${err.error.message}`);
      } else {
        throw err;
      }
    });
});

// app listening on port 3000
app.listen(process.env.PORT || 3000, () => {
    myLog(`Server started on http://localhost:${process.env.PORT || 3000}`);
});
