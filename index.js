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
        username : String,
        description: {
          type: String,
          required: true,
        },
        date: {
          type: String
          
        },
        duration: {
          type: Number,
          required: true,
        },
}, { versionKey: false }
);


const logSchema = new Schema({
  username : String,
  count: Number,
  log : []
})

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    // log: [exerciseSchema],
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
const Log = mongoose.model("Log", logSchema );



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 app.use(cors());

const path = require("path");
const { request } = require("http");
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
 app.use(express.static(path.join(__dirname, "/public")));
});

app.post("/api/users",async (req, res) => {
 
    let user = new User({ username : req.body.username });
    await user.save()
    .then((result) => {res.json({ username: result.username, _id: result._id });})
    .catch((error) => console.log(error))
  })

  app.get("/api/users", async (req, res) => {
    User.find()
    .then((result) => {
      res.json(
        result.map((item) => ({
          username: item.username,
          _id: item._id,
        }))
      );
    })
    .catch((error) => console.log(error))
  })

  app.post("/api/users/:_id/exercises", async (req, res) => {
        const id = req.params._id;

         const {description,duration, date}  = req.body;

        
          if (date === "" || date === "Invalid Date") {
            date = new Date().toISOString().substring(0, 10);
          }
         let exercise =  new Exercise({
           description : description,
           duration : parseInt(duration),
           date : date,
           _id : id
         })
         exercise.save();

        User.findByIdAndUpdate( {_id : id}, 
          {$push: {log :exercise}}
         )
        .then(async (result) => {
          Exercise.findOne({ _id: id }).then((data) => {
            console.log("data", data, "result", result);
            res.json({
              _id: result._id,
              username: result.username,
              date: data.date,
              duration: data.duration,
              description: data.description,
            });
          });
          // const logs = await result.log.map((log) => {
          //   return {
          //     description: log.description,
          //     duration: log.duration,
          //     date: new Date(log.date).toDateString(),
          //   };
          // })
          
          //  res.json({
          //    username: result.username,
          //    count: result.log.length,
          //    _id : result._id,
          //    log: exercise
          //  });   
            })
        .catch((error) => console.log(error))
       
  });

  app.get("/api/users/:_id/logs", async (req, res) => {
    const id = req.params._id;
   
    User.findOne({ _id: id })
      .then(async (result) => {
        const logs = await result.log.map((log) => {
          return {
            description: log.description,
            duration: log.duration,
            date: new Date(log.date).toDateString(),
          };
        });
        
        res.json({
          username: result.username,
          count: result.log.length,
          _id: result._id,
         log: logs,
        });
       
      })
      .catch((error) => console.log(error));
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
