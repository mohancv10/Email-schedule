const express = require("express");
const router = express.Router();

router.get("/", function(req, res){
    res.sendFile(global.basedir + "/express_project/index.html")
});