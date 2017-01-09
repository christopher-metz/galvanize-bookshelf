'use strict';

exports.seed = function(knex) {
  return knex('users').del()
    .then(() => {
      return knex('users').insert([{
        id: 1,
        first_name: 'Joanne', // eslint-disable-line camelcase, max-len
        last_name: 'Rowling', // eslint-disable-line camelcase, max-len
        email: 'jkrowling@gmail.com',
        hashed_password: '$2a$12$C9AYYmcLVGYlGoO4vSZTPud9ArJwbGRsJ6TUsNULzR48z8fOnTXbS',  // eslint-disable-line camelcase, max-len
        created_at: new Date('2016-06-29 14:26:16 UTC'), // eslint-disable-line camelcase, max-len
        updated_at: new Date('2016-06-29 14:26:16 UTC') // eslint-disable-line camelcase, max-len
      }]);
    })
    .then(() => {
      return knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));"); // eslint-disable-line max-len
    });
};
