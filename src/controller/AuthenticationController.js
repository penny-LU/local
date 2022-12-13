const { User } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser (user) {
  const ONE_WEEK = 60 * 60 * 24 * 7
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: ONE_WEEK
  })
}
module.exports = {
  async register (req, res) {
    try {
      const user = await User.create(req.body)
      res.send(user.toJSON())
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already use.'
      })
      // email allready exists
    }
  },
  async login (req, res) {
    try {
      const { email, password } = req.body
      console.log('go to loogin')
      // console.log('email', email)
      // console.log('password', password)
      const user = await User.findOne({
        where: {
          email
        }
      })
      // console.log('user', user.toJSON())
      if (!user) {
        console.log('user')
        return res.status(403).send({
          error: 'The Email information was incorrect'
        })
      }
      const isPasswordValid = await user.comparePassword(password)
      // const isPasswordValid = password === user.password
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The Password was incorrect'
        })
      }
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
      console.log('login!')
    } catch (err) {
      res.status(500).send({
        error: 'An error occured tring to login'
      })
      // email allready exists
    }
  }
}
