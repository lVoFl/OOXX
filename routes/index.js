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

router.get('/game', (req, res)=>{
  try{
    const level = req.query.level
    pool.query('select * from GameData where level=?', [level], (error, result)=>{
      if(error){
        res.status(500).json(error)
      }else{
        res.status(200).json({map: result[0].data, axis: result[0].xy})
      }
    })
  }catch (e) {
    res.status(500).json(e)
  }
})

router.get('/game/count', (req, res)=>{
  try{
    pool.query('select level from GameData', (error, result) => {
      if(error){
        res.status(500).json(500)
      }else{
        res.status(200).json(result)
      }
    })
  }catch (e) {
    res.status(500).json(e)
  }
})

router.get('/game/data', (req, res) => {
  try{
    const id = req.query.id
    pool.query('select * from GamePass where id = ?', [id], (error, result) => {
      if (error) {
        res.status(500).json(error)
      }else {
        res.status(200).json(result)
      }
    })
  } catch (e) {
    res.status(500).json(e)
  }
})

router.post('/game/pass', (req, res) => {
  try{
    const name = req.body.name
    const level = req.body.level
    pool.query('insert into PassGame values(?, ?)', [name, level], (error, result) => {
      if (error) {
        res.status(500).json(error)
      }else {
        res.status(200).json("success")
      }
    })
  } catch (e) {
    res.status(500).json(e)
  }
})

router.get('/game/pass', (req, res) => {
  try{
    const name = req.query.name
    pool.query('select * from PassGame where name = ?', [name], (error, result) => {
      if (error) {
        res.status(500).json(error)
      }else {
        let response = []
        for(let i = 0;i < result.length;i ++){
          response.push(result[i].level)
        }
        res.status(200).json(response)
      }
    })
  } catch (e) {
    res.status(500).json(e)
  }
})

module.exports = router;
