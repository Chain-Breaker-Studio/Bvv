const sampleListings = [
  {
    title: "Piso de 3 habitaciones en Patraix",
    location: "Patraix, Valencia",
    operation: "alquiler",
    price: 895,
    rooms: 3,
    size: 78,
    elevator: true,
    parking: true,
    condition: true,
    score: 96,
    source: "Ejemplo",
    url: "#"
  },
  {
    title: "Piso de 2 habitaciones en Campanar",
    location: "Campanar, Valencia",
    operation: "alquiler",
    price: 920,
    rooms: 2,
    size: 74,
    elevator: true,
    parking: false,
    condition: true,
    score: 88,
    source: "Ejemplo",
    url: "#"
  },
  {
    title: "Piso de 3 habitaciones en Jesús",
    location: "Jesús, Valencia",
    operation: "compra",
    price: 125000,
    rooms: 3,
    size: 82,
    elevator: true,
    parking: true,
    condition: true,
    score: 94,
    source: "Ejemplo",
    url: "#"
  }
];

let currentOperation = "alquiler";

const operationButtons = document.querySelectorAll(".operation");
const maxPrice = document.getElementById("maxPrice");
const priceUnit = document.getElementById("priceUnit");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const sortResults = document.getElementById("sortResults");

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

searchButton.addEventListener("click", searchListings);

sortResults.addEventListener("change", searchListings);

function searchListings() {
  const maximumPrice = Number(maxPrice.value);
  const minimumRooms = Number(document.getElementById("minRooms").value);
  const minimumSize = Number(document.getElementById("minSize").value);

  const needElevator = document.getElementById("elevator").checked;
  const needParking = document.getElementById("parking").checked;
  const needGoodCondition = document.getElementById("goodCondition").checked;

  let results = sampleListings.filter(listing => {

    if (currentOperation !== "opcion" &&
        listing.operation !== currentOperation) {
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

  const sortType = sortResults.value;

  if (sortType === "price") {
    results.sort((a, b) => a.price - b.price);
  }

  if (sortType === "size") {
    results.sort((a, b) => b.size - a.size);
  }

  if (sortType === "score") {
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
        <h3>No hay viviendas que cumplan todos los filtros</h3>
        <p>Prueba a ampliar ligeramente el precio, superficie o número de habitaciones.</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = results.map(listing => {

    const price = listing.operation === "alquiler"
      ? `${listing.price.toLocaleString("es-ES")} €/mes`
      : `${listing.price.toLocaleString("es-ES")} €`;

    return `
      <article class="result-card">

        <div class="result-top">

          <div>
            <div class="score-label">
              ⭐ ${getScoreLabel(listing.score)}
            </div>

            <h3>${listing.title}</h3>

            <div class="location">
              📍 ${listing.location}
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

          ${listing.elevator
            ? `<span class="badge">✓ Ascensor</span>`
            : ""}

          ${listing.parking
            ? `<span class="badge">✓ Garaje</span>`
            : ""}

          ${listing.condition
            ? `<span class="badge">✓ Buen estado</span>`
            : ""}

        </div>

        <a
          class="view-button"
          href="${listing.url}"
          target="_blank"
          rel="noopener">
          Ver anuncio original
        </a>

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
