const axios = require("axios");

module.exports = async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required. Use prompt=" });
    }

    const apiUrl = 'https://google.projectex.repl.co/generateText';

    try {
        const response = await axios.get(apiUrl, { params: { prompt } });
        return res.json(response.data);
    } catch (error) {
        console.error(error);
    }
};
