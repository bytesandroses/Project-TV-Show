//You can edit ALL of the code here
function setup() {
  const singleEpisode = parseEpisode(getOneEpisode());
  const episodeCard = createEpisodeCard(singleEpisode);
  document.body.append(episodeCard);
}

function parseEpisode(episode) {
  return {
    name: episode.name,
    season: episode.season,
    number: episode.number,
    episode: episode.episode,
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
  episodeCard.appendChild(image);

  const summary = document.createElement("p");
  summary.innerHTML = episode.summary;
  episodeCard.appendChild(summary);

  return episodeCard;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;
