module.exports = thisPayload = {
  endpoints: [
    {
      endpointId: "my-shelly-switch-01",
      manufacturerName: "Shelly",
      friendlyName: "client shelly switch",
      description: "Shelly Smart Plug",
      displayCategories: ["SWITCH"],
      additionalAttributes: {
        manufacturer: "Alterco Robotics",
        model: "Shelly Plug Model",
        serialNumber: "083af200732c",
        firmwareVersion: "20221024-141933/0.11.4-ga1906a2",
        softwareVersion: "1.036",
        customIdentifier: "Shelly smart plug custom ID",
      },
      cookie: {
        key1: "arbitrary key/value pairs for skill to reference this endpoint.",
        key2: "There can be multiple entries",
        key3: "but they should only be used for reference purposes.",
        key4: "This is not a suitable place to maintain current endpoint state.",
      },
      capabilities: [
        {
          interface: "Alexa.PowerController",
          version: "3",
          type: "AlexaInterface",
          properties: {
            supported: [
              {
                name: "powerState",
              },
            ],
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
