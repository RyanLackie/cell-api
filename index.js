require('dotenv').config();
const express = require('express');

const app = express();

// app.use settings
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/", express.static(__dirname + "/../dist/"));


// Methods for App
const controller = require('./app/controller');
app.use('/app', controller);


// Server settings
const host = process.env.SERVER_HOST;
const port = process.env.SERVER_PORT;

// Port listen and message
app.listen(port);
// eslint-disable-next-line no-console
console.log(`listening on: http://${host}:${port}`);
