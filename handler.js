require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const botNum = process.env.TWILIO_BOT_NUMBER;
const officePhoneNumber = process.env.OFFICE_PHONE_NUMBER;

const client = require("twilio")(accountSid, authToken);
const jwt_decode = require("jwt-decode");

const ADMIN_GROUP = "Admin";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const getFullDateString = (date) => {
  date = new Date(date);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${days[date.getDay()]}, ${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getYear() + 1900}`;
};

module.exports.autotextPatients = async (event) => {
  console.log(event.body);
  const {
    headers: { authorization },
    body,
  } = event;
  const { appointments } = JSON.parse(body);
  const token = authorization.split("Bearer ")[1];
  const decoded = jwt_decode(token);
  if (!decoded["cognito:groups"].includes(ADMIN_GROUP))
    return {
      statusCode: "401",
      body: "Unauthorized",
      headers,
    };

  if (appointments.length > 5)
    return {
      statusCode: "400",
      body: "Too Many Appointments. Max is 5",
      headers,
    };

  const promiseList = [];
  for (const appointment of appointments) {
    const { name, date, phoneNumber, time } = appointment;
    const body = `${
      name.split(" ")[0]
    }, your appt is at ${time} on ${getFullDateString(
      date
    )}. We look forward to seeing you!\nWaldorf Medical Clinic\nOffice of Dr. Ansari\n${officePhoneNumber}`;

    promiseList.push(
      client.messages.create({
        from: botNum,
        body,
        to: `+1${phoneNumber.replace(/\D/g, "")}`,
      })
    );
  }

  const res = await Promise.allSettled(promiseList);
  console.log('response', res);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        res,
      },
      null,
      2
    ),
    headers,
  };
};

module.exports.listTwilioMessages = async (event) => {
  const {
    headers: { authorization },
  } = event;
  const token = authorization.split("Bearer ")[1];
  const decoded = jwt_decode(token);
  if (!decoded["cognito:groups"].includes(ADMIN_GROUP))
    return {
      statusCode: "401",
      body: "Unauthorized",
      headers,
    };

  const messages = await client.messages.list();
  return messages;
};