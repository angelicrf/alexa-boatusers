const mnRequest = require("https");

const mongodbGetRequest = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws",
      path: "/?getData=mongoId",
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    var req = mnRequest.request(options, (res) => {
      var chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body.toString());
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    req.end();
  });
};
const mongodbPostRequest = (mnId) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      hostname: "rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws",
      path: "/?postData=insertData",
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    var req = mnRequest.request(options, (res) => {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", (chunk) => {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body.toString());
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    var postData = JSON.stringify({
      thisMnId: `${mnId}`,
    });

    req.write(postData);

    req.end();
  });
};
const mongodbPutRequest = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "PUT",
      hostname: "rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws",
      path: "/?putData=mongoData",
      headers: {
        "Content-Type": "application/json",
      },
      maxRedirects: 20,
    };

    var req = mnRequest.request(options, (res) => {
      var chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", (chunk) => {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body.toString());
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    var postData = JSON.stringify({
      UserData: "NewUserData",
    });

    req.write(postData);

    req.end();
  });
};

const mnDbFuncProcess = async () => {
  let getMnId = await mongodbGetRequest();
  let postmnData = await mongodbPostRequest("123456");
  let putMnData = await mongodbPutRequest();
};
mnDbFuncProcess();
module.exports = { mongodbGetRequest, mongodbPostRequest, mongodbPutRequest };
