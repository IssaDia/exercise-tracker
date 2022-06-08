const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;

const dotenv = require("dotenv");

dotenv.config()

const mongodb = require("mongodb");
const mongoose = require("mongoose");

const url = process.env.MONGO_URL

mongoose.connect(url, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});

const userSchema = new Schema({
  username : String,

})

const logSchema = new Schema({
  username : String,
  count: Number,
  log: [{
    description : String,
    duration : Number,
    date: Date
  }]
})

const Exercise = mongoose.model("Exercise", exerciseSchema);
const User = mongoose.model("Student", userSchema);
const Log = mongoose.model("Log", logSchema);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 app.use(cors());

const path = require("path");
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.json({ message: "working" });
});

app.post("/api/users",async (req, res) => {
  const body = req.body.username;
  if (!body) {
   console.log("body's request not found")
  }
  else {
     await User.save({ 
       username : body.username
     });
  }})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
