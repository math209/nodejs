const mongoose = require('libs/mongoose');

const Schema = mongoose.Schema;
const schema = new Schema({
    owner:{
        type: String,
        required: true
    },
    ownerToken:{
        type: String,
        unique: true,
        required: true
    },
    opponent:{
        type: String
    },
    opponentToken:{
        type: String
    },
    size:{
        type: Number,
        required: true
    },
    gameToken:{
        type: String,
        unique: true,
        required: true
    },
    gameState:{
        type: Date,
        required: true
    },
    gameBegin:{
        type: Date
    },
    gameEnd:{
        type: Date
    },
    gameResult:{
        type: String
    },
    state:{
        type: Number,
        required: true
    },
    field:{
        type: String
    }
});

exports.Game = mongoose.model('Game', schema);
