const express = require('express');
const Model = require('./model');

var model = new Model();

const app = express.Router();

// Methods
app.post('/ping', (req, res) => {
    model.ping(
        test => res.status(test.status).send(test)
    );
});

app.post('/getState', (req, res) => {
    model.getState(
        req.body.ID,
        response => res.status(response.status).send(response)
    );
});

app.post('/createNewGame', (req, res) => {
    model.createNewGame(
        response => res.status(response.status).send(response)
    );
});

module.exports = app;
