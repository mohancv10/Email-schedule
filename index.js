global.basedir = __dirname;
//Libraries for coding
const express = require("express");
const http = require("http");
const mssql = require("mssql");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8315;
const { log } = require("util");
const body_parser = require("body-parser");
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

//importing email controller
var Emailcontroller = require("./Controller/EmailController.js")();

app.use("/email", Emailcontroller);


app.listen(port, function () {
    var datetime = new Date();
    var message = "Server runnning on Port:- " + port + "Started at :- " + datetime;
    console.log(message);
});

