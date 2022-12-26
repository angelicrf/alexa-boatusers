const { MongoClient } = require("mongodb");
//cmd : aws sts get-session-token
// replace values with process.env
const mongoUrl =
  "mongodb+srv://AKIAUWH7XUSKRJVKKJHU:bVJUeJri2SraO8/EqVc2LjfJuzYvNzvpRLpaZZpv@budatabase.larhnar.mongodb.net/?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&authMechanismProperties=AWS_SESSION_TOKEN:IQoJb3JpZ2luX2VjENT//////////wEaCXVzLWVhc3QtMSJGMEQCIEbffm74/+eZy0ccB7fKIXDblTuhpnfARNLJ1dwZ+/w7AiANb1mPUuL2vHDY2KcGB/lf/S5gZ77vOeDK/qpk/rttZirrAQgdEAQaDDMyMjY1ODg3MDQyMSIMf+CPXRTrQJwyN+wDKsgBH3SNNv1C8zeX/Wg+pXReYKtWEot23I0IhdMs9w884sGRBJehpeh/A+Ouob4z829z+BjEs+6hcMMGyqnxFQ3A/otyC2snDXCrUIeqwICMeBKDqTrU2Rf03ZCSWQKpSOST0afWuYn/5E5ZpmYYzTP8QHCRQPMuaJbbHgLNRL6U2sgvy08O8aA3FcSzTjkbQCzQ35Y+2521OZGBezkBkFz2gH+OSSCvLdCFPXB2uRPNIw2CJGtcZnI6GrK1zRbVKw5zvG1V2yVMFoQwtO2nnQY6mQF7S/cx+K55YtGtDSM7RljkDepgwCzqgkEcjjDnSVncn/IEkDuQmvF6M3kyD0lYq4CYmKfPIQfbFrtzSjC5uAckLkRx1xkDSMx1AKX/DxGuUsU0lyAVMXTar6QLkBJHJUNDYO3q6oH8SQ6berixqbvPw+uGFbreIzubs4O9aUHzOCvsRDP6jTB3ekn6maWFJ8/5y+K79GW7AQ8=";
const client = new MongoClient(mongoUrl);
const database = client.db("budb");
const buData = database.collection("bucollection");
/* const client = new MongoClient(process.env.MONGODB_URI, {
  auth: {
    username: "AKIAUWH7XUSKRJVKKJHU",
    password: "bVJUeJri2SraO8/EqVc2LjfJuzYvNzvpRLpaZZpv",
  },
  authSource: "$external",
  authMechanism: "MONGODB-AWS",
}); */

const buMdbFindData = () => {
  return new Promise(async (resolve, reject) => {
    try {
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
};
module.exports.handler = async () => {
  console.log("module called");
  let getMdbData = await buMdbFindData();
  return {
    statusCode: 200,
    mdbGetResult: getMdbData,
  };
  /*const databases = await client.db("admin").command({ listDatabases: 1 });*/
};
