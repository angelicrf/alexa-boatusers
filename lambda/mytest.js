const myRequest = require("https");
/* const myFech = require("node-fetch").default;
let url = "https://reqres.in/api/users";
const tryThisFunction = async () => {
  let response = await myFech(url);
  let commits = await response.json();
  console.log("result", commits[0].author.login);
}; */
const tryWithHttps = async () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: "Deven Rathore",
      age: 21,
    });

    const options = {
      hostname: "reqres.in",
      path: "/api/users",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = myRequest
      .request(options, (res) => {
        let data = "";

        console.log("Status Code:", res.statusCode);

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("Body: ", JSON.parse(data));
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });

    req.write(data);
    req.end();
  });
};

const getResult = async () => {
  let getresponse = await tryWithHttps();
};
getResult();
