const store = require("../storage/countries_Store");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    try {
      cb(null, JSON.parse(body || "{}"));
    } catch (e) {
      cb(e);
    }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiCountries(req, res) {

  // GET /api/countries
  if (req.url === "/api/countries" && req.method === "GET") {
    const countries = store.getAll();
    return sendJson(res, 200, countries);
  }

  // POST /api/countries
  if (req.url === "/api/countries" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });

      const name = String(data.name || "").trim();
      const capital = String(data.capital || "").trim();
      const area = String(data.area || "").trim();
      const population = Number(data.population);

      if (!name || !capital || !area || Number.isNaN(population)) {
        return sendJson(res, 400, { error: "Chybí povinná data" });
      }

      const created = store.create({ name, capital, area, population });
      return sendJson(res, 201, created);
    });
  }

  // PUT /api/countries/:id
  if (req.url.startsWith("/api/countries/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    if (Number.isNaN(id)) return sendJson(res, 400, { error: "Neplatné ID" });

    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });

      const patch = {};
      if (data.name !== undefined) patch.name = String(data.name).trim();
      if (data.capital !== undefined) patch.capital = String(data.capital).trim();
      if (data.area !== undefined) patch.area = String(data.area).trim();
      if (data.population !== undefined) patch.population = Number(data.population);

      const updated = store.update(id, patch);
      if (!updated) return sendJson(res, 404, { error: "Země nenalezena" });

      return sendJson(res, 200, updated);
    });
  }

  // DELETE /api/countries/:id
  if (req.url.startsWith("/api/countries/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    if (Number.isNaN(id)) return sendJson(res, 400, { error: "Neplatné ID" });

    const removed = store.remove(id);
    if (!removed) return sendJson(res, 404, { error: "Země nenalezena" });

    return sendJson(res, 200, { message: "Země smazána", country: removed });
  }

  return false;
}

module.exports = { handleApiCountries };
