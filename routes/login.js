const User = require('models/user').User;
const async = require('async');
const HttpError = require('error').HttpError;
const AuthError = require('error').AuthError;

exports.get = (req, res) => res.render('login');
exports.post = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.authorize(username, password, (err, user) => {
        if(err) {
            if(err instanceof AuthError) {
                return res.send(err.status, err.message);
            } else return next(err);
        }
        req.session.user = user._id;
        res.end();
    });
}