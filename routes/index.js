const checkAuth = require('middleware/checkAuth');

module.exports = (app) => {
  app.get('/', require('./main').get);
  app.get('/main', require('./main').get);
  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);
  app.get('/game_main', checkAuth, require('./game_main').get);
  app.get('/game_list', checkAuth, require('./game_list').get);
  app.post('/game_list', checkAuth, require('./game_list').post);
  app.get('/game', checkAuth, require('./game').get);
  app.post('/game', checkAuth, require('./game').post);
  app.get('/game_action', checkAuth, require('./game_action').get);
  app.post('/game_action', checkAuth, require('./game_action').post);
};
