const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');

//urls permitidas a acceder al api se usa RegEx
const whitelist = ['.*', '.*dominio-regex.com.*'];

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, //limitar a cada IP a 100 peticiones por windowMs
});

Array.prototype.match = function (stringToMatch = '') {
	return this.filter(function (item) {
		return typeof item == 'string' && stringToMatch.match(new RegExp(item));
	});
};

global.canAccess = (req, res, header, list) => {
	const arr = list !== undefined ? list : whitelist;
	const hed = header !== undefined ? header : 'origin';
	if (req.header(hed)) !arr.match(req.header(hed))?.length && req.destroy();
	else req.destroy();
};

class Server {
	constructor(morgan = true) {
		// super(props);
		this.morgan = morgan;
		this.app = express();
		this.port = process.env.PORT || 5000;

		// Http Server
		this.server = http.createServer(this.app);
	}

	middlewares() {
		// Seguridad
		this.app.use(limiter);
		this.app.use(helmet());
		this.app.options('*', cors());
		this.app.use(function (req, res, next) {
			canAccess(req, res, 'host');
			next();
		});
		this.app.use(function (req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,OPTIONS');
			next();
		});

		// Configs
		this.morgan && this.app.use(morgan('dev'));
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));

		// Desplegar el directorio público
		this.app.use(express.static(path.resolve(__dirname, '../public')));
	}

	execute() {
		// Inicializar Middlewares
		this.middlewares();

		// Routes
		require('../routes/knox.routes')(this.app);

		// Inicializar Server
		this.server.listen(this.port, () => {
			console.log('Server corriendo en puerto:', this.port);
		});

		return this.app;
	}
}

module.exports = Server;
