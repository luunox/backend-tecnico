require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiArray = require('chai-arrays');
const expect = require('chai').expect;

const Server = require('../models/server');
const server = new Server(false);
const app = server.execute();

chai.use(chaiHttp);
chai.use(chaiArray);
const typeOf = (obj) => Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1];

describe('get /files/data: ', () => {
	it('should be an array', (done) => {
		chai
			.request(app)
			.get('/files/data')
			.end(function (err, res) {
				expect(typeOf(res.body)).to.be.equal('Array');
				done();
			});
	});

	it('every file should be a object', (done) => {
		chai
			.request(app)
			.get('/files/data')
			.end(function (err, res) {
				expect(typeOf(res.body)).to.be.equal('Array');
				res.body.forEach((val) => {
					expect(typeOf(val)).to.be.equal('Object');
				});
				done();
			});
	});

	it('every object should be have 2 params', (done) => {
		chai
			.request(app)
			.get('/files/data')
			.end(function (err, res) {
				typeOf(res.body, 'Array') &&
					res.body.forEach((val) => {
						expect(typeOf(val)).to.be.equal('Object');
						expect(Object.entries(val).length).to.be.equal(2);
					});
				done();
			});
	});

	it('every object should be have "file" param', (done) => {
		chai
			.request(app)
			.get('/files/data')
			.end(function (err, res) {
				typeOf(res.body, 'Array') &&
					res.body.forEach((val) => {
						expect(typeOf(val)).to.be.equal('Object');
						expect(val).to.have.property('file');
					});
				done();
			});
	});
});

describe('get /files/list: ', () => {
	it('should be an array with filenames', (done) => {
		chai
			.request(app)
			.get('/files/list')
			.end(function (err, res) {
				if (typeOf(res.body, 'Object')) {
					expect(res.body).to.be.haveOwnProperty('files');
					res.body.files.forEach((val) => expect(val).to.be.string);
					done();
				}
			});
	});

	it('should be equal to provided api', (done) => {
		chai
			.request(app)
			.get('/files/list')
			.end(function (err, res1) {
				chai
					.request('https://echo-serv.tbxnet.com')
					.get('/v1/secret/files')
					.set({ Authorization: 'Bearer aSuperSecretKey' })
					.end(function (err, res2) {
						if (typeOf(res1.body, 'Object') && typeOf(res2.body, 'Object')) {
							res1.body.files.forEach((val, i) => expect(val).to.be.equal(res2.body.files[i]));
							done();
						}
					});
			});
	});
});
