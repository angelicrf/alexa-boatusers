const myrequest = require("https");
const puppeteer = require("puppeteer");
let nIntervId;
let isStep3Started = false;
//inside fetch get then
const resetInterval = () => {
  clearInterval(nIntervId);
  nIntervId = null;
};

const getParamUrl = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "www.amazon.com",
      path: "/a/code?language=en_US&hide_nav_menu=true&cbl-status=successfully_authorized_user_code",
      maxRedirects: 20,
    };

    var req = https.request(options, function (res) {
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

    req.end();
  });
};
const generateAlexaCode = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "api.amazon.com",
      path: "/auth/o2/create/codepair",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          'session-id=146-2807199-6247456; session-id-time=2302536628l; session-token="DUdHarvEESwe+WTdh5IjWEneQi7Re/0uKyKw6eh6wDA1nt1+aDfINQLFybtUGOzls4l9tXOyYurH32Zs6C1he3NvVIoYxmy5IptDVKyYdNitrgbwLLvnuaDk0CMqQ9JXPrk72SLAka3sGDPDRAEHYYG2McGyKIzQH+B5TFNnrbx7Zip3Gwoevaqp4MoxQXKsmTKOLAH61cRR1vn8YOoLtwk0qXpDzKnl9vfVnJ6h170="; ubid-main=135-1582778-9845303',
      },
      maxRedirects: 20,
    };

    var req = myrequest.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        resolve(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });

    var postData = JSON.stringify({
      response_type: "device_code",
      client_id:
        "amzn1.application-oa2-client.45e216f2fc214eec95a17fd39a95146c",
      scope:
        "alexa::ask:skills:readwrite alexa::ask:models:readwrite alexa::ask:skills:test",
    });

    req.write(postData);

    req.end();
  });
};
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const generateAlexaAToken = async (userCode) => {
  console.log(userCode);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
    //ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.goto(`https://www.amazon.com/a/code?myCode=${userCode}`);

  return new Promise((resolve, reject) => {
    nIntervId = setInterval(async () => {
      const url = await page.url();
      if (url == `https://www.amazon.com/a/code?myCode=${userCode}`) {
        resetInterval();
        const textInputSelector = "#cbl-registration-field";
        const buttonSelector = "#cbl-continue-button";
        await page.waitForSelector(textInputSelector);
        await sleep(4000);
        await page.$eval(
          textInputSelector,
          (el, userCode, foo) => {
            console.log("Inside Eval");
            return (el.value = userCode);
          },
          userCode,
          "BuFoo"
        );
        await page.waitForSelector(buttonSelector);
        await sleep(4000);
        await page.click(buttonSelector);
        await sleep(5000);
        const newUrl = await page.url();
        if (
          newUrl.toString().split("?")[0] ==
          "https://na.account.amazon.com/ap/oa"
        ) {
          await page.$eval("input[name=consentApproved]", (el) => el.click());
          await sleep(5000);
          await browser.close();
          isStep3Started = true;
          resolve(isStep3Started);
        }
      }
    }, 1000);
  });
};
const generateAlexaATokenFromCode = (userCode, deviceCode) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "api.amazon.com",
      path: "/auth/o2/token",
      headers: {
        "Content-Type": "application/json",
        Cookie:
          'session-id=146-2807199-6247456; session-id-time=2302536628l; session-token="DUdHarvEESwe+WTdh5IjWEneQi7Re/0uKyKw6eh6wDA1nt1+aDfINQLFybtUGOzls4l9tXOyYurH32Zs6C1he3NvVIoYxmy5IptDVKyYdNitrgbwLLvnuaDk0CMqQ9JXPrk72SLAka3sGDPDRAEHYYG2McGyKIzQH+B5TFNnrbx7Zip3Gwoevaqp4MoxQXKsmTKOLAH61cRR1vn8YOoLtwk0qXpDzKnl9vfVnJ6h170="; ubid-main=135-1582778-9845303',
      },
      maxRedirects: 20,
    };

    var req = myrequest.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(JSON.parse(body.toString()).access_token);
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });

    var postData = JSON.stringify({
      user_code: `${userCode}`,
      device_code: `${deviceCode}`,
      grant_type: "device_code",
    });

    req.write(postData);

    req.end();
  });
};
const onclickAToken = async () => {
  return new Promise(async (resolve, reject) => {
    let getData = await generateAlexaCode();
    let userCode = JSON.parse(getData).user_code;
    let deviceCode = JSON.parse(getData).device_code;
    let getValueData = await generateAlexaAToken(userCode);
    //typeof nIntervId === "undefined" &&
    if (getValueData) {
      console.log(`getDataValue ${getValueData}`);
      let getAToken = await generateAlexaATokenFromCode(userCode, deviceCode);
      resolve(getAToken);
    }
  });
};
onclickAToken();
module.exports = { onclickAToken };
