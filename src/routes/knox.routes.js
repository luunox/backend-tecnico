const url = require('url');
const moment = require('moment');
const { getFiles, getOptions, getFile } = require('../functions/fetchUtils');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

moment.locale('es-mx');

module.exports = function (app) {
	app.get('/', (req, res) => {
		// canAccess(req, res, 'origin', ['.*webquesipuede.*']); // para bloquear que solo se pueda llamar desde lugares especificos
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write('<h1>Server Knox REST FULL API</h1><br />');
		res.end();
	});

	app.get('/files/data', async (req, res) => {
		// canAccess(req, res);
		const queryObject = url.parse(req.url, true).query;
		queryObject.fileName ? getFile(queryObject.fileName, (data) => res.json(data)) : getFiles(res);
	});

	app.get('/files/list', async (req, res) => {
		// canAccess(req, res);
		try {
			const { files } = await (await fetch('https://echo-serv.tbxnet.com/v1/secret/files', getOptions)).json();

			res.json({ files });
		} catch (error) {
			console.log('error:', error);
			res.json(error);
		}
	});
};
