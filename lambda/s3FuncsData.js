const myRequest = require("https");
const { resolve } = require("path");

const getS3DataInfo = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "boatusersbucket.s3.amazonaws.com",
      path: "/MyLambda/buData.json.gz",
      headers: {
        Authorization:
          "AWS4-HMAC-SHA256 Credential=AKIAUWH7XUSKRJVKKJHU/20221225/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=a8602a358c1752ca35782d9f52543589d4e05cbd642f9666e40830523193a608",
        "x-amz-date": "20221225T221955Z",
        "Content-Type": "text/plain",
        "X-Amz-Content-Sha256":
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
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
        resolve(body.toString());
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error.message);
      });
    });

    req.end();
  });
};
const putS3DataInfo = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "PUT",
      hostname: "boatusersbucket.s3.amazonaws.com",
      path: "/MyLambda/buData.json.gz",
      headers: {
        Authorization:
          "AWS4-HMAC-SHA256 Credential=AKIAUWH7XUSKRJVKKJHU/20221225/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=d675651c788a8a3983d9f5a9d7d50a36cdf8f3f6e3e1bb459fb068cb1f4e8628",
        "x-amz-date": "20221225T222308Z",
        "Content-Type": "text/plain",
        "X-Amz-Content-Sha256":
          "beaead3198f7da1e70d03ab969765e0821b24fc913697e929e726aeaebf0eba3",
      },
      maxRedirects: 20,
    };

    var req = myRequest.request(options, function (res) {
      res.on("data", function (chunk) {
        console.log("res.on called");
      });

      res.on("end", function (chunk) {
        resolve(`Message Modified No Body`);
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error.message);
      });
    });

    var postData =
      '{\r\n    "newBuUser" : "BuNewUserAngy",\r\n    "newBuData" : "BuNewDataAngyInfo"\r\n}';

    req.write(postData);

    req.end();
  });
};
// Have to Update Date constantly and Signeture
getS3DataInfo();
//putS3DataInfo();
