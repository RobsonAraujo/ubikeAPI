//Here are all routes.

const express = require('express')
const router = express.Router();
const controllers = require('../controllers');
const authMiddleware = require('../middleware/auth')();



// USER
router.post('/login', controllers.userController.login);
router.post('/register', controllers.userController.register);

// BIKE LOCATION
router.get('/docklessByDistancie/:userAddress/:mode?/:targetDistancie?', controllers.bikeController.docklessByDistancie)
router.post('/startRun', controllers.bikeController.startRun)
router.post('/finishedRun', controllers.bikeController.finishedRun)

// 





// PAYMENT







module.exports = router;
