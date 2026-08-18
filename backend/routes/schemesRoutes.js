const express = require('express');
const router = express.Router();
const { getSchemes } = require('../controllers/schemesController');

router.get('/', getSchemes);

module.exports = router;
