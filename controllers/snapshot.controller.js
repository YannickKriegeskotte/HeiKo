const snapshotService = require("../services/snapshot.service");

async function save(req, res) {
  const result = await snapshotService.save(req.params.type, req.body);
  res.json(result);
}

async function get(req, res) {
  const result = await snapshotService.get(req.params.type, req.query);
  res.json(result);
}

async function all(req, res) {
  const result = await snapshotService.all(req.params.type, req.query);
  res.json(result);
}

async function remove(req, res) {
  const result = await snapshotService.remove(req.params.type, req.body);
  res.json(result);
}

module.exports = { save, get, all, remove };