const { MongoClient } = require("mongodb");
const { STS } = require("aws-sdk");
const sts = new STS();
let client = null;
//cmd : aws sts get-session-token
//cmd atlas cloudProviders accessRoles aws create --projectId 63a9c2c0a6942d034b8beef6
//make sure to add conditions to IAM specific role's trust relationships before authorizing arn
//"Condition": {
//  "StringEquals": {
//    "sts:ExternalId": "3f8669c2-8b51-4868-bfde-778d246e8631"
//  }
//}
//cmd atlas cloudProviders accessRoles aws authorize arn:aws:iam::322658870421:role/lambda_exec_BoatUsersLmbdFunc --projectId 63a9c2c0a6942d034b8beef6
//remove the conditions and save IAM role before running sts assume-role
//aws sts assume-role --role-arn arn:aws:iam::322658870421:role/boatusers-mdb-cloudproviders-role --role-session-name "RoleSession2" --profile boatusers
//replace values with process.env

var username = encodeURIComponent("ASIAUWH7XUSKVL2BKTE5");
var password = encodeURIComponent("b6AZl5IO+rvM68ioqVt57ETUn+ghJDL/DcOMC8I6");
var thisSessionToken = encodeURIComponent(
  "IQoJb3JpZ2luX2VjEAEaCXVzLWVhc3QtMSJHMEUCIQCQm4EWcaawW5nH6f4xta6A5bQbz9v7KZDtPvD75UkMQgIgfIFMHdUR/8K4Gjvu+2Je/rTYrh6kVHZ9fSzq4rUW774qmQIIShAEGgwzMjI2NTg4NzA0MjEiDIXiluWi0m6NWHDKYCr2AYe64xfHiQzLLgRT8e/OfscyoBerZmUe54RtV6m7N8W2rsPoi5ZK4sjFzG+Tod+nj7v4Zm8pW5cjhYUDgvDR5SE2GgmJh3o6UCwBnWW6tnkhQ9HTq7gGHIQ7+lwtkbGUlKpSWJ8FrXMXExvwvX2895SbVLcjxZ0dCFWVSG33Dp8O0WmdMUEVdlhM0YVaOyEL8ihRF8LQxgQTbmhVmss+WPCjHscJmaCK3wP6WazkpAbejHq2Fi65lUKL/n16BDl/okpJAzuQ4hsAJ+4v4nnZFpGIgDWZEARDk6SdpRp6hc4bXRoAUBOnHMTGknQWPB7eIYiBJV+ArzDm6rGdBjqdAWLJqFCZPOHfhnyPHKP2+fuhCAWNHbPkgFTzFMUGZTO42BEHRQW6yLs1DT59ZE/DIpGgdbJzNkJkYBGHTn8OmfdCNjZIH0psCs76ibPYcMbqtBCdBRoJFIvrvwHjPR1BDxKluOEfMECJGb/9o8hOgfSE0MJ6ZQf9YpU8wihZE+ZTLluKcQrynHP6sucm+z0hVlNvAw5RgZsm0L8JKS0="
);
const mongoUrl = `mongodb+srv://ASIAUWH7XUSKVL2BKTE5:${password}@budatabase.larhnar.mongodb.net/budb?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&authMechanismProperties=AWS_SESSION_TOKEN:${thisSessionToken}`;
const getMongoClientWithIAMRole = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (client) {
        console.log("Returning mongo client in cache");
        resolve(client);
      }
      const { Credentials } = await sts
        .assumeRole({
          RoleArn:
            "arn:aws:iam::322658870421:role/boatusers-mdb-cloudproviders-role",
          RoleSessionName: "AccessMongoDB",
        })
        .promise();

      if (!Credentials) {
        reject("Failed to assume mongo db IAM role");
      }
      const CLUSTER_NAME = "budatabase";
      const { AccessKeyId, SessionToken, SecretAccessKey } = Credentials;
      console.log(JSON.stringify(Credentials));
      const encodedSecretKey = encodeURIComponent(SecretAccessKey);
      //const encodedSessionToken = encodeURIComponent(SessionToken);
      const combo = `${AccessKeyId}:${encodedSecretKey}`;
      const url = new URL(
        `mongodb+srv://${combo}@${CLUSTER_NAME}.larhnar.mongodb.net`
      );
      url.searchParams.set("authSource", "$external");
      url.searchParams.set(
        "authMechanismProperties",
        `AWS_SESSION_TOKEN:${SessionToken}`
      );
      url.searchParams.set("w", "majority");
      url.searchParams.set("retryWrites", "true");
      url.searchParams.set("authMechanism", "MONGODB-AWS");

      const mongoClient = new MongoClient(url.toString());
      client = await mongoClient.connect();
      if (client !== null) {
        console.log(
          `Successfully connected to mongo db, returning mongo client}`
        );
        resolve(client);
      } else {
        reject("Client Not Found");
      }
    } catch (err) {
      reject(err);
    }
  });
};
const buMdbFindData = (thisClient) => {
  if (thisClient !== null) {
    return new Promise(async (resolve, reject) => {
      try {
        let database = thisClient.db("budb");
        const buData = database.collection("bucollection");
        const query = {
          title: "a new Bu Tile: mercerIsland 0.5590648127577209",
        };
        const buFindData = await buData.findOne(query);
        let getResult = buFindData._id;
        console.log(getResult);
        resolve(getResult);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
};
const mongodbResultProcess = async () => {
  let getClient = await getMongoClientWithIAMRole();
  await buMdbFindData(getClient);
};
mongodbResultProcess();
module.exports.handler = async () => {
  console.log("module called");
  let getMdbData = await buMdbFindData();
  return {
    statusCode: 200,
    mdbGetResult: getMdbData,
  };
  /*const databases = await client.db("admin").command({ listDatabases: 1 });*/
};
