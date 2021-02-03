const express = require('express');
const router = express.Router();
const sql = require("mssql");
const conn = require("../db_config/connection")();
const nodemailer =  require("nodemailer");
const cron = require("node-cron");
const { log } = require("util");
const { send } = require('process');

var routey = () => 
{
    //To LIST the total No of emails in table
    router.route("/list")
        .get((req, res)=>{
            conn.connect().then(()=> 
            {
                const sqlQuery = "SELECT * FROM Emails";
                var request = new sql.Request(conn);
                request.query(sqlQuery)
                .then((recordset)=>
                {
                    res.json(recordset.recordset);
                    conn.close();
                })
                .catch((err)=> {
                    conn.close();
                    res.status(400).send("Error while Selecting data"+ err);
                });
            })
            .catch((err) => {
                conn.close();
                res.status(400).send("Error Occured" + err);
            })
        });

     //To CREATE a new email
    router.route("/create")
        .post((req,res)=>{
            conn.connect().then(() => {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(() => {
                    var request = new sql.Request(transaction);
                    request.input("from", sql.VarChar(100), req.body.from)
                    request.input("to", sql.VarChar(100), req.body.to)
                    request.input("subject", sql.VarChar(100), req.body.subject)
                    request.input("message", sql.Text, req.body.message)
                    request.input("flag", sql.SmallInt, req.body.flag)
                    request.input("is_schedule", sql.Bit, req.body.is_schedule)
                    request.input("datetime", sql.VarChar(100), req.body.datetime)
                    request.execute("SP_EmailInput").then(() => {
                        transaction.commit().then((recordSet) => {
                            conn.close();
                            res.status(200).send(req.body);
                        }).catch((err) =>  {
                            conn.close();
                            res.status(400).send("Error while inserting data"+ err);
                        });
                    }).catch((err) => {
                        conn.close();
                        res.status(400).send("Error while Commiting data" + err);
                    });
                })
            }).catch((err) => {
                conn.close();
                res.status(400).send("Connection Error" + err);
            });
        });

        //To UPDATE email
        router.route("/update")
        .put((req, res)=>{
            var _productID = req.query.id;
            conn.connect().then(function () {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(() => {
                    var request = new sql.Request(transaction);
                    request.input("id", sql.Int, _productID)
                    request.input("from", sql.VarChar(100), req.body.from)
                    request.input("to", sql.VarChar(100), req.body.to)
                    request.input("subject", sql.VarChar(100), req.body.subject)
                    request.input("message", sql.Text, req.body.message)
                    request.input("flag", sql.SmallInt, req.body.flag)
                    request.input("is_schedule", sql.Bit, req.body.is_schedule)
                    request.input("datetime", sql.VarChar(100), req.body.datetime)
                    request.execute("SP_EmailIUpdate").then(() => {
                        transaction.commit().then((recordSet) =>  {
                            conn.close();
                            res.status(200).send({"data": "Email Updated"});
                        }).catch((err) => {
                            conn.close();
                            res.status(400).send("Error while Commiting or Updating" + err);});
                    }).catch((err) => {
                        conn.close();
                        res.status(400).send("Error while Executing Procedure" + err);});
                }).catch((err) => {
                    conn.close();
                    res.status(400).send("Error while Transaction" + err);
                });
            })
        })

        //To DELETE email
        router.route("/delete")
        .delete((req, res)=>{
            var _productID = req.query.id;
            conn.connect().then(function () {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(() => {
                    var request = new sql.Request(transaction);
                    request.input("id", sql.Int, _productID)
                    request.execute("SP_EmailIDelete").then(() => {
                        transaction.commit().then((recordSet) =>  {
                            conn.close();
                            res.status(200).send({"data": "Email Deleted"});
                        }).catch((err) => {
                            conn.close();
                            res.status(400).send("Error while Commiting or Updating" + err);});
                    }).catch((err) => {
                        conn.close();
                        res.status(400).send("Error while Executing Procedure" + err);});
                }).catch((err) => {
                    conn.close();
                    res.status(400).send("Error while Transaction" + err);
                });
            })
        });

        //To LIST UNSENT Email // 0 ==> unsent, 1 ==> sent, 2==> failed
        router.route("/unsent")
        .get((req, res)=>{
            conn.connect().then(()=> 
            {
                const sqlQuery = "SELECT * FROM Emails where flag = 0";
                var request = new sql.Request(conn);
                request.query(sqlQuery)
                .then((recordset)=>
                {
                    res.json(recordset.recordset);
                    conn.close();
                })
                .catch((err)=> {
                    conn.close();
                    res.status(400).send("Error while Selecting data"+ err);
                });
            })
            .catch((err) => {
                conn.close();
                res.status(400).send("Error Occured" + err);
            })
        });

        router.route("/schedule_email")
        .get((req, res)=>{
            conn.connect().then(()=> 
            {
                const sqlQuery = "SELECT * FROM Emails where is_schedule = 1 and flag = 0";
                var request = new sql.Request(conn);
                request.query(sqlQuery)
                .then((recordset)=>
                {
                    recordset.recordset.map((item)=>{
                        const sendmail = {
                            from: item.from,
                            to: item.to,
                            subject: item.subject,
                            text: item.message
                        };
                        //using node mailer to send mails
                        const transport = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true, 
                            auth: {
                                user: "mohancv10",
                                pass: "xxxxxxxxxx" 
                             }
                        });
                        cron.schedule(" 1-5 * * * *", ()=>{
                            transport.sendMail(sendmail, (err, info)=>{
                                if(err) {
                                    log(err);
                                } else {
                                    log("mail send"+ info.response);
                                }
                            },{
                                scheduled: true,
                                timezone: "india/newdelhi "
                            }
                            );
                        });
                    })
                    res.json({"message": "Mail send"});
                  
                    conn.close();
                })
                .catch((err)=> {
                    conn.close();
                    res.status(400).send("Error while Selecting data"+ err);
                });
            })
            .catch((err) => {
                conn.close();
                res.status(400).send("Error Occured" + err);
            })
        });
    return router;
};


module.exports = routey;