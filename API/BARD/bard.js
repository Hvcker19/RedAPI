const express = require('express');
const fs = require('fs');

let sessionId, cookies;

class Bardai {
  constructor(cookie) {
    try {
      this.cookie = cookie[0].value;
    } catch (e) {
      throw new Error("Session Cookies are missing, Unable to login an account!");
    }
  }

  async login() {
    if (!this.cookie) throw new Error('Error logging in your account, session cookies are missing.');
    else {
      cookies = this.cookie;
      let headerParams = {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Cookie": `__Secure-1PSID=${this.cookie};`
      }
      let instance = axios.create({
        withCredentials: true,
        baseURL: "https://bard.google.com/",
        headers: headerParams
      });
      return instance.get().then(r => {
        try {
          sessionId = r.data.match(/SNlM0e":"(.*?)"/g)[0].substr(8).replace(/\"/g, '');
        } catch (e) {
          throw new Error('Unable to login your account. Please try to use new cookies and try again.');
        }
      })
    }
  }
}

let formatMarkdown = (text, images) => {
  if (!images) return text;
  for (let imageData of images) {
    const formattedTag = `![${imageData.tag}](${imageData.url})`;
    text = text.replace(new RegExp("(?<!\!)" + imageData.tag.replace("[", "\\[").replace("]", "\\]")), formattedTag);
  }
  return text;
};

let chat = async (message) => {
  if (!sessionId) throw new Error('Please initialize login first to use Bardai.');

  let postParamsStructure = [
    [message],
    null,
    [],
  ];
  let postData = {
    "f.req": JSON.stringify([null, JSON.stringify(postParamsStructure)]),
    at: sessionId
  };
  let headerParams = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "Cookie": `__Secure-1PSID=${cookies};`
  };

  const response = await axios({
    method: 'POST',
    url: 'https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20230711.08_p0&_reqID=0&rt=c',
    headers: headerParams,
    withCredentials: true,
    data: postData
  });

  let bardAIRes = JSON.parse(response.data.split("\n")[3])[0][2];
  if (!bardAIRes) throw new Error(`Bard AI encountered an error ${response.data}.`);
  let bardData = JSON.parse(bardAIRes);
  let bardAI = JSON.parse(bardAIRes)[4][0];
  let result = bardAI[1][0];
  let images = bardAI[4]?.map(e => {
    return {
      url: e[3][0][0],
      tag: e[2],
    }
  });

  return { result: result, images: images };
}

const app = express();

app.set('json spaces', 4);

app.get('/bard', async (req, res) => {
  let message = req.query.ask;
  if (!message) {
    return res.status(400).send({ error: 'Message query parameter is missing.' });
  }

  try {
    let sessionCookies = JSON.parse(fs.readFileSync('./BARD/bardSession.json'));
    let bard = new Bardai(sessionCookies);
    await bard.login();
    let responseFromBard = await chat(message);

    let formattedResponse = formatMarkdown(responseFromBard.images);

    return res.send({
 result: responseFromBard.result,
image: formattedResponse
 });
  } catch (error) {
    console.error("Error while processing Bard request:", error.message);
    return res.status(500).send({ error: `Error processing the request: ${error.message}` });
  }
});

module.exports = Bardai;