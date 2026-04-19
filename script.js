let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", handleSearch);

  const selector = document.getElementById("episodeSelector");
  selector.addEventListener("change", handleSelection);

  populateSelector(allEpisodes);

  displayCount(allEpisodes.length);
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

window.onload = setup;
