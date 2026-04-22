let allEpisodes = [];
let allEpisodesCache = {};
let allShows = [];

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='loading-message'>Loading shows, please wait...</p>";

  allShows = await getAllShows();
  if (allShows.length === 0) return;

  populateShowSelector(allShows);

  const defaultShowId = allShows[0].id;
  document.getElementById("showSelector").value = defaultShowId;
  await loadShowEpisodes(defaultShowId);

  document
    .getElementById("showSelector")
    .addEventListener("change", handleShowSelection);
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("episodeSelector")
    .addEventListener("change", handleEpisodeSelection);
}

async function getAllShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const shows = await response.json();
    return shows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  } catch (error) {
    document.getElementById("root").innerHTML =
      "<p class='error-message'>Failed to load shows. Please try again later.</p>";
    return [];
  }
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
    document.getElementById("root").innerHTML =
      "<p class='error-message'>Failed to load episodes. Please try again later.</p>";
    return [];
  }
}

async function loadShowEpisodes(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='loading-message'>Loading episodes, please wait...</p>";

  const episodes = await getEpisodesForShow(showId);

  if (episodes.length === 0) {
    rootElem.innerHTML = "<p>No episodes found for this show.</p>";
    return;
  }

  allEpisodes = episodes;
  renderEpisodes(allEpisodes);
  populateEpisodeSelector(allEpisodes);
  displayCount(allEpisodes.length);
}

function getEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function populateShowSelector(shows) {
  const selector = document.getElementById("showSelector");
  selector.innerHTML = "";

  shows.forEach((show) => {
    selector.add(new Option(show.name, show.id));
  });
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = '<option value="all">Show all episodes</option>';

  episodes.forEach((episode) => {
    const code = getEpisodeCode(episode.season, episode.number);
    selector.add(new Option(`${code} - ${episode.name}`, episode.id));
  });
}

function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);
  rootElem.append(...episodeCards);
}

function createEpisodeCard(episode) {
  const episodeCard = document.createElement("article");
  episodeCard.classList.add("episode-card");

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - (${getEpisodeCode(episode.season, episode.number)})`;
  episodeCard.appendChild(title);

  if (episode.image?.medium) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `${episode.name} image`;
    episodeCard.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = episode.summary || "";
  episodeCard.appendChild(summary);

  return episodeCard;
}

function handleShowSelection(event) {
  document.getElementById("searchInput").value = "";
  document.getElementById("episodeSelector").innerHTML =
    '<option value="all">Show all episodes</option>';
  loadShowEpisodes(event.target.value);
}

function handleEpisodeSelection(event) {
  const selectedValue = event.target.value;
  document.getElementById("searchInput").value = "";

  if (selectedValue === "all") {
    renderEpisodes(allEpisodes);
    displayCount(allEpisodes.length);
    return;
  }

  const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedValue);
  if (selectedEpisode) {
    renderEpisodes([selectedEpisode]);
    displayCount(1);
  }
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

  renderEpisodes(filteredEpisodes);
  displayCount(filteredEpisodes.length);
}

function displayCount(count) {
  document.getElementById("countDisplay").textContent =
    `Displaying ${count} episodes`;
}

window.onload = setup;
