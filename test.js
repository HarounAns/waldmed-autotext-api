const { autotextPatients } = require("./handler");
require("dotenv").config();

const jwt = process.env.TEST_JWT;
const phoneNumber = process.env.TEST_PHONE_NUMBER;

const testEvent = {
  test: true,
  headers: { authorization: `Bearer ${jwt}` },
  body: JSON.stringify({
    appointments: [
      {
        name: "Haroun Ansari",
        date: "6/1/2021",
        phoneNumber: phoneNumber,
        time: "8:30 am",
      },
    ],
  }),
};

autotextPatients(testEvent).then(console.log);
