const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerCallBackInput) {
    return (
      Alexa.getRequestType(handlerCallBackInput.requestEnvelope) ===
      "LaunchRequest"
    );
  },
  handle(handlerCallBackInput) {
    return BoatSkillsResponseFunction(
      handlerCallBackInput,
      "Welcome to angelique new boat skills, you can say start boat users or start app or Help. Which would you like to try?"
    );
  },
};

const BoatSkillInitialIntentHandler = {
  canHandle(useInput) {
    return BoatSkillsRequestFunction(
      useInput,
      "IntentRequest",
      "BoatUsersStart"
    );
  },
  handle(useInput) {
    return BoatSkillsResponseFunction(useInput, "boat users skills is started");
  },
};
const BoatSkillInfoIntentHandler = {
  canHandle(useInput) {
    return BoatSkillsRequestFunction(
      useInput,
      "IntentRequest",
      "BoatUsersInfo"
    );
  },
  handle(useInput) {
    return BoatSkillsResponseFunction(useInput, "boat users skills is Info");
  },
};
const HelpIntentHandler = {
  canHandle(useInput) {
    return BoatSkillsRequestFunction(
      useInput,
      "IntentRequest",
      "AMAZON.HelpIntent"
    );
  },
  handle(useInput) {
    return BoatSkillsResponseFunction(
      useInput,
      "You can say start app or start boat skills! How can I help?"
    );
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerCallBackInput) {
    return (
      Alexa.getRequestType(handlerCallBackInput.requestEnvelope) ===
        "IntentRequest" &&
      (Alexa.getIntentName(handlerCallBackInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerCallBackInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerCallBackInput) {
    return BoatSkillsResponseFunction(handlerCallBackInput, "Goodbye");
  },
};
const BoatUserTurnOnSkillIntentHandler = {
  canHandle(useInput) {
    return BoatSkillsRequestFunction(
      useInput,
      "IntentRequest",
      "BUSwitchOneTurnOnSkill"
    );
  },
  handle(useInput) {
    return BoatSkillsResponseFunction(useInput, "Boat switch one is turned on");
  },
};
const BoatUserTurnOffSkillIntentHandler = {
  canHandle(useInput) {
    return BoatSkillsRequestFunction(
      useInput,
      "IntentRequest",
      "BUSwitchOneTurnOffSkill"
    );
  },
  handle(useInput) {
    return BoatSkillsResponseFunction(
      useInput,
      "Boat switch one is turned off"
    );
  },
};
const FallbackIntentHandler = {
  canHandle(handlerCallBackInput) {
    return BoatSkillsRequestFunction(
      handlerCallBackInput,
      "IntentRequest",
      "AMAZON.FallbackIntent"
    );
  },
  handle(handlerCallBackInput) {
    return BoatSkillsResponseFunction(
      handlerCallBackInput,
      "Sorry, Unrecognized command. Please try again."
    );
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerCallBackInput) {
    return (
      Alexa.getRequestType(handlerCallBackInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerCallBackInput) {
    console.log(
      `Session ended: ${JSON.stringify(handlerCallBackInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerCallBackInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};

const IntentReflectorHandler = {
  canHandle(handlerCallBackInput) {
    return (
      Alexa.getRequestType(handlerCallBackInput.requestEnvelope) ===
      "IntentRequest"
    );
  },
  handle(handlerCallBackInput) {
    const intentName = Alexa.getIntentName(
      handlerCallBackInput.requestEnvelope
    );
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerCallBackInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerCallBackInput, error) {
    return BoatSkillsResponseFunction(
      handlerCallBackInput,
      "Sorry, I had trouble doing what you asked. Please try again."
    );
  },
};
const BoatSkillsRequestFunction = (
  handlerInput,
  thisIntent,
  thisIntentName
) => {
  try {
    const getIntentRequest =
      Alexa.getRequestType(handlerInput.requestEnvelope) === `${thisIntent}`;
    const getBUStartRequest =
      Alexa.getIntentName(handlerInput.requestEnvelope) === `${thisIntentName}`;
    console.log(getIntentRequest + getBUStartRequest);
    return getIntentRequest && getBUStartRequest;
  } catch (e) {
    return console.log(e);
  }
};
const BoatSkillsResponseFunction = (handlerInput, thismessage) => {
  try {
    const speakOutput = `${thismessage}`;
    console.log(speakOutput);
    let displayAnswer = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
    return displayAnswer;
  } catch (e) {
    return console.log(e);
  }
};

const NotFoundIntentHandler = {
  canHandle(handlerCallBackInput) {
    const getIntentRequest =
      Alexa.getRequestType(handlerCallBackInput.requestEnvelope) ===
      "IntentRequest";
    const getBUStartRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "BoatUsersStart";
    const getBUTurnOnRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "BUSwitchOneTurnOnSkill";
    const getBUTurnOffRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "BUSwitchOneTurnOffSkill";
    const getBUInfoRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "BoatUsersInfo";
    const getFBRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "AMAZON.FallbackIntent";
    const getCancelRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "AMAZON.CancelIntent";
    const getStopRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "AMAZON.StopIntent";
    const getHelpRequest =
      Alexa.getIntentName(handlerCallBackInput.requestEnvelope) !==
      "AMAZON.HelpIntent";
    return (
      getIntentRequest &&
      getBUStartRequest &&
      getHelpRequest &&
      getStopRequest &&
      getCancelRequest &&
      getFBRequest &&
      getBUInfoRequest &&
      getBUTurnOnRequest &&
      getBUTurnOffRequest
    );
  },
  handle(handlerCallBackInput) {
    const speakOutput = "Not Found Skill";

    return handlerCallBackInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    NotFoundIntentHandler,
    BoatSkillInitialIntentHandler,
    BoatSkillInfoIntentHandler,
    BoatUserTurnOnSkillIntentHandler,
    BoatUserTurnOffSkillIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
