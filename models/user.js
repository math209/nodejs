const {createHmac} = require('crypto');
const async = require('async');
const mongoose = require('libs/mongoose');
const AuthError = require('error').AuthError;

const Schema = mongoose.Schema;
const schema = new Schema({
    username:{
        type: String,
        unique: true,
        required: true
    },
    hashedPassword:{
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    },
    created:{
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = function(password){
    return createHmac('sha1', this.salt).update(password).digest('hex');
}


schema.virtual('password')
    .set(function(password){
        this._plainPassword = password;
        this.salt = Math.random() + '';
        console.log(`|2|${this.salt}|`);
        this.hashedPassword = this.encryptPassword(password, this.salt);
    })
    .get(function(){return this._plainPassword;});

schema.methods.checkPassword = function(password){
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
    const User = this;
    async.waterfall([
        (callback) => {
            User.findOne({username: username}, callback);
        },
        (user, callback) => {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new AuthError("Пароль неверный"));
                }
            } else {
                const user = new User({username: username, password: password});
                user.save((err) => {
                    if (err) return callback(err);
                    callback(null, user);
                });
            }
        }
    ], callback);
};

exports.User = mongoose.model('User', schema);