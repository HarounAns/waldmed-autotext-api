require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

client.messages.list().then((messages) => {
  messages = messages.filter((m) => m.errorCode === 30006);
  messages.map(({ to }) => {
    console.log(to);
  });
});
