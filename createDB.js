const mongoose = require('libs/mongoose');
const Game = require('models/game').Game;
const async = require('async');
const log = require('libs/log')(module);

const rand = () => Math.random().toString(24).slice(2);

mongoose.connection.on('open', ()=>{
    const db = mongoose.connection.db;
    //db.dropCollection('games',(err)=>{
    db.dropDatabase((err)=>{
        if(err) throw err;
        async.parallel([
            (callback)=>{
                const abc3 = new Game({owner: 'Дима', ownerToken: rand(), size: 3, gameToken: rand(), state: 0});
                abc3.save((err)=> callback(err, abc3));
            },
            (callback)=>{
                const abc1 = new Game({owner: 'Вася', ownerToken: rand(), opponent: 'Admin', opponentToken: rand(), size: 3, gameToken: rand(), state: 2, gameBegin: "2018-09-29T13:50:31.408Z", gameEnd: "2018-09-29T14:50:31.408Z", gameResult: 'draw', field: 'xoo,oxx,xxo'});
                abc1.save((err)=> callback(err, abc1));
            },(callback)=>{
                const abc11 = new Game({owner: 'Вася', ownerToken: rand(), opponent: 'Admin1', opponentToken: rand(), size: 3, gameToken: rand(), state: 2, gameBegin: "2018-09-29T23:50:31.408Z", gameEnd: "2018-09-30T00:04:31.408Z", gameResult: 'owner', field: 'xoo,oxx,xxo'});
                abc11.save((err)=> callback(err, abc11));
            },
            (callback)=>{
                const abc2 = new Game({owner: 'Петя', ownerToken: rand(), opponent: 'Admin', opponentToken: rand(), size: 3, gameToken: rand(), gameBegin: "2018-09-28T13:50:31.408Z", state: 1, field: 'nnn,oxx,onn'});
                abc2.save((err)=> callback(err, abc2));
            },
            (callback)=>{
                const abc2 = new Game({owner: 'Петя1', ownerToken: rand(), opponent: 'Admin', opponentToken: rand(), size: 3, gameToken: rand(), gameBegin: "2018-09-28T13:50:31.408Z", state: 1, field: 'nnn,oxx,xoo'});
                abc2.save((err)=> callback(err, abc2));
            },
            (callback)=>{
                const abc3 = new Game({owner: 'Петя', ownerToken: rand(), size: 3, gameToken: rand(), state: 0});
                abc3.save((err)=> callback(err, abc3));
            },
            (callback)=>{
                const abc2 = new Game({owner: 'Саша', ownerToken: rand(), opponent: 'Admin', opponentToken: rand(), size: 3, gameToken: rand(), gameBegin: "2018-09-29T13:00:31.408Z", state: 1, field: 'oxx,nnn,nnn'});
                abc2.save((err)=> callback(err, abc2));
            },(callback)=>{
                const abc11 = new Game({owner: 'Вася2', ownerToken: rand(), opponent: 'Admin1', opponentToken: rand(), size: 3, gameToken: rand(), gameBegin: "2018-09-29T13:30:31.408Z", gameEnd: "2018-09-29T15:50:31.408Z", gameResult: 'opponent', state: 2, field: 'xoo,oxx,xxo'});
                abc11.save((err)=> callback(err, abc11));
            }
        ],(...args)=>{
            console.log(args);

            /*setTimeout(() => {
                const q = args[1][1].gameBegin;
                const w = new Date();
                const e = w-q;

                console.log(`${q}|${w}|${e}|${time(e)}`)
            }, 5000);*/
            mongoose.disconnect();
        });
    });
});

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
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}