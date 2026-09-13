const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const maxPrice = document.getElementById("maxPrice");
const priceUnit = document.getElementById("priceUnit");
const sortResults = document.getElementById("sortResults");
const searchButton = document.getElementById("searchButton");

let currentOperation = "alquiler";
let allListings = [];

const operationButtons = document.querySelectorAll(".operation");

operationButtons.forEach(button => {
  button.addEventListener("click", () => {
    operationButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentOperation = button.dataset.operation;

    if (currentOperation === "alquiler") {
      maxPrice.value = 1000;
      priceUnit.textContent = "€/mes";
    } else {
      maxPrice.value = 130000;
      priceUnit.textContent = "€";
    }
  });
});

searchButton.addEventListener("click", filterListings);
sortResults.addEventListener("change", filterListings);

async function loadListings() {
  try {
    const response = await fetch("datos.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar datos.json");
    }

    const data = await response.json();

    allListings = Array.isArray(data.anuncios)
      ? data.anuncios
      : [];

    if (data.actualizado) {
      resultCount.textContent =
        `Datos actualizados: ${data.actualizado}`;
    }

  } catch (error) {

    console.error(error);

    resultCount.textContent =
      "No se han podido cargar los datos.";

  }
}

function filterListings() {

  const maximumPrice = Number(maxPrice.value);
  const minimumRooms =
    Number(document.getElementById("minRooms").value);

  const minimumSize =
    Number(document.getElementById("minSize").value);

  const needElevator =
    document.getElementById("elevator").checked;

  const needParking =
    document.getElementById("parking").checked;

  const needGoodCondition =
    document.getElementById("goodCondition").checked;

  let results = allListings.filter(listing => {

    if (
      currentOperation !== "opcion" &&
      listing.operation !== currentOperation
    ) {
      return false;
    }

    if (listing.price > maximumPrice) {
      return false;
    }

    if (listing.rooms < minimumRooms) {
      return false;
    }

    if (listing.size < minimumSize) {
      return false;
    }

    if (needElevator && !listing.elevator) {
      return false;
    }

    if (needParking && !listing.parking) {
      return false;
    }

    if (needGoodCondition && !listing.condition) {
      return false;
    }

    return true;
  });

  if (sortResults.value === "price") {
    results.sort((a, b) => a.price - b.price);
  }

  if (sortResults.value === "size") {
    results.sort((a, b) => b.size - a.size);
  }

  if (sortResults.value === "score") {
    results.sort((a, b) => b.score - a.score);
  }

  displayResults(results);
}

function displayResults(results) {

  resultCount.textContent =
    results.length === 1
      ? "1 vivienda encontrada"
      : `${results.length} viviendas encontradas`;

  if (results.length === 0) {

    resultsContainer.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔍</div>
        <h3>No hay viviendas que cumplan los filtros</h3>
        <p>
          Cuando tengamos anuncios reales, aquí aparecerán
          las mejores coincidencias.
        </p>
      </div>
    `;

    return;
  }

  resultsContainer.innerHTML = results.map(listing => {

    const price =
      listing.operation === "alquiler"
        ? `${Number(listing.price).toLocaleString("es-ES")} €/mes`
        : `${Number(listing.price).toLocaleString("es-ES")} €`;

    return `
      <article class="result-card">

        <div class="result-top">

          <div>

            <div class="score-label">
              ⭐ ${getScoreLabel(listing.score)}
            </div>

            <h3>${escapeHtml(listing.title)}</h3>

            <div class="location">
              📍 ${escapeHtml(listing.location)}
            </div>

          </div>

          <div class="score">
            ${listing.score}/100
          </div>

        </div>

        <div class="details">

          <div class="detail">
            💶 ${price}
          </div>

          <div class="detail">
            🛏️ ${listing.rooms} habitaciones
          </div>

          <div class="detail">
            📐 ${listing.size} m²
          </div>

        </div>

        <div class="badges">

          ${
            listing.elevator
              ? `<span class="badge">✓ Ascensor</span>`
              : ""
          }

          ${
            listing.parking
              ? `<span class="badge">✓ Garaje</span>`
              : ""
          }

          ${
            listing.condition
              ? `<span class="badge">✓ Buen estado</span>`
              : ""
          }

        </div>

        ${
          listing.url
            ? `
              <a
                class="view-button"
                href="${escapeAttribute(listing.url)}"
                target="_blank"
                rel="noopener noreferrer">
                Ver anuncio original
              </a>
            `
            : ""
        }

      </article>
    `;

  }).join("");
}

function getScoreLabel(score) {

  if (score >= 95) {
    return "OPORTUNIDAD EXCELENTE";
  }

  if (score >= 90) {
    return "MUY BUENA OPCIÓN";
  }

  if (score >= 80) {
    return "INTERESANTE";
  }

  return "PARA REVISAR";
}

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

loadListings();
