const express = require("express");
const app = express();
const port = 3000;
app.use(express.static("public"));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});
//