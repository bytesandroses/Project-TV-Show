function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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

  const parsedEpisodes = episodeList.map(parseEpisode);
  const episodeCards = parsedEpisodes.map(createEpisodeCard);

  rootElem.append(...episodeCards);
  return rootElem;
}

window.onload = setup;
