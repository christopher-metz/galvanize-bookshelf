'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('favorites', (table) => {
    table.increments();
    table.integer('book_id').notNullable().references('books.id').onDelete('cascade').index(); // eslint-disable-line max-len
    table.integer('user_id').notNullable().references('users.id').onDelete('cascade').index(); // eslint-disable-line max-len
    table.timestamps(true, true).defaultTo(Date.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
