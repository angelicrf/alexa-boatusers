const AWS = require("aws-sdk");
var credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;
const s3 = new AWS.S3({ region: "us-east-1" });

const query = "SELECT * from s3object";

const params = {
  Bucket: "boatusersbucket",
  Key: "MyLambda/buData.json.gz",
  InputSerialization: {
    JSON: {
      Type: "DOCUMENT",
    },
    CompressionType: "GZIP",
  },
  OutputSerialization: {
    JSON: {},
  },
  ExpressionType: "SQL",
  Expression: query,
};

s3.selectObjectContent(params)
  .promise()
  .then((res) => {
    let records = [];
    let stats = {};
    res.Payload.on("data", function (event) {
      if (event.Stats) {
        stats = event.Stats;
      }
      if (event.Records) {
        if (event.Records.Payload) {
          let data = event.Records.Payload.toString();
          records = [
            ...records,
            ...data
              .split("\n")
              .filter((l) => l)
              .map((e) => {
                return {
                  last_name: e.split(",")[0],
                  birth_year: e.split(",")[1],
                };
              }),
          ];
        }
      }
    });
    res.Payload.on("error", function (err) {
      console.log("err", err);
    });
    res.Payload.on("end", function () {
      console.log(records);
      console.log(stats);
    });
  });
