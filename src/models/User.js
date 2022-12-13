const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt'))

function hashPassword (user, options) {
  const SALT__FACTOR = 8

  if (!user.changed('password')) {
    return
  }

  return bcrypt
    .genSalt(SALT__FACTOR)
    .then(salt => bcrypt.hash(user.password, salt))
    .then(hash => {
      user.setDataValue('password', hash)
    })
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword
    }
  }
  )
  User.prototype.comparePassword = function (password) {
    // console.log('+++++ ', password, ' ', this.password)
    return bcrypt.compare(password, this.password)
  }

  return User
}
