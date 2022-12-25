const myRequest = require("https");

const getS3DataInfo = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "boatusersbucket.s3.amazonaws.com",
      path: "/MyLambda/buData.json.gz",
      headers: {
        Authorization:
          "AWS4-HMAC-SHA256 Credential=AKIAUWH7XUSKRJVKKJHU/20221225/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=452ac4a5fdfb53e0ea022f28fc6eb10d085ed6ccdb81e156580e04826da6d35c",
        "x-amz-date": "20221225T215249Z",
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
getS3DataInfo();
