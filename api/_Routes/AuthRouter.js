const { signup, login } = require('../_Controllers/AuthController');
const { signupValidation, loginValidation } = require('../_Middlewares/AuthValidation');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);

module.exports = router;