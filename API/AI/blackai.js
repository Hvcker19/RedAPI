  const axios = require("axios");

  module.exports = (req, res) => {
      const question = req.query.question;
      if (!question) {
          return res.status(400).json({ error: "Question is required. Use question=" });
      }

      let answer = '';

      // Custom responses for specific queries
      if (question.includes('who are you?')) {
          answer = "I'm a ChatBot Created By YODI Nice to meet you!";
      } else if (question.includes('who created you?')) {
          answer = "I was created by YODI";
      } else if (question.includes('who are you')) {
          answer = "I'm a ChatBot Created By YODI Nice to meet you!";
      }

      if (answer !== '') {
          return res.json({ message: answer });
      }

      // BlackAI API request
      const url = 'https://useblackbox.io/chat-request-v4';
      const data = {
          textInput: question,
          allMessages: [{ user: question }],
          stream: '',
          clickedContinue: false,
      };

      axios.post(url, data)
          .then(response => {
              const message = response.data.response[0][0];
              return res.json({ message });
          })
          .catch(error => {
              console.error(error);  // Log the error for debugging purposes
              return res.status(500).json({ error: 'An error occurred during the BlackAI API request.' });
          });
  };
