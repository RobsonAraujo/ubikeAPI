const connectionFactory = require('../services/connectionFactory')
const knex = connectionFactory.knex;
const priceHelper = require(`../helper/priceHelper`)

module.exports = {
    getDockless() {
        return knex('dockless')
    },
    startRun(id_user, id_dockless, date_start_running) {
        return knex.select(`id_bike`).from(`bikes`)
            .where({ id_dockless, running: "0" }).limit(1).then(result => {
                const id_bike = result[0].id_bike
                return knex('runningsController')
                    .insert({ id_user, id_dockless, id_bike, date_start_running }).then(result => {
                        return knex('bikes')
                            .where('id_bike', id_bike)
                            .update('running', '1').then(result => {
                                return knex('dockless')
                                    .where('id', id_dockless)
                                    .decrement('bikes_available', 1)
                            })

                    })
            })

    },

    finishedRun(id_user, id_dockless, date_end_running) {
        return knex.select(`date_start_running`, `id_bike`).from(`runningsController`)
            .where({ id_user, date_end_running: null }).then(runningIdAffected => {
                const date_start_running = runningIdAffected[0].date_start_running;
                const id_bike = runningIdAffected[0].id_bike;
                const runTime = priceHelper.runTime(date_start_running, date_end_running)
                const finalPrice = priceHelper.calculatePrice(date_start_running, date_end_running)

                return knex('runningsController')
                    .where({ id_user, date_end_running: null, id_bike })
                    .update({
                        date_end_running, finalPrice, runTime
                    })
                    .then(result => {
                        return knex('dockless')
                            .where('id', id_dockless)
                            .increment('bikes_available', 1).then(result => {
                                return knex('bikes')
                                    .where({ id_bike })
                                    .update({
                                        running: "0",
                                        id_dockless
                                    })
                            })
                    })

            })


    }
}