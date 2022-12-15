const { v4: uuidv4 } = require("uuid");
let getData = require("../skill-package/proactive-event.json");

getData.timestamp = new Date().toISOString();

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

getData.expiryTime = tomorrow.toISOString();
getData.referenceId = uuidv4();

console.log(
  `BoatUsers Proactive-Event Data: ${JSON.stringify(
    getData
  )} and Payload Status:  ${getData.event.payload.state.status} `
);
