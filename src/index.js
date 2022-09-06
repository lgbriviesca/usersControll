const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');

const { database } = require('./keys');
//const { allowedNodeEnvironmentFlags } = require('process');

//  inicialización de la aplicación con Express
const app = express();
require('./lib/passport');

//  configuraciones
const PORT = process.env.PORT || 8000;
/* app.set('port', 8000 || 3306); */
app.set('views', path.join(__dirname, 'views'));
app.engine(
  '.hbs',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars'),
  })
);
app.set('view engine', '.hbs');

//  middlewares
app.use(
  session({
    secret: 'faztmysqlnodemysql',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
  })
);
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//  varables globales
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

//  rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

//  public
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname, +'/public'));

//  iniciar el servidor antes definido
app.listen(PORT, () => {
  console.log(`logistics app is running on port: ${PORT}`);
});
