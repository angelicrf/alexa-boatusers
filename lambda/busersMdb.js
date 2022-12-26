const mdbUrl =
  "mongodb+srv://boatusersmdb:busers123456@budatabase.larhnar.mongodb.net/budb?retryWrites=true&w=majority";
const { MongoClient } = require("mongodb");

const uri = mdbUrl;

const client = new MongoClient(uri);

const buMdbFindData = async () => {
  try {
    const database = client.db("budb");
    const buData = database.collection("bucollection");

    const query = { title: "buTitle" };
    const buFindData = await buData.findOne(query);

    console.log(buFindData);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
};

buMdbFindData();
