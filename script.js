let allEpisodes = [];
let allEpisodesCache = {};
let allShows = [];

const errorLoadingMessage =
  "<p class='error-message'>Failed to load episodes. Please try again later.</p>";

function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='loading-message'>Loading shows, please wait...</p>";

  getAllShows().then((shows) => {
    if (shows.length === 0) return;

    allShows = shows;
    populateShowSelector(allShows);

    const defaultShowId = allShows[0].id;
    document.getElementById("showSelector").value = defaultShowId;
    loadShowEpisodes(defaultShowId);

    document
      .getElementById("showSelector")
      .addEventListener("change", handleShowSelection);
    document
      .getElementById("searchInput")
      .addEventListener("input", handleSearch);
    document
      .getElementById("episodeSelector")
      .addEventListener("change", handleEpisodeSelection);
  });
}

async function getAllShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const shows = await response.json();
    shows.sort((a, b) => a.name.localeCompare(b.name));
    return shows;
  } catch (error) {
    document.getElementById("root").innerHTML =
      "<p class='error-message'>Failed to load shows. Please try again later.</p>";
    return [];
  }
}

function populateShowSelector(shows) {
  const selector = document.getElementById("showSelector");
  selector.innerHTML = "";

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });
}

function handleShowSelection(event) {
  const showId = event.target.value;
  document.getElementById("searchInput").value = "";
  document.getElementById("episodeSelector").innerHTML =
    '<option value="all">Show all episodes</option>';
  loadShowEpisodes(showId);
}

async function loadShowEpisodes(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='loading-message'>Loading episodes, please wait...</p>";

  const episodes = await getEpisodesForShow(showId);
  if (episodes.length === 0)
    rootElem.innerHTML = "<p>No episodes found for this show.</p>";
  return;

  allEpisodes = episodes;
  makePageForEpisodes(allEpisodes);
  populateEpisodeSelector(allEpisodes);
  displayCount(allEpisodes.length);
}

async function getEpisodesForShow(showId) {
  if (allEpisodesCache[showId]) return allEpisodesCache[showId];

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const episodes = await response.json();
    allEpisodesCache[showId] = episodes;
    return episodes;
  } catch (error) {
    document.getElementById("root").innerHTML = errorLoadingMessage;
    return [];
  }
}

function parseEpisode(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedNumber = episode.number.toString().padStart(2, "0");

  return {
    name: episode.name,
    season: paddedSeason,
    number: paddedNumber,
    image: episode.image ? episode.image.medium : null,
    summary: episode.summary || "",
  };
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("article");
  episodeCard.classList.add("episode-card");

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - (S${episode.season}E${episode.number})`;
  episodeCard.appendChild(title);

  if (episode.image) {
    const image = document.createElement("img");
    image.src = episode.image;
    image.alt = `${episode.name} image`;
    episodeCard.appendChild(image);
  }

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
  return rootElem;
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

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = '<option value="all">Show all episodes</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");

    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;

    selector.appendChild(option);
  });
}

function handleEpisodeSelection(event) {
  const selectedValue = event.target.value;

  document.getElementById("searchInput").value = "";

  if (selectedValue === "all") {
    makePageForEpisodes(allEpisodes);
    displayCount(allEpisodes.length);
    return;
  }

  const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedValue);

  if (!selectedEpisode) return;

  makePageForEpisodes([selectedEpisode]);
  displayCount(1);
}

window.onload = setup;
