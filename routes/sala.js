var express = require('express');
var router = express.Router();
let salaController = require('../controllers/salaController')

router.get('/',salaController.index);

module.exports = router;
