module.exports = {
  db: {
    database: process.env.DB_NAME || 'rosapp',
    user: process.env.DB_USER || 'rosapp',
    password: process.env.DB_PASS || 'rosapp',
    options: {
      dialect: process.env.DIALECT || 'sqlite',
      host: process.env.HOST || 'localhost',
      storage: './rosapp.sqlite'
    }
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret'
  }
}
