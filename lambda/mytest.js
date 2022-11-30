const myRequest = require("https");

exports.handler = async (event) => {
  let thisAccess = event["thisAccess"];
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      event: {
        header: {
          namespace: "Alexa",
          name: "ChangeReport",
          messageId: "1bd5d003-31b9-476f-ad03-71d471922820",
          payloadVersion: "3",
        },
        endpoint: {
          scope: {
            type: "BearerToken",
            token: `${thisAccess}`,
          },
          endpointId: "sample-switch-01",
          cookie: {},
        },
        payload: {
          change: {
            cause: {
              type: "APP_INTERACTION",
            },
            properties: [
              {
                namespace: "Alexa.PowerController",
                name: "powerState",
                value: "OFF",
                timeOfSample: "2022-11-20T16:20:50Z",
                uncertaintyInMilliseconds: 60000,
              },
            ],
          },
        },
      },
      context: {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
          value: "OK",
        },
        timeOfSample: "2021-06-03T16:00:50Z ",
        uncertaintyInMilliseconds: 0,
      },
    });

    const options = {
      hostname: "api.amazonalexa.com",
      path: "/v3/events",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
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
          console.log("Body: ", JSON.parse(data));
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });

    req.write(data);
    req.end();
  });
};
