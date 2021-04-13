const { v4: uuidv4 } = require('uuid');
const GameState = require('./States/GameState.js');

const gameStates = {};

class Model {
    constructor() {}

    // Methods
    ping(call_back) {
        call_back({ ping: 'pong!' });
    }

    getState(ID, call_back) {
        if (gameStates[ID] !== null) {
            const THIS = this;

            clearInterval(gameStates[ID].lastUpdate);
            gameStates[ID].lastUpdate = setTimeout(() => {
                THIS.removeGameState(ID);
            }, 5000);

            const response = gameStates[ID];
            return call_back({
                'ID': ID,
                'gameState': response.gameState,
                'status': 200,
                'message': 'Everything is okay!'
            });
        }

        call_back({ 'status': 404, 'message': 'ID does not exist' });
    }

    createNewGame(call_back) {
        const ID = uuidv4();

        const gameState = new GameState(null, null, [], [], []);
        gameState.createNewGame();

        const tickInterval = setInterval(() => {
            gameState.tick();
        }, 0);

        const THIS = this;
        const lastUpdate = setTimeout(() => {
            THIS.removeGameState(ID);
        }, 5000);

        gameStates[ID] = {
            'gameState': gameState,
            'tickInterval': tickInterval,
            'lastUpdate': lastUpdate
        }

        const response = gameStates[ID];
        call_back({
            'ID': ID,
            'gameState': response.gameState,
            'status': 200,
            'message': 'Everything is okay!'
        });
    }

    removeGameState(ID) {
        delete gameStates[ID];
        let numberActive = Object.entries(gameStates).filter(state => state !== null).length;
        console.log('gameState: '+ID+' cleared, gameStates active: '+numberActive);
    }

}

module.exports = Model;
