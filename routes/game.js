const Game = require('models/game').Game;
const HttpError = require('error').HttpError;
const log = require('libs/log')(module);

exports.get = (req, res, next) => {
    Game.findOne({gameToken: req.query.id}).exec((err, game)=>{
        if (err) {
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        if(game==null) {
            log.error("Не существет такая партия");
            return next(new HttpError(403, "Не существует такая партия"));
        }
        if(game.owner==req.user.username){//owner reload site
            res.render('game', {accessToken: game.ownerToken, gameToken: game.gameToken, gamer: "owner"});

        } else if(game.opponent&&game.opponent==req.user.username){//opponent reload site
            res.render('game', {accessToken: game.opponentToken, gameToken: game.gameToken, gamer: "opponent"});

        } else if(game.opponent&&game.owner!=req.user.username&&game.opponent!=req.user.username){//viewer
            res.render('game', {accessToken: "", gameToken: game.gameToken, gamer: "viewer"});

        } else if(!game.opponent&&game.owner!=req.user.username){//create opponent
            const rand = Math.random().toString(24).slice(2);
            const gameToken = game.gameToken;
            Game.update({_id: game._id}, {opponent: req.user.username, opponentToken: rand, gameBegin: new Date, state: 1, field: "nnn,nnn,nnn", gameState: new Date},  (err) => {
                if (err){
                    log.error(err.message);
                    return (new HttpError(500, err.message));
                }
                res.render('game', {accessToken: rand, gameToken: gameToken, gamer: "opponent"});
            });
        }
    });
}
exports.post = (req, res, next) => {
    const accessToken = req.body.accessToken;
    const gameToken = req.body.gameToken;
    const referer = req.headers.referer.split('game?id=');
    if(!gameToken||!referer[1]) {
        log.error(`referer=${referer}&gameToken=${gameToken}`);
        return next(new HttpError(500, "Ошибка запроса"));
    }
    Game.findOne({gameToken: gameToken}).exec((err, game)=> {
        if (err) {
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        if (game == null) {
            log.error("Не существет такая партия");
            return next(new HttpError(403, "Не существует такая партия"));
        }

        if (game.state == 0 && game.ownerToken == accessToken && game.owner == req.user.username) {
            Game.deleteOne({gameToken: gameToken}, (err)=> {
                if (err) {
                    log.error(err.message);
                    return next(new HttpError(500, err.message));
                }
                res.end();
            });
        } else if (game.state == 1) {
            if (accessToken == "" || game.ownerToken != accessToken && game.opponentToken != accessToken) {
                res.end();
            } else if (game.ownerToken == accessToken && game.owner == req.user.username) {
                Game.update({gameToken: gameToken}, {state: 2, gameEnd: new Date, gameResult: 'opponent'},  (err) => {
                    if (err) {
                        log.error(err.message);
                        return next(new HttpError(500, err.message));
                    }
                    res.end();
                });
            } else if (game.opponentToken == accessToken && game.opponent == req.user.username) {
                Game.update({gameToken: gameToken}, {state: 2, gameEnd: new Date, gameResult: 'owner'},  (err) => {
                    if (err) {
                        log.error(err.message);
                        return next(new HttpError(500, err.message));
                    }
                    res.end();
                });
            }
        } else if (game.state == 2) {
            res.end();
        }
    });
}

