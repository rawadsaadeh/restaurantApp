var dotenv = require('dotenv');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var pslogger = require('./rawFramework/pslogger');
var psusers = require('./rawFramework/users');
var appsettings = require('./appsettings');
var items = require('./items');
var categories = require('./categories');
var restaurants = require('./restaurants'); 
var address = require('./address'); 
var userRouter = require('./routes/user');
var addressRouter = require('./routes/address');
var menuRouter = require('./routes/menu');
var restaurantRouter = require('./routes/restaurant');
var itemImageUploadRouter = require('./routes/itemImageUploadRouter');
var categoryImageUploadRouter = require('./routes/categoryImageUploadRouter');
var orders = require('./orders');
dotenv.config();

var mongoose = require('mongoose');
setTimeout(function(){
    mongoose.connect("mongodb://localhost:27017/restaurantDB", { useNewUrlParser: true });
}, 5000);

var app = express();
app.logger = pslogger.logger({loglevel:'info', wmongoose: mongoose});
app.mongoose = mongoose;
app.users = psusers(mongoose);
app.appsettings = appsettings(mongoose);
app.items = items(mongoose);
app.orders = orders(mongoose);
app.categories = categories(mongoose);
app.restaurants = restaurants(mongoose);
app.address = address(mongoose);

mongoose.connection.on('connected', () => { app.logger.info('Mongo-> connected'); });
mongoose.connection.on('disconnected', () => { app.logger.error('Mongo-> lost connection'); });
mongoose.connection.on('reconnect', () => { app.logger.info('Mongo-> reconnected'); });
mongoose.connection.on('reconnectFailed', () => { app.logger.error('Mongo-> gave up reconnecting'); });

app.use(logger('common', { "stream": app.logger.stream }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Routes
const API_VERSION = '/api/v1';
app.use(API_VERSION + '/user',bodyParser.raw({type: '*/*'}), userRouter);
app.use(API_VERSION + '/address',bodyParser.raw({type: '*/*'}), addressRouter);
app.use(API_VERSION + '/menu',bodyParser.raw({type: '*/*'}), menuRouter);
app.use(API_VERSION + '/restaurant',bodyParser.raw({type: '*/*'}), restaurantRouter);
app.use(API_VERSION + '/uploadCategoryImage',bodyParser.urlencoded({extended:false}), categoryImageUploadRouter);
app.use(API_VERSION + '/uploadItemImage',bodyParser.urlencoded({extended:false}), itemImageUploadRouter);

module.exports = app;

