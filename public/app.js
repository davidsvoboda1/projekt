async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// CREATE (POST /api/users)
const createForm = document.getElementById("createForm");
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(createForm);
    const payload = {
      name: fd.get("nazev"),
      capital: fd.get("hlavni"),
      area: fd.get("rozloha"),
      population: Number(fd.get("pocet")),
    };

    try {
      await api("/api/countries", { method: "POST", body: JSON.stringify(payload) });
      window.location.reload();
    } catch (err) {
      alert("Chyba: " + JSON.stringify(err.data));
    }
  });
}

// EDIT (PUT /api/users/:id)
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editForm.dataset.id;
    const fd = new FormData(editForm);
    const payload = {
      name: fd.get("nazev"),
      capital: fd.get("hlavni"),
      area: fd.get("rozloha"),
      population: Number(fd.get("pocet")),
    };

    try {
      await api(`/api/countries/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      window.location.href = `/user/${id}`;
    } catch (err) {
      alert("Chyba: " + JSON.stringify(err.data));
    }
  });
}

// DELETE tlačítka (DELETE /api/users/:id)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-id]");
  if (!btn) return;

  const id = btn.dataset.deleteId;
  if (!confirm("Opravdu smazat zemi #" + id + "?")) return;

  try {
    await api(`/api/countries/${id}`, { method: "DELETE" });
    window.location.reload();
  } catch (err) {
    alert("Chyba: " + JSON.stringify(err.data));
  }
});
