document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".mreza-data");
    const headers = table.querySelectorAll("thead th");
    const tbody = table.querySelector("tbody");

    headers.forEach((header, index) => {
        // Přidáme ikonku a kurzor k těm sloupcům, které chceme řadit
        if (index => 0 && index < 5) { 
            header.style.cursor = "pointer";
            header.innerHTML += ' <span class="sort-icon">↕</span>';

            header.addEventListener("click", () => {
                const rows = Array.from(tbody.querySelectorAll("tr"));
                const isNumeric = index === 3 || index === 4; // Rozloha a Populace jsou čísla
                const currentIsAsc = header.classList.contains("sort-asc");

                // Samotné řazení
                rows.sort((rowA, rowB) => {
                    let valA = rowA.cells[index].innerText.trim();
                    let valB = rowB.cells[index].innerText.trim();

                    if (isNumeric) {
                        valA = parseFloat(valA.replace(/[^\d.-]/g, '')) || 0;
                        valB = parseFloat(valB.replace(/[^\d.-]/g, '')) || 0;
                        return currentIsAsc ? valB - valA : valA - valB;
                    }

                    return currentIsAsc 
                        ? valB.localeCompare(valA) 
                        : valA.localeCompare(valB);
                });

                // Vyčištění ikonek a přepnutí třídy
                headers.forEach(h => {
                    h.classList.remove("sort-asc", "sort-desc");
                    const icon = h.querySelector(".sort-icon");
                    if (icon) icon.innerText = "↕";
                });

                if (currentIsAsc) {
                    header.classList.add("sort-desc");
                    header.querySelector(".sort-icon").innerText = "↑";
                } else {
                    header.classList.add("sort-asc");
                    header.querySelector(".sort-icon").innerText = "↓";
                }

                // Vložení seřazených řádků zpět do tabulky
                tbody.append(...rows);
            });
        }
    });
});