//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=ReportState
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=PowerController
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=Discovery
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=ChangeState
//Post https://76ewqh4kz26525z22jjuyzooqy0ziulc.lambda-url.us-east-1.on.aws/?alexaEvent=Authorization

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
const handleStateReport = async (request, context) => {
  console.log(JSON.stringify(request));
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
const buildDirectiveResponse = (options, thisDirective) => {
  let response = {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: options.speechText,
      },
      directives: [thisDirective],
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
  console.log(JSON.stringify(response));
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
const apiPowerControlResponse = async (event, context) => {
  var requestMethod = JSON.parse(event.body).powerHeader.name;
  var responseHeader = JSON.parse(event.body).powerHeader;
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
  log("DEBUG", "Alexa.PowerController API", JSON.stringify(response));
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

  context.succeed(response);
};
const alexaAPLRequest = () => {
  const aplDocumentId = "busersAplResponse";

  const dataSource = {
    buData: {
      properties: {
        title: "Welcome to Boat Users Alexa Smart App!",
        subTitle: "BoatUsers App uses both primitive and responsive components",
        buStartText: "BoatUsersStart",
        buHeatherAttributeText: "BuLogo",
        welcomeNote: "Welcome to BU App",
        onClickBuDataText: "Btn is clicked",
        onPressBuDataText: "Animation changed the Text",
        onPressAnimReverseBuDataText: "Reverse Animation changed the Text",
        componentColors: {
          buHeatherColor: "rgba(251, 29, 9, 0.81)",
          buMainLayoutColor: "rgba(99, 84, 191, 0.48)",
          buAnimBoxColor: "rgba(33, 207, 50, 0.81)",
        },
        componentBtnIcons: {
          playIcon: "ic_play",
          stopIcon: "ic_stop",
          pauseIcon: "ic_pause",
        },
      },
    },
  };
  return {
    type: "Alexa.Presentation.APL.RenderDocument",
    token: "documentToken",
    document: {
      type: "Link",
      src: "doc://alexa/apl/documents/" + aplDocumentId,
    },
    datasources: dataSource,
  };
  // const DOCUMENT_ID = "buTestAPL";
  // const datasource = {
  //     "headlineTemplateData": {
  //         "type": "object",
  //         "objectId": "headlineSample",
  //         "properties": {
  //             "backgroundImage": {
  //                 "contentDescription": null,
  //                 "smallSourceUrl": null,
  //                 "largeSourceUrl": null,
  //                 "sources": [
  //                     {
  //                         "url": "https://robbreport.com/wp-content/uploads/2019/07/adastra-1-courtesy-jochen-manz_orion-shuttleworth.jpg",
  //                         "size": "large"
  //                     }
  //                 ]
  //             },
  //             "textContent": {
  //                 "primaryText": {
  //                     "type": "PlainText",
  //                     "text": "Welcome to The Boat USers App"
  //                 }
  //             },
  //             "logoUrl": "https://i.etsystatic.com/25493577/r/il/bf60c2/4022952886/il_794xN.4022952886_8r9f.jpg",
  //             "hintText": "Try, \"Alexa, bu turn on switch or bu turn off switch\""
  //         }
  //     }
  // };
  //     return {
  //       type: "Alexa.Presentation.APL.RenderDocument",
  // token: "buAPLToken",
  // document: {
  //   type: "Link",
  //   src: "doc://alexa/apl/documents/" + DOCUMENT_ID,
  // },
  //         datasources: datasource
  //     }
};
const handleAplEvent = (request, context) => {
  let getAplRequest = alexaAPLRequest();
  let options = {
    speechText: "",
    repromptText: "",
    endSession: "",
  };
  options.speechText = "APL Boat Users Event called";
  options.repromptText = "APL Event called?";
  options.endSession = true;
  context.succeed(buildDirectiveResponse(options, getAplRequest));
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
          apiStateReportResponse(request, context);
        }
      }
      if (paramValue == "PowerController") {
        if (JSON.stringify(request.body) != undefined) {
          apiPowerControlResponse(request, context);
        }
      }
    }
  }
  if (request.request != undefined) {
    console.log(`entered to type`);
    if (request.request.type === "LaunchRequest") {
      if (
        JSON.stringify(
          request.context.System.device.supportedInterfaces[
            "Alexa.Presentation.APL"
          ]
        ) != undefined
      ) {
        console.log("APL is supported");
        handleAplEvent(request, context);
      } else {
        handleLaunchIntent(request, context);
      }
    }
    if (request.request.type === "IntentRequest") {
      if (request.request.intent.name === "AMAZON.StopIntent") {
        console.log("stop Request Callled");
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
