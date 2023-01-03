//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=ReportState
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=PowerController
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=Discovery
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=ChangeState
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=Authorization

const AWS = require("aws-sdk");
const lambda = new AWS.Lambda();
const myRequest = require("https");
const { onclickAToken } = require("./retreiveAccessToken");
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
    let options = {
      method: "POST",
      hostname: "api.amazonalexa.com",
      path: "/v3/events",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${thisToken}`,
      },
    };

    var req = myRequest.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        log(
          "DEBUG Angelique Boat Users Send ",
          "Change Report",
          "Befor Body Concat"
        );
        var body = Buffer.concat(chunks);
        console.log(`If Body Not Empty ${body.toString()}`);
        resolve("Sent ChangeReport Event");
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });
    let getDate = new Date().toISOString();
    var postData = JSON.stringify({
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
                timeOfSample: `${getDate}`,
                uncertaintyInMilliseconds: 0,
              },
              {
                namespace: "Alexa.EndpointHealth",
                name: "connectivity",
                value: {
                  value: "OK",
                },
                timeOfSample: `${getDate}`,
                uncertaintyInMilliseconds: 0,
              },
            ],
          },
        },
      },
      context: {},
    });
    req.write(postData);

    req.end();
  });
};
const apiPowerControlResponse = async (event, context) => {
  var requestMethod = JSON.parse(event.body).PowerHeader.name;
  var responseHeader = JSON.parse(event.body).PowerHeader;
  responseHeader.namespace = "Alexa";
  responseHeader.name = "Response";
  responseHeader.messageId = responseHeader.messageId + "-R";
  responseHeader.correlationToken = responseHeader.messageId + "-R";
  var requestToken = JSON.parse(event.body).powerToken;
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
const apiStateReportResponse = async (event, context) => {
  var responseHeader = JSON.parse(event.body).repHeader; // an object
  var requestToken = JSON.parse(event.body).repToken;

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
    "DEBUG Angelique Boat Users State Report API ",
    "Alexa.PowerController ",
    JSON.stringify(response)
  );

  await getUserProfileInfo(requestToken);
  context.succeed(response);
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

  await getUserProfileInfo(requestToken);
  context.succeed(response);
};

const issueAccessToken = (thisCode) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "api.amazon.com",
      path: "/auth/o2/token",
      headers: {
        "Content-Type": "application/json",
      },
    };

    var req = myRequest.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let responseAToken = JSON.parse(data).access_token;
        console.log(responseAToken);
        resolve(responseAToken);
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    let postData = JSON.stringify({
      grant_type: "authorization_code",
      code: `${thisCode}`,
      client_id:
        "amzn1.application-oa2-client.45e216f2fc214eec95a17fd39a95146c",
      client_secret:
        "0edaa57cd2a556c1a5c8c30e5f5e710a620c39a027d24cedc7c8624c45afa726",
      redirect_uri:
        "https://skills-store.amazon.com/api/skill/link/M2FC9FL6SREJQF",
    });

    req.write(postData);

    req.end();
  });
};

const handleAuthorization = async (request, context) => {
  log("DEBUG", "GetCode Response: ", request.directive.payload.grant.code);
  let getAccessToken = await issueAccessToken(
    request.directive.payload.grant.code
  );
  log("DEBUG", "GetAccessToken Response: ", getAccessToken);
  // Send Event Change Report
  await sendChangeReportEvent(getAccessToken);
  // store accessToken to db to send other events
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

      //payload: {},
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
const buildResponse = (options) => {
  let response = {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: options.speechText,
      },
      shouldEndSession: options.endSession,
    },
  };
  if (options.repromptText) {
    response.response.reprompt = {
      outputSpeech: {
        type: "PlainText",
        text: options.repromptText,
      },
    };
  }
  return response;
};
const handleStopIntent = (request, context) => {
  console.log("stop Intent Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Stopped , GoodBye?";
  options.endSession = true;
  context.succeed(buildResponse(options));
};
const handleLaunchIntent = (request, context) => {
  console.log("Launch Intent Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Welcome to Boat Users Alexa App";
  options.endSession = true;
  context.succeed(buildResponse(options));
};
const handleTurnOnEvent = (request, context) => {
  console.log("BUTurnOnSwitch Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Boat Users Switch Turned On";
  options.repromptText = "Boat Users Switch Turned On";
  options.endSession = false;
  context.succeed(buildResponse(options));
};
const handleTurnOffEvent = (request, context) => {
  console.log("BUTurnOffSwitch Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Boat Users Switch Turned Off";
  options.repromptText = "Boat Users Switch Turned Off";
  options.endSession = false;
  context.succeed(buildResponse(options));
};
const handleHelpEvent = (request, context) => {
  console.log("AMAZON.HelpIntent Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "How Boat Users Can help You?";
  options.repromptText = "How Boat Users Can help You?";
  options.endSession = false;
  context.succeed(buildResponse(options));
};
const handleCancelEvent = (request, context) => {
  console.log("AMAZON.CancelIntent Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Canceled, Goodbye";
  options.endSession = true;
  context.succeed(buildResponse(options));
};
const handleFallbackEvent = (request, context) => {
  //AMAZON.FallbackIntent
  console.log("AMAZON.FallbackIntent Callled");

  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "Intent Not found";
  options.repromptText = "FallBack intent Boat Users, Try again?";
  options.endSession = false;
  context.succeed(buildResponse(options));
};
const alexaApiRequestsProcess = async () => {
  // generate a new access token to launch and discovery
  // use the access Token to send notification request
  // use the access Token to send state change report request
  //------
  // generate access token to make alexa requests
  let secondAToken = await onclickAToken();
  // use the second access Token to make alexa requests
  await apiRequestReportState(secondAToken);
};
const apiRequestReportState = (thisToken) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws",
      path: "/?alexaEvent=ReportState",
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    var req = myRequest.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
      });
    });

    var postData = JSON.stringify({
      repHeader: {
        namespace: "Alexa",
        name: "ReportState",
        messageId: "newUUI",
      },
      repToken: `${thisToken}`,
    });

    req.write(postData);

    req.end();
  });
};
const apiRequestPowerControl = (thisToken, thisName) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws",
      path: "/?alexaEvent=PowerController",
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    var req = myRequest.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
      });
    });

    var postData = JSON.stringify({
      powerHeader: {
        namespace: "Alexa",
        name: `${thisName}`, //TurnOn TurnOff
        messageId: "newUUI",
      },
      powerToken: `${thisToken}`,
    });

    req.write(postData);

    req.end();
  });
};
exports.handler = (request, context, callback) => {
  if (JSON.stringify(request.requestContext) != undefined) {
    let requestType = JSON.stringify(request.requestContext.http.method);
    let strValue = requestType.replace(/^"(.+(?="$))"$/, "$1");

    if (strValue == "GET") {
      let paramValue = JSON.stringify(
        request.queryStringParameters.alexaMsg
      ).replace(/^"(.+(?="$))"$/, "$1");

      if (paramValue == "busersMsg") {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thisMsg: "success",
          }),
        });
      }
    }
    if (strValue == "POST") {
      let paramValue = JSON.stringify(
        request.queryStringParameters.alexaMsg
      ).replace(/^"(.+(?="$))"$/, "$1");

      if (paramValue == "repState") {
        if (JSON.stringify(request.body) != undefined) {
          // call api responses
          /* callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              thisMsg: "success",
            }),
          }); */
          handleStateReport(request, context);
        }
      }
    }
  }
  if (request.request != undefined) {
    console.log("entered to type");
    if (request.request.type === "LaunchRequest") {
      handleLaunchIntent(request, context);
    }
    if (request.request.type === "IntentRequest") {
      if (request.request.intent.name === "AMAZON.StopIntent") {
        handleStopIntent(request, context);
      }
      if (request.request.intent.name === "AMAZON.CancelIntent") {
        handleCancelEvent(request, context);
      }
      if (request.request.intent.name === "AMAZON.HelpIntent") {
        handleHelpEvent(request, context);
      }
      if (request.request.intent.name === "BUTurnOnSwitch") {
        handleTurnOnEvent(request, context);
      }
      if (request.request.intent.name === "BUTurnOffSwitch") {
        handleTurnOffEvent(request, context);
      }
      if (request.request.intent.name === "AMAZON.FallbackIntent") {
        handleFallbackEvent(request, context);
      }
    }
  }
  if (request.directive != undefined) {
    console.log(`Angelique Entered ${JSON.stringify(request.directive)}`);
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
  }
};
