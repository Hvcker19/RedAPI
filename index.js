const express = require("express");
const path = require("path");
const axios = require("axios");
const chalkAnimation = require('chalkercli');
const chalk = require('chalk');
const pinterestAPI = require("./API/PINTEREST/pinte");
const blackAIAPI = require("./API/AI/blackai");
const geminiAPI = require("./API/AI/gemini");
const Bardai = require('./API/BARD/bard');;

const app = express();
app.set("port", process.env.PORT || 8888);
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage to keep track of the last access time for each route
const cooldowns = {};

app.use((req, res, next) => {
    console.log(`[ STATUS ] -> IP: ${req.ip} - Requested path: ${req.path}${req.url}`);

    // Check if the route has a cooldown period
    const cooldownPeriod = 5000; // 50 seconds in milliseconds
    const routeKey = req.path.toLowerCase(); 

    if (cooldowns[routeKey] && Date.now() - cooldowns[routeKey] < cooldownPeriod) {
        
        return res.status(429).json({ error: `Cooldown period active. Please wait ${Math.ceil((cooldowns[routeKey] + cooldownPeriod - Date.now()) / 1000)} seconds before making another request.` });
    }

    // Update the last access time for the route
    cooldowns[routeKey] = Date.now();

    next();
});

// Loading animation function
const loadingAnimation = async () => {
    let str = String.raw`
        LOADING API[▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒] 
    `;

    const karaoke = chalkAnimation.karaoke(str);
    karaoke.start();

    await new Promise(resolve => {
        setTimeout(() => {
            karaoke.stop();
            console.clear();
            resolve();
        }, 7000);
    });
};

const banner = (data) => {
    const rdcl = ['blue', 'yellow', 'green', 'red', 'magenta', 'yellowBright', 'blueBright', 'magentaBright'];
    const color = chalk[rdcl[Math.floor(Math.random() * rdcl.length)]];
    console.log(color(data));
};

// Log function
const log = (data, type) => {
    var color = ["\x1b[33m", "\x1b[34m", "\x1b[35m", '\x1b[36m', '\x1b[32m'];
    var more = color[Math.floor(Math.random() * color.length)];
    console.log(more + `[ ${type} ] -> ` + data);
};

// Pinterest API
app.all("/pinterest", async (req, res) => {
    await loadingAnimation(); 
  
    pinterestAPI(req, res);

   
    const bannerMessage = "Pinterest API request completed!";
    log(bannerMessage, 'INFO');
    banner(bannerMessage);
});

// Custom BlackAI API
app.get("/blackai", async (req, res) => {
    await loadingAnimation(); 
  
    await blackAIAPI(req, res);

    
    const bannerMessage = "BlackAI API request completed!";
    log(bannerMessage, 'INFO');
    banner(bannerMessage);
});

app.all("/heroku", async (req, res) => {
    try {
        await loadingAnimation(); 

        await geminiAPI(req, res);

        const bannerMessage = "Heroku API request completed!";
        log(bannerMessage, 'INFO');
        banner(bannerMessage);

        // Instead of sending a response here, you can just end the request
        res.end();
    } catch (error) {
        console.error(error);  
        res.status(500).json({ error: 'An error occurred during the Heroku API request.' });
    }
});

app.get("/bard", async (req, res) => {
    try {
        await loadingAnimation(); 

        const bardInstance = new Bardai(/* pass required parameters here */);
        await bardInstance.login(); // Call the login method or other relevant methods

        // Perform chat or other actions here
        const userMessage = req.query.ask; // Assuming the user's message is passed as a query parameter
        if (!userMessage) {
            return res.status(400).json({ error: 'Message query parameter is missing.' });
        }

        // Call the chat method or other relevant methods based on your Bardai class
        const bardResponse = await bardInstance.chat(userMessage);

        // Your logic to handle bardResponse, format the data, etc.

        const bannerMessage = "Bard API request completed!";
        log(bannerMessage, 'INFO');
        banner(bannerMessage);

        // Instead of sending a response here, you can just end the request
        res.end();
    } catch (error) {
        console.error(error);  
        res.status(500).json({ error: 'An error occurred during the Bard API request.' });
    }
});

// Start the server
app.listen(app.get("port"), () => {
    console.log(`\x1b[35m\x1b[1mServer is running on port ${app.get("port")}\x1b[0m`);
});
