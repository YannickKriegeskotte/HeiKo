const timeService = require("../services/time.service");

async function save(req, res) {
  try {
    const result = await timeService.save(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "DB Fehler" });
  }
}

async function latest(req, res) {
  const data = await timeService.latest(req.query);
  res.json(data);
}

async function all(req, res) {
  const data = await timeService.all();
  res.json(data);
}

async function previous(req, res) {
  const data = await timeService.previous(req.query);
  res.json(data);
}

module.exports = {
  save,
  latest,
  all,
  previous
}; 