const AWS = require("aws-sdk");
var credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;
const s3 = new AWS.S3({ region: "us-east-1" });

const getObjectContent = () => {
  const query = "SELECT * from s3object";

  const params = {
    Bucket: "boatusersbucket",
    Key: "MyLambda/buData.json.gz",
    InputSerialization: {
      JSON: {
        Type: "DOCUMENT",
      },
      // CompressionType: "GZIP",
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
              {
                buUser: data.split("\n")[0],
                buInfo: data.split("\n")[1],
              },
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
};
const putS3BucketObject = () => {
  var params = {
    Body: '{"buName": "Angy"}{"buData" : "thisData"}',
    Bucket: "boatusersbucket",
    Key: "MyLambda/buData.json.gz",
  };
  s3.putObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};
const gets3Data = async () => {
  var params = {
    Bucket: "boatusersbucket",
    Key: "MyLambda/buData.json.gz",
    ResponseContentType: "application/json",
  };
  try {
    s3.getObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else {
        //let holdData = [];
        //holdData.push({ userData: data.Body.toString().split("}")[0] });
        //holdData.push({ BoatData: data.Body.toString().split("}")[1] });
        console.log(
          data.Body.toString()
            .split(/{([^}]+)}/g)
            .filter((e) => e)
        );
      }
    });
  } catch (err) {
    console.log("Error", err);
  }
};
//putS3BucketObject();
//getObjectContent();
gets3Data();
