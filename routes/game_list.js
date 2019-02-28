const Game = require('models/game').Game;
const HttpError = require('error').HttpError;
const log = require('libs/log')(module);

exports.get = (req, res, next) => {
    const time = (a, b, c, d) => {
        switch(d){
            case 0: return (new Date)-a
            break;
            case 1: return (new Date)-b
            break;
            case 2: return c-b
            break;
        }
    };
    Game.find().sort({state: 1}).exec((err, game)=> {
        if (err){
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        const list = [];
        for (let i = 0; i < game.length; i++) {
            list[i] = {
                gameToken: game[i].gameToken,
                owner: game[i].owner,
                opponent: game[i].opponent,
                gameDuration: time(game[i].gameState, game[i].gameBegin, game[i].gameEnd, game[i].state),
                gameResult: game[i].gameResult,
                size: game[i].size,
                state: game[i].state
            };
        }
        res.send(list);
    });
}
exports.post = (req, res, next) => {
    const owner = req.user.username;
    const size = req.body.size;

    const game = new Game({
        owner: owner,
        ownerToken: Math.random().toString(24).slice(2),
        size: size,
        gameToken: Math.random().toString(24).slice(2),
        state: 0,
        gameState: new Date
    });
    game.save((err) => {
        if(err){
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        require('middleware/checkState')(game.gameToken);
        res.send(game.gameToken);
    });
}

