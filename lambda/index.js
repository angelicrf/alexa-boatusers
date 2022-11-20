let payload = {};
let header = null;
let { thisPayload } = require("./lambdapayload");
let {
  thisContextResult,
  callThisResponse,
  thisPowerResult,
} = require("./lambdaproperties");

const handleAuthorization = (request, context) => {
  // Send the AcceptGrant response
  payload = {};
  header = request.directive.header;
  header.name = "AcceptGrant.Response";
  log("DEBUG", "AcceptGrant Response: ", JSON.stringify({ header, payload }));
  context.succeed({ event: { header, payload } });
};

const handleDiscovery = (request, context) => {
  // Send the discovery response
  payload = thisPayload;
  header = request.directive.header;
  header.name = "Discover.Response";
  log("DEBUG", "Discovery Response: ", JSON.stringify({ header, payload }));
  context.succeed({ event: { header, payload } });
};

const log = (message, message1, message2) =>
  console.log(message + message1 + message2);

const handlePowerControl = (request, context) => {
  // get device ID passed in during discovery
  let requestMethod = request.directive.header.name;
  let responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  responseHeader.name = "Response";
  responseHeader.messageId = responseHeader.messageId + "-R";
  // get user token pass in request
  var requestToken = request.directive.endpoint.scope.token;
  var powerResult = thisPowerResult;

  if (requestMethod === "TurnOn") {
    // Make the call to your device cloud for control
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    powerResult = "ON";
  } else if (requestMethod === "TurnOff") {
    // Make the call to your device cloud for control and check for success
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    powerResult = "OFF";
  }
  // Datetime format for timeOfSample is ISO 8601, `YYYY-MM-DDThh:mm:ssZ`.
  let contextResult = thisContextResult;
  let response = callThisResponse(contextResult, responseHeader, requestToken);
  log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
  context.succeed(response);
};

const myAwsCodeCommitRepo = (myRepo) => console.log(myRepo);

myAwsCodeCommitRepo(
  "https://git-codecommit.us-east-1.amazonaws.com/v1/repos/07b40eb9-7173-471f-8106-de2b6b7c3ef5"
);
exports.handler = (request, context) => {
  if (
    request.directive.header.namespace === "Alexa.Discovery" &&
    request.directive.header.name === "Discover"
  ) {
    log("DEBUG:", "Discover request", JSON.stringify(request));
    handleDiscovery(request, context, "");
  } else if (request.directive.header.namespace === "Alexa.PowerController") {
    if (
      request.directive.header.name === "TurnOn" ||
      request.directive.header.name === "TurnOff"
    ) {
      log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
      handlePowerControl(request, context);
    }
  } else if (
    request.directive.header.namespace === "Alexa.Authorization" &&
    request.directive.header.name === "AcceptGrant"
  ) {
    handleAuthorization(request, context);
  }
};
