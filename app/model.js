const GameState = require('./States/GameState.js');

var gameStates = [];

class Model {
    constructor() {
        for (var i = 0; i < 100; i++) {
            gameStates[i] = null;
        }
    }

    // Methods
    ping(call_back) {
        call_back({ping: 'pong!'});
    }

    getState(ID, call_back) {
        if (gameStates[ID] != null) {
            var THIS = this;

            clearInterval(gameStates[ID].lastUpdate);
            gameStates[ID].lastUpdate = setTimeout(function() {
                THIS.removeGameState(ID);
            }, 5000);

            var response = gameStates[ID];
            return call_back(
                {
                    'ID': ID,
                    'gameState': response.gameState,
                    'status': 100,
                    'message': 'Everything is okay!'
                }
            );
        }

        call_back( {'status': 300, 'message': 'ID is not active'} );
    }

    createNewGame(call_back) {
        var ID = null;
        for (var i = 0; i < gameStates.length; i++) {
            if (gameStates[i] == null) {
                ID = i;
                break;
            }
        }
        if (ID == null)
            return call_back( {'status': 300, 'message': 'Server is Full'} );

        var gameState = new GameState(null, null, [], [], []);
        gameState.createNewGame();

        var tickInterval = setInterval(function() {
            gameState.tick();
        }, 0);

        var THIS = this;
        var lastUpdate = setTimeout(function() {
            THIS.removeGameState(ID);
        }, 5000);

        gameStates[ID] = {
            'gameState': gameState,
            'tickInterval': tickInterval,
            'lastUpdate': lastUpdate
        }

        var response = gameStates[ID];
        call_back(
            {
                'ID': ID,
                'gameState': response.gameState,
                'status': 100,
                'message': 'Everything is okay!'
            }
        );
    }

    removeGameState(ID) {
        gameStates[ID] = null;

        var active = 0;
        for (var i = 0; i < gameStates.length; i++) {
            if (gameStates[i] != null) {
                active++;
            }
        }

        console.log('gameState: '+ID+' cleared, gameStates active: '+active);
    }

}

module.exports = Model;
