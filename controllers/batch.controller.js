 const batchService = require("../services/batch.service");

async function saveBatch(req, res) {
    const result = await batchService.saveBatch(req.body);
    res.json(result);
}

module.exports = { saveBatch };