const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const getOptions = {
	method: 'GET',
	headers: { Authorization: 'Bearer aSuperSecretKey' },
};

const splitLine = (line = {}) => {
	values = line.split(',');
	if (values.length === 4) {
		return {
			text: values[1],
			number: values[2],
			hex: values[3],
		};
	} else return null;
};

const getFile = (file = '', cb = (data) => {}) => {
	fetch(`https://echo-serv.tbxnet.com/v1/secret/file/${file}`, getOptions).then((dat) => {
		let fileData = {};
		dat.body.on('data', (row) => {
			try {
				const error = JSON.parse(row.toString());
				fileData = { file, error };
			} catch (error) {
				const arr = row.toString().split('\n');
				let lines = [];
				arr.forEach((line, i) => {
					i >= 1 && splitLine(line) && (lines = [...lines, splitLine(line)]);
				});
				fileData = { file, lines };
			}
		});

		dat.body.on('end', () => cb(fileData));
	});
};

const getFiles = async (res) => {
	try {
		let response = [];
		const { files } = await (await fetch('https://echo-serv.tbxnet.com/v1/secret/files', getOptions)).json();

		files.forEach((csv) =>
			getFile(csv, (data) => {
				response = [...response, data];
				response.length === files.length && res.json(response);
			})
		);
	} catch (error) {
		console.log('error:', error);
		res.json(error);
	}
};

module.exports = { getFile, getFiles, getOptions };
