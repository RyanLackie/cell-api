const GameState = require('./States/GameState.js');

const gameStates = [];

class Model {
    constructor() {
        for (var i = 0; i < 100; i++) {
            gameStates[i] = null;
        }
    }

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
        let ID = null;
        for (var i = 0; i < gameStates.length; i++) {
            if (gameStates[i] === null) {
                ID = i;
                break;
            }
        }
        if (ID === null) {
            return call_back({ 'status': 403, 'message': 'Server is Full' });
        }

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
        gameStates[ID] = null;
        let numberActive = gameStates.filter(state => state !== null).length;
        console.log('gameState: '+ID+' cleared, gameStates active: '+numberActive);
    }

}

module.exports = Model;
