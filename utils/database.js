require('dotenv').config();
const mysql = require('mysql2/promise');

async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('Connected to MySQL!');
        return connection;
    } catch (err) {
        console.error('Connection failed!', err.message);
        throw err;
    }
}

module.exports = connectDB;
