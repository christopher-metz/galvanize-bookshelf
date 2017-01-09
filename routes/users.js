'use strict';

const bcrypt = require('bcrypt-as-promised');
const express = require('express');
const boom = require('boom');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();
const { camelizeKeys } = require('humps');

router.post('/users', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || !password.trim()) {
    return next(boom.create(400, 'Password must be at least 8 characters long')); // eslint-disable-line max-len
  }

  knex('users')
    .where('email', email)
    .first()
    .then((existingUser) => {
      if (existingUser) {
        return next(boom.create(400, 'Email already exists'));
      }

      bcrypt.hash(req.body.password, 12)

      // eslint-disable-next-line camelcase
        .then((hashed_password) => {
          return knex('users')
            .insert({
              first_name: firstName, // eslint-disable-line camelcase
              last_name: lastName, // eslint-disable-line camelcase
              email: email, // eslint-disable-line object-shorthand
              hashed_password: hashed_password // eslint-disable-line camelcase, object-shorthand, max-len
            }, '*');
        })
        .then((users) => {
          const user = users[0];

          delete user.hashed_password;

          res.send(camelizeKeys(user));
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
