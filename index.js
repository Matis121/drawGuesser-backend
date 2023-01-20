/*
 * Server Code
 *
 *
 */

require("dotenv").config("globalvar.env");

const port = process.env.PORT || 8888;

// set up  server
const express = require("express");
const cors = require("cors");
const app = express(); // Creating the express application, the app object denotes the express application
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } }); // socket
const socketlogicmodule = require("./socket/socketlogic");
const mongoconn = require("./database/mongoconn");
const socketlogic = socketlogicmodule.socketapp;

// database connection
mongoconn();

// Routers
const userRouter = require("./User/UserRouter");

//cors options
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

// middlewares
app.use(cors(corsOptions));
app.use(express.json());

io.on("connection", (socket) => {
  socketlogic(io, socket);
});

// const URL = `http://localhost:${port}/`;


server.listen(port, () => {
  console.log("Listening on port: " + port);
});

app.use("/user", userRouter);

app.use("/", (req, res) => {
  res.send("welcome to the server home page");
})
