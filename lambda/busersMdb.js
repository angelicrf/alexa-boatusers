const mdbUrl =
  "mongodb+srv://boatusersmdb:busers123456@budatabase.larhnar.mongodb.net/budb?retryWrites=true&w=majority";
const { MongoClient } = require("mongodb");
var ObjectId = require("mongodb").ObjectId;

const uri = mdbUrl;

const client = new MongoClient(uri);
const database = client.db("budb");
const buData = database.collection("bucollection");

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
    // finally {
    // await client.close();
    //}
  });
};
const buMdbInsertData = (thisTitle, thisContent) => {
  return new Promise(async (resolve, reject) => {
    try {
      let doc = {
        title: `${thisTitle}`,
        content: `${thisContent}`,
      };
      const result = await buData.insertOne(doc);
      console.log(
        `A Bu new Data was inserted with the _id: ${result.insertedId}`
      );

      resolve(result.insertedId);
    } catch (err) {
      console.log(err);
      reject(err);
    }
    // finally {
    // await client.close();
    //}
  });
};
const buMdbUpdataData = (thisId, thisTitle) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = { _id: ObjectId(`${thisId}`) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: `a new Bu Tile: ${thisTitle} ${Math.random()}`,
        },
      };
      const result = await buData.updateOne(filter, updateDoc, options);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      resolve(result.modifiedCount);
    } catch (err) {
      console.log(err);
      reject(err);
    } finally {
      await client.close();
    }
  });
};
const runMdbProcess = async () => {
  let getId = await buMdbFindData();
  console.log(`getData is : ${getId}`);
  //let addData = await buMdbInsertData("angeliqueBU", "buDataInfo");
  //console.log(`dataAdded ${addData}`);
  let updateData = await buMdbUpdataData(getId, "orcaIsland");
  console.log(`updatedData ${updateData}`);
};
runMdbProcess();
