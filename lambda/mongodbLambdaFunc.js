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
//cmd aws sts assume-role --role-arn arn:aws:iam::322658870421:role/boatusers-mdb-cloudproviders-role --role-session-name "RoleSession2" --profile boatusers
//replace values with process.env
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
      console.log(`MongoClient is ${mongoClient}`);
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
  let getDataById = await buMdbFindData(getClient);
  return getDataById;
};

//lambda func route Post_Url : https://rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws/?postData=insertData
//lambda func route Get_Url : https://rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws/?getData=mongoId
//lambda func route Get_Url_2 : https://rakwapy6mvknwocacnb6bekjv40tymvc.lambda-url.us-east-1.on.aws/?getData=mongoUserData

exports.handler = async (event, context, callback) => {
  let requestType = JSON.stringify(event.requestContext.http.method);
  let strValue = requestType.replace(/^"(.+(?="$))"$/, "$1");

  if (strValue == "GET") {
    let paramValue = JSON.stringify(
      event.queryStringParameters.getData
    ).replace(/^"(.+(?="$))"$/, "$1");

    if (paramValue == "mongoId") {
      // run get id mongodb func
      //let getMdbData = await mongodbResultProcess();
      return JSON.stringify({
        statusCode: 200,
        mdbGetResult: `Get passed with param ${paramValue}`,
      });
    } else if (paramValue == "mongoUserData") {
      // run get user info mongodb func
      return JSON.stringify({
        statusCode: 200,
        mdbGetResult: `Get passed with param ${paramValue}`,
      });
    }
  } else if (strValue == "POST") {
    let postParamValue = JSON.stringify(
      event.queryStringParameters.postData
    ).replace(/^"(.+(?="$))"$/, "$1");

    if (postParamValue == "insertData") {
      // run insert data mongodb func
      return JSON.stringify({
        statusCode: 200,
        mdbPostResult: `Post passed with param ${postParamValue}`,
      });
    }
  } else if (strValue == "PUT") {
    //putData=mongoData
    let putParamValue = JSON.stringify(
      event.queryStringParameters.putData
    ).replace(/^"(.+(?="$))"$/, "$1");

    if (putParamValue == "mongoData") {
      // run put data mongodb func
      return JSON.stringify({
        statusCode: 200,
        mdbPutResult: `Put passed with param ${putParamValue}`,
      });
    }
  }
};
