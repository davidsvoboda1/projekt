const fs = require("fs");
const path = require("path");
const store = require("../storage/usersStore");

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
  // GET /public/app.js
  if (req.url === "/public/app.js" && req.method === "GET") {
    const file = path.join(__dirname, "..", "public", "app.js");
    const js = fs.readFileSync(file, "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    return res.end(js);
  }

  // GET /
if (req.url === "/" && req.method === "GET") {
  const users = store.getAll();

  const rows = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td><a href="/user/${u.id}">${u.name}</a></td>
      <td>${u.age}</td>
      <td>
        <a href="/user/${u.id}">Detail</a>
        <a href="/edit/${u.id}">Upravit</a>
        <button data-delete-id="${u.id}">Smazat</button>
      </td>
    </tr>
  `).join("");

  const indexTpl = loadView("index.html");
  const content = render(indexTpl, {
    rows: rows || `<tr><td colspan="4">Žádná data.</td></tr>`
  });

  return sendHtml(
    res,
    renderLayout({
      title: "Uživatelé",
      heading: "Správa uživatelů",
      content
    })
  );
}


  // GET /user/:id (detail)
  if (req.url.startsWith("/user/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const user = store.getById(id);
    if (!user) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Uživatel nenalezen." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("detail.html");
    const content = render(tpl, user);
    return sendHtml(res, renderLayout({ title: "Detail", heading: "Detail uživatele", content }));
  }

  // GET /edit/:id (edit formulář)
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const user = store.getById(id);

    if (!user) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message: "Uživatel nenalezen." });
      return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
    }

    const tpl = loadView("edit.html");
    const content = render(tpl, user);
    return sendHtml(res, renderLayout({ title: "Editace", heading: "Editace uživatele", content }));
  }

  return false;
}

module.exports = { handlePages };
