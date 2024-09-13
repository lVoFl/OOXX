var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const mysql = require('mysql')

const hostname = '8.134.218.50'
const port = 3307
const SECRET_KEY = 'MY_SECRET_KEY'
const pool = mysql.createPool({
  user: 'root',
  password: '123123',
  host: hostname,
  port: port,
  database: 'OOXX'
})
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next){
  const username = req.body.username
  const password = req.body.password
  console.log(username)
  pool.query('select * from user where username=? and password=?', [username, password], (error, results)=>{
    if(error){
      res.status(500).json(error)
    }else{
      if(results.length > 0){
        if(results[0].password === password){
          let nowInSeconds = new Date().getTime() / 1000
          let payload = {
            name: results[0].name,
            id: results[0].id
          };
          // creating access-token
          console.log(payload)
          let accessToken = jwt.sign(payload, SECRET_KEY, {algorithm: 'HS256', expiresIn: '999h'});
          console.log(accessToken)
          res.status(201).json({data: '登录成功', msg: accessToken});
        }
      }
    }
  })
})

router.post('/register', function (req,res){
  const username = req.body.username
  const password = req.body.password

  pool.query('insert into user(username, password) values(?, ?)', [username, password], (error, result)=>{
    if(error){
      res.status(500).json(error)
    }else{
      res.status(200).json({msg: "注册成功"})
    }
  })
})

module.exports = router;
