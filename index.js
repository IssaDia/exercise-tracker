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



const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  log: [
    {
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 app.use(cors());

const path = require("path");
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.json({ message: "working" });
});

app.post("/api/users",async (req, res) => {
  const username = req.body.username;
  if (!username) {
   console.log("username's request not found")
  }
  else {
    let user = new User({ username, log :[] });
    await user.save()
    .then((result) => {res.json({result})})
    .catch((error) => console.log(error))
  }})

  app.get("/api/users", async (req, res) => {
    User.find()
    .then((result) => {
      res.json(result)
    })
    .catch((error) => console.log(error))
  })

  app.post("/api/users/:_id/exercises", async (req, res) => {
        const id = req.params._id;
         const {description,duration}  = req.body;
  
        User.findById({_id : id})
        .then(async (result) => {
           const date = new Date();
          
       
          await User.updateOne({_id: result._id}, {
            log : {
              description,
              duration,
              date: date
            }
           });
           
            res.json({
              username: result.username,
              count: result.log.length,
              _id: result._id,
              log: [
                {
                  description,
                  duration,
                  date,
                },
              ],
            });
        })
        .catch((error) => console.log(error))
       
  });

  app.get("/api/users/:id/logs", (req, res) => {
    const id = req.params.id;
    User.findById({_id : id})
    .then((result) => {
      res.json({logs : result.log})
    })
  })

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
