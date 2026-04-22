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

      // 👇 AUTO LOAD FIRST SHOW
      const firstShow = data[0];
      loadEpisodes(firstShow.id);

      // 👇 set dropdown to match selected show
      document.getElementById("showSelector").value = firstShow.id;
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
  if (!showId) return;

  loadEpisodes(showId);
}

function loadEpisodes(showId) {
  // reset search input
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

function parseEpisode(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedNumber = episode.number.toString().padStart(2, "0");

  return {
    name: episode.name,
    season: paddedSeason,
    number: paddedNumber,
    image: episode.image?.medium || "",
    summary: episode.summary || "",
  };
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("article");
  episodeCard.classList.add("episode-card");

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - (S${episode.season}E${episode.number})`;
  episodeCard.appendChild(title);

  const image = document.createElement("img");
  image.src = episode.image;
  image.alt = `${episode.name} image`;
  episodeCard.appendChild(image);

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = episode.summary;
  episodeCard.appendChild(summary);

  return episodeCard;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const parsedEpisodes = episodeList.map(parseEpisode);
  const episodeCards = parsedEpisodes.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

window.onload = setup;
