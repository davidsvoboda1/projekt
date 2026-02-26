const fs = require("fs");
const path = require("path");
const store = require("../storage/countries_Store");
const { handleApiCountries } = require("./apiCountries"); // Důležité pro funkčnost mazání/úprav

const VIEWS_DIR = path.join(__dirname, "..", "views");

function loadView(name) {
  return fs.readFileSync(path.join(VIEWS_DIR, name), "utf-8");
}

function render(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

function renderLayout({ title, heading, content }) {
  const layout = loadView("layout.html");
  return render(layout, { title, heading, content });
}

function sendHtml(res, html, status = 200) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function handlePages(req, res) {
  // 1. OBSLUHA STATICKÝCH SOUBORŮ (CSS, JS, FILTRY)
  if (req.url === "/public/styl.css") {
    const file = path.join(__dirname, "..", "public", "styl.css");
    const css = fs.readFileSync(file, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
    return res.end(css);
  }

  if (req.url === "/public/app.js") {
    const file = path.join(__dirname, "..", "public", "app.js");
    const js = fs.readFileSync(file, "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    return res.end(js);
  }

  // NOVÉ: Obsluha skriptu pro řazení/filtry
  if (req.url === "/public/filters.js") {
    const file = path.join(__dirname, "..", "public", "filters.js");
    const js = fs.readFileSync(file, "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    return res.end(js);
  }

  // 2. PROPOJENÍ S API (Mazání, Úpravy, Přidávání)
  if (req.url.startsWith("/api/")) {
    return handleApiCountries(req, res);
  }

  // 3. HLAVNÍ STRÁNKA S TABULKOU
  if (req.url === "/" && req.method === "GET") {
    const countries = store.getAll();

    const rows = countries.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.capital}</td>
        <td>${c.area}</td>
        <td>${c.population}</td>
        <td>
          <a href="/edit/${c.id}" class="btn-edit">Upravit</a>
          <button class="btn-delete" data-delete-id="${c.id}">Smazat</button>
        </td>
      </tr>
    `).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, {
      rows: rows || `<tr><td colspan="6">Žádná data.</td></tr>`
    });

    return sendHtml(res, renderLayout({ title: "Země Světa", heading: "", content }));
  }

  // 4. STRÁNKA PRO EDITACI
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const country = store.getById(id);

    if (!country) {
      res.writeHead(404);
      return res.end("Země nenalezena");
    }

    const editTpl = loadView("edit.html");
    const content = render(editTpl, {
      id: country.id,
      name: country.name,
      capital: country.capital,
      area: country.area,
      population: country.population
    });

    return sendHtml(res, renderLayout({ title: "Editace země", heading: "Upravit zemi", content }));
  }

  return false;
}

module.exports = { handlePages };