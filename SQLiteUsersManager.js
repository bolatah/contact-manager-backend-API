const sqlite3 = require("sqlite3");
require("dotenv").config();

const db = new sqlite3.Database(process.env.DBUsers);

module.exports = class SQLiteUsersManager {
  constructor() {
    this.init();
  }
  init() {
    db.run(`
    CREATE TABLE IF NOT EXISTS
        users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL CHECK(username<>''),
            password TEXT NOT NULL CHECK(password<>'')
        )`);
  }
  async addUser(user) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT
                INTO users(username, password)
                VALUES(?,?)`,
        [user.username, user.password],
        function () {
          resolve(this.lastID);
        }
      );
    });
  }

  async getUser(username) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE username=?`,
        [username],
        (error, row) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id=?`, [id], (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUsers() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", [], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  }
};
