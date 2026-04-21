let allEpisodes = [];
let allEpisodesCache = null;

function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='loading-message'>Loading episodes, please wait...</p>";

  getAllEpisodes().then((episodes) => {
    allEpisodes = episodes;
    makePageForEpisodes(allEpisodes);
    populateSelector(allEpisodes);
    displayCount(allEpisodes.length);

    document
      .getElementById("searchInput")
      .addEventListener("input", handleSearch);
    document
      .getElementById("episodeSelector")
      .addEventListener("change", handleSelection);
  });
}

function parseEpisode(episode) {
  const paddedSeason = episode.season.toString().padStart(2, "0");
  const paddedNumber = episode.number.toString().padStart(2, "0");

  return {
    name: episode.name,
    season: paddedSeason,
    number: paddedNumber,
    image: episode.image.medium,
    summary: episode.summary,
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
  return rootElem;
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
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
    return;
  }

  const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedValue);
  makePageForEpisodes([selectedEpisode]);
  displayCount(1);
}

async function getAllEpisodes() {
  if (allEpisodesCache !== null) return allEpisodesCache;
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allEpisodesCache = await response.json();
    return allEpisodesCache;
  } catch (error) {
    alert("Failed to fetch episodes. Please try again later.");
    return [];
  }
}

window.onload = setup;
