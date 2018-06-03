const winston = require('winston')
const bikeDao = require('../../dao/BikeDao')
const keyConfig = require('../../config/keysConfig')
const axios = require('axios')


exports.docklessByDistancie = function (req, res) {

    const userAddress = req.params.userAddress;
    const mode = req.params.mode || `walking`;
    const targetTime = req.params.targetTime || `10` // by minutes


    if (!userAddress) {
        winston.error('docklessByDistancie -> params -  *Bad Request - Missing parameters*')
        return res.status(400).json({
            status: 400,
            message: "Bad Request - Missing parameters "
        })
    }


    return bikeDao.getDockless()
        .then(async result => {

            const checkDockless = () => {
                return Promise.all(result.map(bike => {
                    const googleEndpoint = `https://maps.googleapis.com/maps/api/distancematrix/json?mode=${mode}&origins=${userAddress}&destinations=${bike.address}&key=${keyConfig.googleDistanceMatrixApi}`
                    return axios(googleEndpoint).then(estimativeGoogle => {
                        if (estimativeGoogle.data.rows[0].elements[0].status != "OK") {
                            return null
                        } else {

                            const estimativeInSeconds = estimativeGoogle.data.rows[0].elements[0].duration.value;
                            const targetTimeInSeconds = targetTime * 60;

                            // chang property name
                            estimativeGoogle.data.rows[0].elements[0].duration.estimateTime = estimativeGoogle.data.rows[0].elements[0].duration.text

                            if (estimativeInSeconds < targetTimeInSeconds && bike.reserved != 1 && bike.running != 1) {
                                bike.estimateTime = estimativeGoogle.data.rows[0].elements[0].duration.estimateTime
                                return bike
                            } else {
                                return null
                            }

                        }

                    })
                }))
            }

            const docklessInTargetTime = await checkDockless()

            if (docklessInTargetTime.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: docklessInTargetTime
                })
            } else {
                return res.status(204).json({
                    status: 204,
                    message: "Success - not returning any content"
                })
            }
        })
        .catch(error => {
            winston.error(`bikesByDistancie ->  *Internal Server error - ${error}*`)
            return res.status(500).json({
                status: 500,
                message: "Internal Server error - " + error
            })
        })


}



exports.startRun = function (req, res) {

    const { userId, dockelessId } = req.body;

    if (!userId || !dockelessId) {
        winston.error('startRun -> body -  *Bad Request - Missing parameters*')
        return res.status(400).json({
            status: 400,
            message: "Bad Request - Missing parameters "
        })
    }

    return bikeDao.startRun(userId, dockelessId, new Date()).then(result => {
        winston.info(`startRun -> create new run - *Successfuully new runs is created with id ${result}*`)
        return res.status(201).json({
            status: 201,
            message: "Successfuully new run was start "
        })
    }).catch(error => {
        winston.error(`startRun ->   *Internal Server error - ${error}*`)
        return res.status(500).json({
            status: 500,
            message: "Internal Server error - " + error
        })
    })
}


exports.finishedRun = function (req, res) {

    const { userId, bikeId, dockelessId, runningId } = req.body;

    if (!userId || !bikeId || !dockelessId || !runningId) {
        winston.error('finishedRun -> body -  *Bad Request - Missing parameters*')
        return res.status(400).json({
            status: 400,
            message: "Bad Request - Missing parameters "
        })
    }

    return bikeDao.finishedRun(runningId, userId, bikeId, dockelessId, new Date()).then(result => {
        winston.info(`finishedRun ->   - *Successfuully new runs is finished*`)
        return res.status(201).json({
            status: 201,
            message: "Successfuully new runs is finished "
        })
    }).catch(error => {
        winston.error(`finishedRun ->   *Internal Server error - ${error}*`)
        return res.status(500).json({
            status: 500,
            message: "Internal Server error - " + error
        })
    })

}