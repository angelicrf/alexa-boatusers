const { v4: uuidv4 } = require("uuid");
const myRequest = require("https");
let getData = require("../skill-package/proactive-event.json");

const getProactiveAccessToken = () => {
  let data = JSON.stringify({
    grant_type: "client_credentials",
    client_id: "amzn1.application-oa2-client.45e216f2fc214eec95a17fd39a95146c",
    client_secret:
      "0edaa57cd2a556c1a5c8c30e5f5e710a620c39a027d24cedc7c8624c45afa726",
  });

  const options = {
    hostname: "api.amazon.com",
    path: "/auth/o2/token?scope=alexa::proactive_events",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = myRequest
      .request(options, (res) => {
        let data = "";

        console.log("Status Code:", res.statusCode);

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          let getAToken = JSON.parse(data).access_token;
          console.log("Access Token ", getAToken);
          resolve(getAToken);
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        reject(err.message);
      });

    req.write(data);
    req.end();
  });
};
const modifyEvent = () => {
  return new Promise((resolve, reject) => {
    getData.timestamp = new Date().toISOString();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    getData.expiryTime = tomorrow.toISOString();
    getData.referenceId = uuidv4();

    if (getData.referenceId !== "data") {
      resolve(getData);
    } else reject("there is an error");
  });
};
const displayProacvtiveENotification = async (thisAccessToken, receiveData) => {
  console.log(
    `BoatUsers Proactive-Event Data: ${JSON.stringify(
      receiveData
    )} and Payload Status:  ${receiveData.event.payload.state.status} `
  );
  return new Promise((resolve, reject) => {
    try {
      let data = JSON.stringify(receiveData);
      const options = {
        hostname: "api.amazonalexa.com",
        path: "/v1/proactiveEvents/stages/development",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
          Authorization: `Bearer ${thisAccessToken}`,
        },
      };

      const req = myRequest
        .request(options, (res) => {
          let data = "";

          console.log("Status Code:", res.statusCode);

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            let msg = "Notification Sent to Alexa";
            console.log(`${msg}`);

            resolve(msg);
          });
        })
        .on("error", (err) => {
          console.log("Error: ", err.message);
          reject(err.message);
        });

      req.write(data);
      req.end();
    } catch (err) {
      console.log(err);
    }
  });
};
const stepsGetATokenSendNotification = async () => {
  let rcAToken = await getProactiveAccessToken();
  let receiveData = await modifyEvent();
  await displayProacvtiveENotification(rcAToken, receiveData);
};
stepsGetATokenSendNotification();
