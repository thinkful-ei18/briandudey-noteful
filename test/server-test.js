'use strict';

const runServer = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const { PORT } = require('../config');
const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiSpies); 

let server;

before(function () {
  console.log('Before: start express app');

  return runServer(PORT)
    .then(instance => server = instance);
});

after(function () {
  console.log('After: close server');
  return server.closeServer();
});

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment setup', function () {

  it('NODE_ENV should be "test"', function () {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('Express App should have correct methods', function () {
    expect(server).to.have.property('listenAsync');
  });

});

describe ('Noteful App', function() { 

  describe('Express static', function () {
    
    it('GET request "/" should return the index page', function () {
      return chai.request(runServer)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });
  });

  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      const spy = chai.spy();
      return chai.request(runServer)
        .get('/bad/path')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });
  });

  describe('GET /notes', function() {
    it('should return the notes', function() {
      return chai.request(server)
        .get('/notes')
        .then(function(res){
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return a list of the note fields', function() {
      return chai.request(server)
        .get('/notes')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(10);
          res.body.forEach(function (item) {
            expect(item).to.be.an('object');
            expect(item).to.include.keys('id', 'title', 'content');
          });
        });
    });

    it('should return accurate search results for the query', function () {
      return chai.request(server)
        .get('/notes?searchTerm=gov')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(1);
          expect(res.body[1]).to.be.an('object');
          expect(res.body[1].id).to.equal(1001);
        });
    });
 
    it('should return an empty array if query is an error', function() {
      return chai.request(server)
        .get('/notes?searchTerm=Not%20a%20Valid%20Search')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(0);
        });
    });
  });

  describe ('GET /notes/:id', function() {

    it('should return the correct note', function() {
      return chai.request(server)
        .get('/notes/1001')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.be.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(1001);
          expect(res.body.title).to.equal(1001);
          expect(res.body.title).to.equal("What the government doesn't want you to know about cats");
        });
    });

    it('should respond 404 for id that is not valid', function() {
      const spy = chai.spy();
      return chai.request(server)
        .get('/notes/9999')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

  });

  describe('POST /notes', function() {
    it('should create a new note when provided the correct data', function() {
      const newItem = {
        'title': 'What your cat knows about the five eyes conspiracy',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
      return chai.request(server)
        .post('/notes')
        .send(newItem)
        .then(function (res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(1010);
          expect(res.body.title).to.equal(newItem.content);
          expect(res).to.have.header('location');
        });
    });

    it('should return an error when missing the "title" field', function() {
      const newItem = {
        'wham' : 'bam'
      };
      const spy = chai.spy();
      return chai.request(server)
        .post('/notes')
        .send(newItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });
  });

  describe ('PUT /notes/:id', function() {
    it ('should update the note', function () {
      const updateItem = {
        'title': 'CATch me if you can',
        'content' : 'Leonardo DiCatrio'
      };
      return chai.request(server)
        .put('/notes/1006')
        .send(updateItem)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(1006);
          expect(res.body.title).to.equal(updateItem.content);
        });
    });

    it('should respond with a 404 for invalid id', function () {
      const updateItem = {
        'title': 'CATch me if you can',
        'content': 'Leonardo DiCatrio'
      };
      const spy = chai.spy();
      return chai.request(server)
        .put('/notes/9999')
        .send(updateItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

    it('should return an error when missing "title" field', function () {
      const updateItem = {
        'wham': 'bam'
      };
      const spy = chai.spy();
      return chai.request(server)
        .put('/notes/9999')
        .send(updateItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('missing `title` in request body');
        });
    });
  });

  describe('DELETE /notes/:id', function() {
    it('should delete an item by the id', function(){
      return chai.request(server)
        .delete('/notes/1005')
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', function() {
      const spy = chai.spy();
      return chai.request(server)
        .delete('/notes/9999')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });
  });
});
