const Game = require('models/game').Game;
const HttpError = require('error').HttpError;
const log = require('libs/log')(module);
const config = require('config');

module.exports = (gameToken) => {
    const timer = setInterval(() => {
        Game.findOne({gameToken: gameToken}, (err, games)=> {
            if(err){
                clearInterval(timer);
                new HttpError(500, err.message);
            }
            const res = new Date - games.gameState;
            if(games.state == 0 && res > config.get("timeout")) deldata(games.gameToken);
            else if(games.state == 1 && res > config.get("timeout")) updata(games.gameToken, turn_count(games.field));
            else if(games.state == 2) clearInterval(timer);
        });

    }, 2000);
    const deldata = (gameToken) => {
        clearInterval(timer);
        Game.deleteOne({gameToken: gameToken}, (err) => {
            if(err) {
                log.error(`deleteOne: gameToken=${gameToken}`);
                new HttpError(500, err.message);
            }
        });
    };
    const updata = (gameToken, winner) => {
        clearInterval(timer);
        Game.updateOne({gameToken: gameToken},{gameEnd: new Date, state: 2, gameResult: winner}, (err) => {
            if(err) {
                log.error(`updateOne: gameToken=${gameToken}`);
                new HttpError(500, err.message);
            }
        });
    };
    const turn_count = (str) => {
        const n = str.match(/n/g);
        const x = str.match(/x/g);
        const o = str.match(/o/g);
        if(n&&n.length == 9) return "opponent";
        else if(!o) return "owner";
        else if(x.length == o.length) return "opponent";
        else if(x.length > o.length) return "owner";
    };
};

const time = (millisec=null) => {
    let seconds = (millisec / 1000).toFixed(0);
    let minutes = Math.floor(seconds / 60);
    let hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") return hours + ":" + minutes + ":" + seconds;
    return minutes + ":" + seconds;
}