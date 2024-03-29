const AWS = require("aws-sdk");
const lambda = new AWS.Lambda();
const myRequest = require("https");
let thisState = "ON";

const callChildLambdaFunc = async (thisName) => {
  const params = {
    FunctionName: `${thisName}`,
    InvocationType: "RequestResponse",
    LogType: "None",
    Payload: "{}",
  };
  const response = await lambda.invoke(params).promise();
  if (response.StatusCode !== 200) {
    throw new Error("Failed to get response from lambda function");
  }
  log("response", "childFunc", JSON.stringify(response.Payload));
  return JSON.parse(response.Payload);
};
const getUserProfileInfo = async (thisToken) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.amazon.com",
      path: "/user/profile",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${thisToken}`,
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
          console.log("User Profile: ", JSON.parse(data));
          return resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        return reject(err.message);
      });
    req.end();
  });
};
const sendChangeReportEvent = async (thisToken) => {
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
            token: `${thisToken}`,
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
                uncertaintyInMilliseconds: 500,
              },
              {
                namespace: "Alexa.EndpointHealth",
                name: "connectivity",
                value: {
                  value: "OK",
                },
                timeOfSample: "2021-06-03T16:00:50Z ",
                uncertaintyInMilliseconds: 0,
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
          return resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        return reject(err.message);
      });

    req.write(data);
    req.end();
  });
};
const handleStateReport = async (request, context) => {
  var requestMethod = request.directive.header.name;
  var responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  responseHeader.payloadVersion = "3";
  responseHeader.name = "StateReport";

  responseHeader.messageId = responseHeader.messageId + "-R";
  // get user token pass in request
  var requestToken = request.directive.endpoint.scope.token;

  var contextResult = {
    properties: [
      {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: thisState,
        timeOfSample: "2022-11-20T16:20:50.52Z", //retrieve from result.
        uncertaintyInMilliseconds: 50,
      },
      {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
          value: "OK",
        },
        timeOfSample: "2022-11-20T22:43:17.877738+00:00",
        uncertaintyInMilliseconds: 0,
      },
      {
        namespace: "Alexa.EndpointHealth",
        name: "battery",
        value: {
          health: {
            state: "WARNING",
            reasons: ["LOW_CHARGE"],
          },
          levelPercentage: 45,
        },
        timeOfSample: "2022-11-20T16:20:50Z",
        uncertaintyInMilliseconds: 0,
      },
    ],
  };
  var response = {
    context: contextResult,

    event: {
      header: responseHeader,
      endpoint: {
        scope: {
          type: "BearerToken",
          token: requestToken,
        },
        endpointId: "sample-switch-01",
      },
      payload: {},
    },
  };
  log(
    "DEBUG Angelique Boat Users State Report",
    "Alexa.PowerController ",
    JSON.stringify(response)
  );
  //await sendChangeReportEvent(response.event.scope.token);
  await getUserProfileInfo(requestToken);
  context.succeed(response);
};

const handleAuthorization = (request, context) => {
  // Send the AcceptGrant response
  var payload = {};
  var header = request.directive.header;
  header.name = "AcceptGrant.Response";
  log(
    "DEBUG",
    "AcceptGrant Response: ",
    JSON.stringify({ header: header, payload: payload })
  );
  context.succeed({ event: { header: header, payload: payload } });
};

const handleChangeReport = (request, context) => {
  var requestMethod = request.directive.header.name;
  var responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  responseHeader.payloadVersion = "3";
  responseHeader.name = "Response";

  responseHeader.messageId = responseHeader.messageId + "-R";
  responseHeader.correlationToken = responseHeader.messageId + "-R";
  // get user token pass in request
  var requestToken = request.directive.endpoint.scope.token;
  console.log(requestToken);

  var contextResult = {
    properties: [
      {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
          value: "OK",
        },
        timeOfSample: "2022-11-20T22:43:17.877738+00:00",
        uncertaintyInMilliseconds: 0,
      },
      {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: "OFF",
        timeOfSample: "2022-11-20T16:20:50.52Z",
        uncertaintyInMilliseconds: 1000,
      },
    ],
  };
  var response = {
    context: contextResult,

    event: {
      header: responseHeader,
      endpoint: {
        scope: {
          type: "BearerToken",
          token: requestToken,
        },
        endpointId: "sample-switch-01",
        payload: {},
      },

      //payload: {
      //   change: {
      //     cause: {
      //       type: "PHYSICAL_INTERACTION"
      //      },
      //      properties: [
      //       {
      //         "namespace": "Alexa.PowerController",
      //         "name": "powerState",
      //         "value": "ON",
      //         "timeOfSample": "2022-11-20T16:20:50.52Z", //retrieve from result.
      //         "uncertaintyInMilliseconds": 50
      //       }
      //      ]
      //   }
      //},
    },
  };
  log(
    "DEBUG Angelique Boat Users Change Report ",
    "Alexa.PowerController ",
    JSON.stringify(response)
  );
  context.succeed(response);
};

const handleDiscovery = (request, context) => {
  // Send the discovery response
  var payload = {
    endpoints: [
      {
        endpointId: "sample-switch-01",
        manufacturerName: "Allterco Robotics",
        friendlyName: "Boat Switch",
        description: "Shelly Smart Plug",
        displayCategories: ["SMARTPLUG"],
        additionalAttributes: {
          manufacturer: "Allterco Robotics",
          model: "Sample Model",
          serialNumber: "U11112233456",
          firmwareVersion: "20221024",
          softwareVersion: "1",
          customIdentifier: "Shelly Plug ID",
        },
        cookie: {},
        capabilities: [
          {
            type: "AlexaInterface",
            interface: "Alexa.PowerController",
            version: "3",
            properties: {
              supported: [
                {
                  name: "powerState",
                },
              ],
              proactivelyReported: true,
              retrievable: true,
            },
          },
          {
            type: "AlexaInterface",
            interface: "Alexa.EndpointHealth",
            version: "3.2",
            properties: {
              supported: [
                {
                  name: "connectivity",
                },
              ],
              proactivelyReported: true,
              retrievable: true,
            },
          },
          {
            type: "AlexaInterface",
            interface: "Alexa",
            version: "3",
          },
        ],
      },
    ],
  };
  var header = request.directive.header;
  header.name = "Discover.Response";
  log(
    "DEBUG",
    "Discovery Response: ",
    JSON.stringify({ header: header, payload: payload })
  );

  context.succeed({ event: { header: header, payload: payload } });
};

const log = (message, message1, message2) =>
  console.log(message + message1 + message2);

const handlePowerControl = (request, context) => {
  var requestMethod = request.directive.header.name;
  var responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  responseHeader.name = "Response";
  responseHeader.messageId = responseHeader.messageId + "-R";
  responseHeader.correlationToken = responseHeader.messageId + "-R";
  var requestToken = request.directive.endpoint.scope.token;

  //var powerResult;
  thisState = "";

  if (requestMethod === "TurnOn") {
    //powerResult = "ON";
    thisState = "ON";
  } else if (requestMethod === "TurnOff") {
    //powerResult = "OFF";
    thisState = "OFF";
  }
  // Return the updated powerState.  Always include EndpointHealth in your Alexa.Response
  var contextResult = {
    properties: [
      {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: thisState,
        timeOfSample: "2022-11-20T16:20:50.52Z", //retrieve from result.
        uncertaintyInMilliseconds: 500,
      },
      {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
          value: "OK",
        },
        timeOfSample: "2022-11-20T22:43:17.877738+00:00",
        uncertaintyInMilliseconds: 0,
      },
    ],
  };
  var response = {
    context: contextResult,

    event: {
      header: responseHeader,
      endpoint: {
        scope: {
          type: "BearerToken",
          token: requestToken,
        },
        endpointId: "sample-switch-01",
      },
      payload: {},
    },
  };
  log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
  context.succeed(response);
};
exports.handler = (request, context) => {
  if (
    request.directive.header.namespace === "Alexa.Discovery" &&
    request.directive.header.name === "Discover"
  ) {
    log("DEBUG:", "Discover request", JSON.stringify(request));
    handleDiscovery(request, context, "");
  } else if (
    request.directive.header.namespace === "Alexa" &&
    request.directive.header.name === "ChangeReport"
  ) {
    console.log(JSON.stringify(request));
    handleChangeReport(request, context);
  } else if (
    request.directive.header.namespace === "Alexa" &&
    request.directive.header.name === "ReportState"
  ) {
    //console.log(JSON.stringify(request));
    handleStateReport(request, context);
  } else if (request.directive.header.namespace === "Alexa.PowerController") {
    if (
      request.directive.header.name === "TurnOn" ||
      request.directive.header.name === "TurnOff"
    ) {
      log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
      handlePowerControl(request, context);
    }
  } else if (request.directive.header.namespace === "Alexa.Authorization") {
    if (request.directive.header.name === "AcceptGrant") {
      handleAuthorization(request, context);
    }
  }
};
