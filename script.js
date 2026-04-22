let allEpisodes = [];
let allShows = [];
let episodeCache = {};

function setup() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", handleSearch);

  const episodeSelector = document.getElementById("episodeSelector");
  episodeSelector.addEventListener("change", handleSelection);

  const showSelector = document.getElementById("showSelector");
  showSelector.addEventListener("change", handleShowChange);

  fetchShows();
}

function fetchShows() {
  fetch("https://api.tvmaze.com/shows")
    .then((res) => res.json())
    .then((data) => {
      allShows = data;
      populateShowSelector(data);

      makePageForShows(data);
    });
}

function populateShowSelector(shows) {
  const selector = document.getElementById("showSelector");

  shows
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      selector.appendChild(option);
    });
}

function handleShowChange(event) {
  const showId = event.target.value;

  if (!showId) {
    makePageForShows(allShows);
    return;
  }

  loadEpisodes(showId);
}

function loadEpisodes(showId) {
  document.getElementById("searchInput").value = "";

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    updateUI();
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((res) => res.json())
    .then((data) => {
      episodeCache[showId] = data;
      allEpisodes = data;
      updateUI();
    });
}

function updateUI() {
  makePageForEpisodes(allEpisodes);

  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = '<option value="all">All Episodes</option>';

  populateSelector(allEpisodes);
  displayCount(allEpisodes.length);
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  document.getElementById("episodeSelector").value = "all";

  const filteredEpisodes = allEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm)
    );
  });

  makePageForEpisodes(filteredEpisodes);

  displayCount(filteredEpisodes.length);
}

function displayCount(count) {
  const countDisplay = document.getElementById("countDisplay");
  countDisplay.textContent = `Displaying ${count} episodes`;
}

function populateSelector(episodes) {
  const selector = document.getElementById("episodeSelector");

  episodes.forEach((episode) => {
    const option = document.createElement("option");

    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;

    selector.appendChild(option);
  });
}

function handleSelection(event) {
  const selectedValue = event.target.value;

  if (selectedValue === "all") {
    makePageForEpisodes(allEpisodes);
    displayCount(allEpisodes.length);
    return;
  }

  const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedValue);

  makePageForEpisodes([selectedEpisode]);
  displayCount(1);
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("article");
  episodeCard.classList.add("episode-card");

  const title = document.createElement("h2");
  const paddedSeason = String(episode.season).padStart(2, "0");
  const paddedNumber = String(episode.number).padStart(2, "0");
  title.textContent = `${episode.name} - (S${paddedSeason}E${paddedNumber})`;
  episodeCard.appendChild(title);

  const image = document.createElement("img");
  image.src = episode.image?.medium || "";
  image.alt = `${episode.name} image`;
  episodeCard.appendChild(image);

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = episode.summary || "";
  episodeCard.appendChild(summary);

  return episodeCard;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

function makePageForShows(showsList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const showCards = showsList.map(createShowCard);
  rootElem.append(...showCards);
}

function createShowCard(show) {
  const showCard = document.createElement("article");
  showCard.classList.add("show-card");

  const title = document.createElement("h2");
  title.textContent = show.name;

  title.style.cursor = "pointer";
  title.style.textDecoration = "underline";

  title.addEventListener("click", () => {
    document.getElementById("showSelector").value = show.id;

    loadEpisodes(show.id);
  });

  showCard.appendChild(title);

  const image = document.createElement("img");
  image.src = show.image ? show.image.medium : "";
  image.alt = `${show.name} image`;
  showCard.appendChild(image);

  const details = document.createElement("div");
  details.innerHTML = `
    <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
    <p><strong>Status:</strong> ${show.status}</p>
    <p><strong>Rating:</strong> ${show.rating.average}</p>
    <p><strong>Runtime:</strong> ${show.runtime} minutes</p>
  `;
  showCard.appendChild(details);

  const summary = document.createElement("div");
  summary.classList.add("show-summary");
  summary.innerHTML = show.summary || "";
  showCard.appendChild(summary);

  return showCard;
}

window.onload = setup;
