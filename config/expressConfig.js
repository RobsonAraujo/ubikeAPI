
const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('../services/logger')
const auth = require('../middleware/auth')()
const routes = require('../routes/routesV1')
const cors = require('cors')

module.exports = function () {

  const app = express();

  // Midlewares
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(auth.initialize());
  app.use('/api/v1', routes);
  //app.use(cors());
  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });




  app.use(
    morgan('common', {
      stream: {
        write: message => {
          logger.info(message)
        }
      }
    })
  )


  consign()
    .include('controllers')
    .into(app);



  app.use(function (req, res, next) {
    res.status(404).json({
      status: 404,
      message: "Endepoint not existent"
    })
  });

  return app
}