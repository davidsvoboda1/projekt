const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "countries.json");

function load() {
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getAll() {
  return load();
}

function getById(id) {
  return load().find(c => c.id === id) || null;
}

function create({ name, capital, area, population }) {
  const data = load();
  const newId = data.length ? Math.max(...data.map(c => c.id)) + 1 : 1;

  const country = { id: newId, name, capital, area, population };
  data.push(country);
  save(data);
  return country;
}

function update(id, patch) {
  const data = load();
  const index = data.findIndex(c => c.id === id);
  if (index === -1) return null;

  Object.assign(data[index], patch);
  save(data);
  return data[index];
}

function remove(id) {
  const data = load();
  const index = data.findIndex(c => c.id === id);
  if (index === -1) return null;

  const removed = data.splice(index, 1)[0];
  save(data);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };