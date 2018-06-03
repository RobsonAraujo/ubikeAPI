
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

  // 
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(auth.initialize());

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