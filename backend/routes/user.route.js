const express = require('express');

const { registerUser, loginUser, logOut } = require('../controllers/user.controller');

const router = express.Router();

router.post('/api/register',registerUser)
router.get('/api/register',(req,res)=>{
    res.send("Working")
})
router.post('/api/login',loginUser)
router.post('/api/logout',logOut)


router.get('/api/logout',(req,res)=>{
    res.send("working")
})

module.exports = router;