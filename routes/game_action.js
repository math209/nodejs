const Game = require('models/game').Game;
const HttpError = require('error').HttpError;
const DataError = require('error').DataError;
const log = require('libs/log')(module);
const config = require('config');

const turn_count = (str) => {
    const n = str.match(/n/g);
    const x = str.match(/x/g);
    const o = str.match(/o/g);
    if(n&&n.length == 9) return "owner";
    else if(!o) return "opponent";
    else if(x.length == o.length) return "owner";
    else if(x.length > o.length) return "opponent";
};
exports.get = (req, res, next) => {
    const gameToken = req.query.gameToken;
    const accessToken = req.query.accessToken;
    const referer = req.headers.referer.split('game?id=')[1];
    if(!referer||!gameToken||gameToken!=referer){
        log.error(`referer=${referer}&gameToken=${gameToken}`);
        return res.send(404, {"message": "Неверный запрос"});
    }
    Game.findOne({gameToken: referer}).exec((err, game)=>{
        if (err){
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        if(game==null) return res.send(404, {"message": "Неверный запрос"});

        const list = {};
        if(game.state == 0){
            list.state = 0;
            list.field = ["nnn","nnn","nnn"];
        } else if(game.state == 1){
            list.state = 1;
            list.field = game.field.split(',');
            list.owner = game.owner;
            list.opponent = game.opponent;
            list.gameDuration = new Date - game.gameBegin;
            const gameState = config.get("timeout")-(new Date - game.gameState);
            list.gameState = (gameState<0?0:gameState);
            list.turn = turn_count(game.field);
        } else if(game.state == 2){
            list.state = 2;
            list.field = game.field.split(',');
            list.owner = game.owner;
            list.opponent = game.opponent;
            list.gameResult = game.gameResult;
            list.gameDuration = game.gameEnd - game.gameBegin;
        }
        res.send(list);
    });
}
exports.post = (req, res, next) => {
    const gameToken = req.body.gameToken;
    const accessToken = req.body.accessToken;
    const row = req.body.row;
    const col = req.body.col;
    const referer = req.headers.referer.split('game?id=')[1];
    if(!referer||!gameToken||gameToken!=referer||!row||!col||!accessToken){
        log.error(`referer=${referer}&gameToken=${gameToken}&row=${row}&col=${col}&accessToken=${accessToken}`);
        return res.send(400, {"message": "Ошибка запроса"});
    }
    Game.findOne({gameToken: gameToken}, (err, game)=>{
        if (err){
            log.error(err.message);
            return next(new HttpError(500, err.message));
        }
        if(accessToken!=game.ownerToken&&accessToken!=game.opponentToken) {
            log.error(`accessToken=${accessToken}&ownerToken=${game.ownerToken}&opponentToken=${game.opponentToken}`);
            return res.send(400, {"message": "Не хватает прав"});
        }
        const who_n = (accessToken==game.ownerToken?"owner":"opponent");
        const who_s = (accessToken==game.ownerToken?"x":"o");
        const field = game.field.split(',');//['nnn','nnn','nnx'];
        const check_data = (field[row-1][col-1]!='n'?true:false);
        if(game.state!=1||who_n!=turn_count(game.field)||check_data) {
            log.error(`state=${game.state}&who_n=${who_n}&turn_count=${turn_count(game.field)}&check_data=${check_data}`);
            return res.send(400, {"message": "Ошибка данных"});
        }
        field[row-1] = field[row-1].substr(0, col-1) + who_s + field[row-1].substr(col);
        Game.update({_id: game._id}, check(field, who_n, who_s),  (err) => {
            if (err){
                log.error(err.message);
                return next(new HttpError(500, err.message));
            }
            res.send({});
        });
    });
    const check = (data, a, b) => {
        let flag_w = false;
        if(b == data[0][0] && b == data[1][1] && b == data[2][2] || b == data[0][2] && b == data[1][1] && b == data[2][0]) flag_w = true;
        for(let i=0; i<3; i++) if(b == data[i][0] && b == data[i][1] && b == data[i][2] || b == data[0][i] && b == data[1][i] && b == data[2][i]) flag_w = true;
        if(flag_w) return {gameEnd: new Date, state: 2, gameResult: a, field: data};
        if(data.toString().search(/n/) == -1) return {gameEnd: new Date, state: 2, gameResult: "draw", field: data};
        return {gameState: new Date, field: data};
    }
}