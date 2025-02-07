// server.js
const express = require('express');
const app = express();

// Use express.json() middleware to parse JSON bodies.
app.use(express.json());

// Serve static files (HTML, CSS, client-side JavaScript) from the "public" directory.
app.use(express.static('public'));

// In-memory storage for messages
let timeoutid = -1;
let start_time = -1;
let best_time = -1;

const min_wait = 1.0;
const max_wait = 20.0;

/**
 * GET /messages
 * Returns the best recorded time so far.
 */
app.get('/messages', (req, res) => {
  res.json({"besttime": best_time});
});

/**
 * POST /messages
 * Expects a JSON payload with key="command".
 * when command=start(Start button pressed), start the counting procedure after a random time.
 * when command=stop(Stop button pressed), record/return the time or cancel recording if the player pressed too early.
 */
app.post('/messages', (req, res) => {
  if (req.body["command"] === "start") {
    canceled = false;
    const wait_time = 1000.0*min_wait + Math.random()*1000.0*(max_wait-min_wait);
    timeoutid = setTimeout(()=>{
      res.send(JSON.stringify({"command": "activate"}));
      start_time = Date.now();  
    }, wait_time);
  } else if (req.body["command"] === "stop") {
    if(start_time<0){
      clearTimeout(timeoutid);
      res.send(JSON.stringify({"result": "No Contest"}));  
    } else {
      let score = Date.now() - start_time;
      res.send(JSON.stringify({"result": score}));
      if(best_time<0 || best_time>score){
        best_time = score;
        console.log("new record!:"+best_time);
      }
      start_time = -1;
    }
  } else {
    console.log(req.body)
  }
});

// Define the port (default to 3000 if not specified).
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
