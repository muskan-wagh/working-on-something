const express = require("express");

const monitor = require("../sdk/src");

const app = express();

app.use(
  monitor({
    apiKey: "test-key",
    serverUrl: "http://localhost:5000",
  }),
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/users", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Muskan",
    },
  ]);
});

app.listen(3000, () => {
  console.log("Test app running on port 3000");
});
