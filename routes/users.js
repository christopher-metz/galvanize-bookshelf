'use strict';

const bcrypt = require('bcrypt-as-promised');
const express = require('express');
const boom = require('boom');
const jwt = require('jsonwebtoken');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();
const { camelizeKeys, decamelizeKeys } = require('humps');

router.post('/users', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || password.length < 8) {
    return next(boom.create(400, 'Password must be at least 8 characters long')); // eslint-disable-line max-len
  }

  knex('users')
    .where('email', email)
    .first()
    .then((existingUser) => {
      if (existingUser) {
        return next(boom.create(400, 'Email already exists'));
      }

      return bcrypt.hash(password, 12);
    })

    .then((hashedPassword) => {
      return knex('users')
        .insert(decamelizeKeys({ firstName, lastName, email, hashedPassword }), '*'); // eslint-disable-line max-len
    })
    .then((users) => {
      const user = camelizeKeys(users[0]);

      const claim = { userId: user.id };
      const token = jwt.sign(claim, process.env.JWT_KEY, {
        expiresIn: '7 days'
      });

      res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        secure: router.get('env') === 'production'
      });

      delete user.hashedPassword;

      res.send(user);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
