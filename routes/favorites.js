'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'favorites.book_id', 'books.id')
    .where('favorites.user_id', req.claim.userId)
    .orderBy('favorites.book_id', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check', authorize, (req, res, next) => {
  if (Number.isNaN(Number.parseInt(req.query.bookId))) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('favorites')
    .where('user_id', req.claim.userId)
    .where('book_id', req.query.bookId)
    .then((rows) => {
      const row = rows[0];

      res.send(Boolean(row));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  const { bookId } = req.body;

  if (Number.isNaN(Number.parseInt(bookId))) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Book not found');
      }

      return knex('favorites')
      .insert({
        book_id: bookId, // eslint-disable-line camelcase
        user_id: req.claim.userId // eslint-disable-line camelcase
      }, '*');
    })
    .then((favorites) => {
      res.send(camelizeKeys(favorites[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  const { bookId } = req.body;

  if (Number.isNaN(Number.parseInt(bookId))) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Favorite not found');
      }

      return knex('favorites')
        .del('*')
        .where('user_id', req.claim.userId)
        .where('book_id', bookId);
    })
    .then((favorites) => {
      if (!favorites.length) {
        return next();
      }
      const favorite = favorites[0];

      delete favorite.id;
      res.send(camelizeKeys(favorite));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
