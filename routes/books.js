'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const { camelizeKeys, decamelizeKeys } = require('humps');

// const boom = require('boom');
const knex = require('../knex');

router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', (req, res, next) => {
  if (Number.isNaN(Number.parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  let missing = [
    'title',
    'author',
    'genre',
    'description',
    'cover_url'
  ];

  missing = missing.filter((element) => {
    return !Object.keys(req.body).includes(decamelizeKeys(element));
  });
  let key;
  console.log(missing.length);
  if (missing.length > 0) {
    switch (missing[0]) {
      case 'title':
        key = 'Title';
        break;
      case 'author':
        key = 'Author';
        break;
      case 'genre':
        key = 'Genre';
        break;
      case 'description':
        key = 'Description';
        break;
      case 'cover_url':
        key = 'Cover URL';
        break;
      default:
    }
    const err = new Error(`${key} must not be blank`);

    err.output = {};
    err.output.statusCode = 400;

    throw err;

    // throw boom.create(400, `${key} must not be blank`)
  }
  console.log('hello');

  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl // eslint-disable-line camelcase
    }, '*')
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  if (Number.isNaN(Number.parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      return knex('books')
        .update({
          title: req.body.title,
          author: req.body.author,
          genre: req.body.genre,
          description: req.body.description,
          cover_url: req.body.coverUrl // eslint-disable-line camelcase
        }, '*')
        .where('id', req.params.id);
    })
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  if (Number.isNaN(Number.parseInt(req.params.id))) {
    return next();
  }
  knex('books')
    .del('*')
    .where('id', req.params.id)
    .then((books) => {
      if (!books.length) {
        return next();
      }
      const book = books[0];

      delete book.id;
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
