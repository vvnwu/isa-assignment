const util = require('util');
const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'bb91a6cf8850d5',
    password: 'def80860',
    database: 'heroku_e79a096b4ae9ae5'
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})

pool.query = util.promisify(pool.query)
module.exports = pool