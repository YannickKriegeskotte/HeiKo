let db = null;

function setDB(database) {
  db = database;
}

function getDB() {
  if (!db) {
    throw new Error("DB wurde noch nicht initialisiert");
  }

  return db;
}

module.exports = {
  setDB,
  getDB,
};