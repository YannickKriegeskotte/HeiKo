const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "../data.db");

async function initDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

module.exports = { initDB };