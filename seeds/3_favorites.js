'use strict';

exports.seed = function(knex) {
  return knex('favorites').del()
    .then(() => {
      return knex('favorites').insert([{
        id: 1,
        book_id: 1, // eslint-disable-line camelcase
        user_id: 1, // eslint-disable-line camelcase
        created_at: new Date('2016-06-29 14:26:16 UTC'), // eslint-disable-line camelcase, max-len
        updated_at: new Date('2016-06-29 14:26:16 UTC') // eslint-disable-line camelcase, max-len
      }]);
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('favorites_id_seq', (SELECT MAX(id) FROM favorites));"
      );
    });
};
