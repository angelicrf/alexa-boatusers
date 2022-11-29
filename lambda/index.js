exports.handler = (request, context) => {
  if (
    request.directive.header.namespace === "Alexa.Discovery" &&
    request.directive.header.name === "Discover"
  ) {
    log("DEBUG:", "Discover request", JSON.stringify(request));
    handleDiscovery(request, context, "");
  } else if (request.directive.header.namespace === "Alexa") {
    if (request.directive.header.name === "ChangeReport") {
      console.log(JSON.stringify(request));
      handleChangeReport(request, context);
    }
    if (request.directive.header.name === "ReportState") {
      //console.log(JSON.stringify(request));
      handleStateReport(request, context);
    }
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

const sendChangeReportEvent = async (thisToken) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
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

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve, reject) => {
    fetch("https://api.amazonalexa.com/v3/events", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        return resolve(result);
      })
      .catch((error) => {
        console.log("error", error);
        return reject(error);
      });
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
        value: "ON",
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
  await sendChangeReportEvent(response.event.scope.token);
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
  // get device ID passed in during discovery
  var requestMethod = request.directive.header.name;
  var responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  //responseHeader.payloadVersion = "3";
  responseHeader.name = "Response";
  //ChangeReport
  responseHeader.messageId = responseHeader.messageId + "-R";
  responseHeader.correlationToken = responseHeader.messageId + "-R";
  // get user token pass in request
  var requestToken = request.directive.endpoint.scope.token;

  var powerResult;

  if (requestMethod === "TurnOn") {
    // Make the call to your device cloud for control
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    powerResult = "ON";
  } else if (requestMethod === "TurnOff") {
    // Make the call to your device cloud for control and check for success
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    powerResult = "OFF";
  }
  // Return the updated powerState.  Always include EndpointHealth in your Alexa.Response
  // Datetime format for timeOfSample is ISO 8601, `YYYY-MM-DDThh:mm:ssZ`.
  var contextResult = {
    properties: [
      {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: powerResult,
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
