const loginWithAmazon = () => {
  global.window.onAmazonLoginReady = function () {
    amazon.Login.setClientId(
      "amzn1.application-oa2-client.8e364cf34cb649508a1746e26a4429d4"
    );
  };
  (function (d) {
    var a = d.createElement("script");
    a.type = "text/javascript";
    a.async = true;
    a.id = "amazon-login-sdk";
    a.src = "https://assets.loginwithamazon.com/sdk/na/login1.js";
    d.getElementById("amazon-root").appendChild(a);
  })(document);
};
loginWithAmazon();
