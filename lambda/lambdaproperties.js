let thisPowerResult;

let thisContextResult = {
  properties: [
    {
      namespace: "Alexa.PowerController",
      name: "powerState",
      value: thisPowerResult,
      timeOfSample: "2022-09-03T16:20:50.52Z", //retrieve from result.
      uncertaintyInMilliseconds: 50,
    },
    {
      namespace: "Alexa.EndpointHealth",
      name: "connectivity",
      value: {
        value: "OK",
      },
      timeOfSample: "2022-09-03T22:43:17.877738+00:00",
      uncertaintyInMilliseconds: 0,
    },
  ],
};
const callThisResponse = (thisCtnResult, thisHdResponse, thisToken) => {
  let thisResponse = {
    context: thisCtnResult,
    event: {
      header: thisHdResponse,
      endpoint: {
        scope: {
          type: "BearerToken",
          token: thisToken,
        },
        endpointId: "my-shelly-switch-01",
      },
      payload: {},
    },
  };
  return thisResponse;
};
module.exports = {
  callThisResponse,
  thisContextResult,
  thisPowerResult,
};
