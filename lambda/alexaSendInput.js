const myRequest = require("https");
const open = require("open");

const generateUrlCode = () => {
  let thisBody = JSON.stringify({
    response_type: "device_code",
    client_id: "amzn1.application-oa2-client.45e216f2fc214eec95a17fd39a95146c",
    scope:
      "alexa::ask:skills:readwrite alexa::ask:models:readwrite alexa::ask:skills:test",
  });
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "api.amazon.com",
      path: "/auth/o2/create/codepair",
      headers: {
        "Content-Type": "application/json",
      },
    };

    var req = myRequest.request(options, (res) => {
      let data = "";
      let userInfo = {
        user_code: "",
        user_device: "",
      };
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let responseDCode = JSON.parse(data).device_code;
        let responseUCode = JSON.parse(data).user_code;

        userInfo.user_code = responseDCode;
        userInfo.user_device = responseUCode;

        console.log(
          `device code: ${responseDCode} and userCode: ${responseUCode}`
        );
        if (JSON.parse(data).error_description == null) {
          let thisUrl = "https://www.amazon.com/a/code";
          // add data into s3
          open(thisUrl);
          resolve(userInfo);
        }
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    let postData = thisBody;

    req.write(postData);

    req.end();
  });
};
const generateAccessToken = (getDevice) => {
  //Have to activate code before generating the access token otherwise we get pending error
  const aws_grant_type = "device_code";
  let mdfCode = getDevice.user_code;
  let mdfUser = getDevice.user_device;
  console.log(`UserInfo ${getDevice.user_device}`);

  let thisBody = JSON.stringify({
    user_code: `${mdfUser}`,
    device_code: `${mdfCode}`,
    grant_type: aws_grant_type,
  });

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

        if (JSON.parse(data).error_description == null) {
          resolve(responseAToken);
        }
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    let postData = thisBody;

    req.write(postData);

    req.end();
  });
};
const postAlexaIntent = (thisAToken, thisIntent) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "api.amazonalexa.com",
      path: "/v2/skills/amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543/stages/development/invocations",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${thisAToken}`,
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

    let getDate = new Date().toISOString();
    let postData = JSON.stringify({
      endpointRegion: "default",
      skillRequest: {
        body: {
          version: "1.0",
          session: {
            new: true,
            sessionId:
              "amzn1.echo-api.session.3d16dec0-c375-44f1-a691-7bd4bf1693bc",
            application: {
              applicationId:
                "amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543",
            },
            attributes: {},
            user: {
              userId: "amzn1.account.AF4VTXJLRLAEYMCMNVC2O4XMGCKQ",
            },
          },
          context: {
            System: {
              application: {
                applicationId:
                  "amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543",
              },
              user: {
                userId: "amzn1.account.AF4VTXJLRLAEYMCMNVC2O4XMGCKQ",
              },
            },
          },
          request: {
            type: "IntentRequest",
            requestId:
              "amzn1.echo-api.request.f95bd806-a559-436a-9147-54b8a4017b4f",
            timestamp: `${getDate}`,
            locale: "en-US",
            intent: {
              name: `${thisIntent}`,
            },
          },
        },
      },
    });

    req.write(postData);

    req.end();
  });
};
const startPostInputProcess = async () => {
  let getUInfo = await generateUrlCode();
  let getAToken = await generateAccessToken(getUInfo);
  //await postAlexaIntent(getAToken, "AMAZON.HelpIntent");
};
startPostInputProcess();
module.exports = { startPostInputProcess };
