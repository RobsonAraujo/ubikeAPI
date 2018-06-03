const winston = require('winston')
const bikeDao = require('../../dao/BikeDao')
const keyConfig = require('../../config/keysConfig')
const axios = require('axios')


exports.bikesByDistancie = function (req, res) {

    const userAddress = req.params.userAddress;
    const mode = req.params.mode || `walking`;
    const targetTime = req.params.targetTime || `10` // by minutes


    if (!userAddress) {
        winston.error('bikesByDistancie -> params -  *Bad Request - Missing parameters*')
        return res.status(400).json({
            status: 400,
            message: "Bad Request - Missing parameters "
        })
    }


    return bikeDao.getBikes()
        .then(async result => {

            const checkBikes = () => {
                return Promise.all(result.map(bike => {
                    const googleEndpoint = `https://maps.googleapis.com/maps/api/distancematrix/json?mode=${mode}&origins=${userAddress}&destinations=${bike.address}&key=${keyConfig.googleApiKey}`
                    return axios(googleEndpoint).then(estimativeGoogle => {
                        const estimativeInSeconds = estimativeGoogle.data.rows[0].elements[0].duration.value;
                        const targetTimeInSeconds = targetTime * 60;
                        if (estimativeInSeconds < targetTimeInSeconds) {
                            return bike
                        } else {
                            return null
                        }
                    })
                }))
            }

            const bikesInTargetTime = await checkBikes()

            if (bikesInTargetTime.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: "Success",
                    data: bikesInTargetTime
                })
            } else {
                return res.status(204).json({
                    status: 204,
                    message: "Success - not returning any content",
                    data: bikesInTargetTime
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