const connectionFactory = require('../services/connectionFactory')
const knex = connectionFactory.knex;

module.exports = {
    getBikes() {
        return knex('bikes')
    }
}