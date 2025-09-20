import { fetchRankingData } from "./api.js";

const tableContent = document.getElementById("table-content");
const skeleton = document.getElementById("skeleton");
const errorState = document.getElementById("error-state");
const retryBtn = document.getElementById("retry-btn");
const searchInput = document.getElementById("team-search");
const searchWrapper = document.getElementById("search-wrapper");
const clearButton = document.getElementById("clear-search");
const searchInputMobile = document.getElementById("team-search-mobile");
const searchWrapperMobile = document.getElementById("search-wrapper-mobile");
const clearButtonMobile = document.getElementById("clear-search-mobile");

console.log("🔍 DOM Elements:");
console.log("tableContent:", tableContent);
console.log("skeleton:", skeleton);
console.log("searchInput:", searchInput);

let allTeams = [];
let filteredTeams = [];
let hasScrolled = false;
let currentSearchQuery = "";
let searchTimeout = null;

function renderTeamRow(team) {
  const performance = calculatePerformance(team);

  return `
    <div class="ranking-table__card">
      <div class="ranking-table__main">
        <div class="ranking-table__rank-container">
          <div class="ranking-table__rank-badge${
            team.intRank > 3 ? " ranking-table__rank-badge--secondary" : ""
          }">${team.intRank}</div>
        </div>
        
        <div class="ranking-table__content-area">
          <div class="ranking-table__left-content">
            <div class="ranking-table__team">
              <img src="${team.strBadge}" alt="${team.strTeam}" loading="lazy">
              <span>${team.strTeam}</span>
            </div>
            
            <div class="ranking-table__performance">
              <div class="ranking-table__chart">
                ${renderPerformanceChart(performance)}
              </div>
              
              <div class="ranking-table__stats">
                <div class="ranking-table__stats-item">
                  <span>W:</span>
                  <span>${performance.wins}</span>
                </div>
                <div class="ranking-table__stats-item">
                  <span>D:</span>
                  <span>${performance.draws}</span>
                </div>
                <div class="ranking-table__stats-item">
                  <span>L:</span>
                  <span>${performance.losses}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ranking-table__points">
            <span>${team.intPoints}</span>
            <span>PTS</span>
          </div>
        </div>
      </div>
      
      <div class="ranking-table__details">
        <div class="ranking-table__form-section">
          <div class="ranking-table__form-section-label">Form:</div>
          <div class="ranking-table__form-section-badges">
            ${renderFormBadges(team.strForm)}
          </div>
        </div>
        
        <div class="ranking-table__goals-section">
          <div class="ranking-table__goals-section-item">
            <div class="ranking-table__goals-section-item-label">Goals for:</div>
            <div class="ranking-table__goals-section-item-value">${
              team.intGoalsFor || 0
            }</div>
          </div>
          <div class="ranking-table__goals-section-item">
            <div class="ranking-table__goals-section-item-label">Goals against:</div>
            <div class="ranking-table__goals-section-item-value">${
              team.intGoalsAgainst || 0
            }</div>
          </div>
          <div class="ranking-table__goals-section-item">
            <div class="ranking-table__goals-section-item-label">Goals difference:</div>
            <div class="ranking-table__goals-section-item-value">${
              (team.intGoalsFor || 0) - (team.intGoalsAgainst || 0)
            }</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculatePerformance(team) {
  const played = team.intPlayed || 10;
  const wins = team.intWin || 0;
  const draws = team.intDraw || 0;
  const losses = team.intLoss || 0;

  return { wins, draws, losses, played };
}

function renderPerformanceChart(performance) {
  const { wins, draws, losses, played } = performance;
  let segments = "";

  for (let i = 0; i < wins; i++) {
    segments +=
      '<div class="ranking-table__chart-segment ranking-table__chart-segment--win"></div>';
  }

  for (let i = 0; i < draws; i++) {
    segments +=
      '<div class="ranking-table__chart-segment ranking-table__chart-segment--draw"></div>';
  }

  for (let i = 0; i < losses; i++) {
    segments +=
      '<div class="ranking-table__chart-segment ranking-table__chart-segment--loss"></div>';
  }

  const remaining = Math.max(0, 10 - (wins + draws + losses));
  for (let i = 0; i < remaining; i++) {
    segments +=
      '<div class="ranking-table__chart-segment ranking-table__chart-segment--draw"></div>';
  }

  return segments;
}

function renderFormBadges(formString) {
  if (!formString)
    return '<div class="ranking-table__form-badge ranking-table__form-badge--draw">-</div>';

  return formString
    .split("")
    .slice(-5)
    .reverse()
    .map((result) => {
      const className =
        result === "W" ? "win" : result === "L" ? "loss" : "draw";
      return `<div class=\"ranking-table__form-badge ranking-table__form-badge--${className}\">${result}</div>`;
    })
    .join("");
}

function renderForm(formString) {
  return renderFormBadges(formString);
}

function renderTable(teams) {
  if (!teams || teams.length === 0) {
    tableContent.innerHTML =
      '<div class="placeholder" role="status" aria-live="polite"><div class="placeholder__icon">' +
      '</div><div class="placeholder__text">No teams to display</div></div>';
    return;
  }

  const rowsHTML = teams.map(renderTeamRow).join("");
  tableContent.innerHTML = rowsHTML;
}

async function loadData() {
  try {
    showSkeleton();

    const teams = await fetchRankingData();
    allTeams = teams;
    filteredTeams = teams;

    hideSkeleton();
    renderTable(teams);

    console.log("✅ Tabela załadowana:", teams.length, "drużyn");
  } catch (error) {
    console.error("❌ Błąd ładowania:", error);
    hideSkeleton();
    showError();
  }
}

function showSkeleton() {
  skeleton.style.display = "block";
  tableContent.style.display = "none";
  errorState.style.display = "none";
}

function hideSkeleton() {
  skeleton.style.display = "none";
  tableContent.style.display = "";
}

function showError() {
  skeleton.style.display = "none";
  tableContent.style.display = "none";
  errorState.style.display = "block";
  errorState.innerHTML = `
    <div class="placeholder" role="alert" aria-live="assertive">
      <div class="placeholder__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
          <path d="M24.499 34C24.9663 34 25.3583 33.842 25.675 33.526C25.9917 33.21 26.15 32.8183 26.15 32.351C26.15 31.8837 25.992 31.4917 25.676 31.175C25.36 30.8583 24.9683 30.7 24.501 30.7C24.0337 30.7 23.6417 30.858 23.325 31.174C23.0083 31.49 22.85 31.8817 22.85 32.349C22.85 32.8163 23.008 33.2083 23.324 33.525C23.64 33.8417 24.0317 34 24.499 34ZM23.15 26.35H26.15V13.7H23.15V26.35ZM24.5135 44C21.7555 44 19.1638 43.475 16.7385 42.425C14.3128 41.375 12.1917 39.9417 10.375 38.125C8.55833 36.3083 7.125 34.186 6.075 31.758C5.025 29.33 4.5 26.7357 4.5 23.975C4.5 21.2143 5.025 18.62 6.075 16.192C7.125 13.764 8.55833 11.65 10.375 9.85C12.1917 8.05 14.314 6.625 16.742 5.575C19.17 4.525 21.7643 4 24.525 4C27.2857 4 29.88 4.525 32.308 5.575C34.736 6.625 36.85 8.05 38.65 9.85C40.45 11.65 41.875 13.7667 42.925 16.2C43.975 18.6333 44.5 21.2288 44.5 23.9865C44.5 26.7445 43.975 29.3362 42.925 31.7615C41.875 34.1872 40.45 36.3053 38.65 38.116C36.85 39.9263 34.7333 41.3597 32.3 42.416C29.8667 43.472 27.2712 44 24.5135 44ZM24.525 41C29.2417 41 33.25 39.3417 36.55 36.025C39.85 32.7083 41.5 28.6917 41.5 23.975C41.5 19.2583 39.8532 15.25 36.5595 11.95C33.2658 8.65 29.246 7 24.5 7C19.8 7 15.7917 8.64683 12.475 11.9405C9.15833 15.2342 7.5 19.254 7.5 24C7.5 28.7 9.15833 32.7083 12.475 36.025C15.7917 39.3417 19.8083 41 24.525 41Z" fill="#F45B69"/>
        </svg>
      </div>
      <div class="placeholder__text">There was a problem. Please try again later.</div>
      <button id="retry-btn" type="button">Try again</button>
    </div>`;
}

function searchTeams(query) {
  const searchQuery = query.toLowerCase().trim();
  currentSearchQuery = query;

  if (!searchQuery) {
    filteredTeams = allTeams;
  } else {
    filteredTeams = allTeams.filter((team) =>
      team.strTeam.toLowerCase().includes(searchQuery)
    );
  }

  if (filteredTeams.length === 0) {
    tableContent.innerHTML = `
      <div class="placeholder" role="status" aria-live="polite">
        <div class="placeholder__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="48" viewBox="0 0 49 48" fill="none">
            <path d="M24.5 44C21.7667 44 19.1833 43.475 16.75 42.425C14.3167 41.375 12.1917 39.9417 10.375 38.125C8.55833 36.3083 7.125 34.1833 6.075 31.75C5.025 29.3167 4.5 26.7333 4.5 24C4.5 21.2333 5.025 18.6417 6.075 16.225C7.125 13.8083 8.55833 11.6917 10.375 9.875C12.1917 8.05833 14.3167 6.625 16.75 5.575C19.1833 4.525 21.7667 4 24.5 4C27.2667 4 29.8583 4.525 32.275 5.575C34.6917 6.625 36.8083 8.05833 38.625 9.875C40.4417 11.6917 41.875 13.8083 42.925 16.225C43.975 18.6417 44.5 21.2333 44.5 24C44.5 26.7333 43.975 29.3167 42.925 31.75C41.875 34.1833 40.4417 36.3083 38.625 38.125C36.8083 39.9417 34.6917 41.375 32.275 42.425C29.8583 43.475 27.2667 44 24.5 44ZM34.75 19.35L38.2 18.15L39.1 14.95C37.9667 13.1833 36.5667 11.675 34.9 10.425C33.2333 9.175 31.35 8.21667 29.25 7.55L26 9.7V13.2L34.75 19.35ZM14.3 19.35L23 13.2V9.7L19.8 7.55C17.7 8.21667 15.8167 9.175 14.15 10.425C12.4833 11.675 11.0833 13.183 9.95 14.95L11.05 18.15L14.3 19.35ZM11.6 35.35L14.6 35L16.55 31.75L13.45 22.2L9.9 21L7.5 22.95C7.5 25.35 7.76667 27.5417 8.3 29.525C8.83333 31.5083 9.93333 33.45 11.6 35.35ZM24.5 41C25.4 41 26.3083 40.9167 27.225 40.75C28.1417 40.5833 29.1 40.3667 30.1 40.1L31.75 36.5L30.15 33.75H18.9L17.3 36.5L18.95 40.1C19.8167 40.3667 20.7333 40.5833 21.7 40.75C22.6667 40.9167 23.6 41 24.5 41ZM19.2 30.75H29.6L32.65 21.6L24.5 15.75L16.2 21.6L19.2 30.75ZM37.45 35.35C39.0833 33.45 40.1667 31.5083 40.7 29.525C41.2333 27.5417 41.5 25.35 41.5 22.95L39.1 21.3L35.6 22.2L32.5 31.75L34.4 35L37.45 35.35Z" fill="#CBD5E1"/>
          </svg>
        </div>
        <div class="placeholder__text">No teams found matching "${query.replace(
          /"/g,
          "&quot;"
        )}"</div>
      </div>`;
  } else {
    renderTable(filteredTeams);
  }
}

retryBtn?.addEventListener("click", loadData);
document.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.id === "retry-btn") {
    loadData();
  }
});

function updateSearchWrapperState() {
  const hasValue = (el) => !!el && el.value.trim().length > 0;
  if (searchWrapper) {
    searchWrapper.classList.toggle(
      "search-bar__wrapper--has-value",
      hasValue(searchInput)
    );
  }
  if (searchWrapperMobile) {
    searchWrapperMobile.classList.toggle(
      "search-bar__wrapper--has-value",
      hasValue(searchInputMobile)
    );
  }
}

function debouncedSearch(query, syncInput) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    searchTeams(query);
    if (syncInput) {
      syncInput.value = query;
    }
    updateSearchWrapperState();
  }, 300);
}

searchInput?.addEventListener("input", (e) => {
  debouncedSearch(e.target.value, searchInputMobile);
});

searchInputMobile?.addEventListener("input", (e) => {
  debouncedSearch(e.target.value, searchInput);
});

clearButton?.addEventListener("click", () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  if (searchInput) searchInput.value = "";
  if (searchInputMobile) searchInputMobile.value = "";
  updateSearchWrapperState();
  filteredTeams = allTeams;
  renderTable(filteredTeams);
  searchInput?.focus();
});

clearButtonMobile?.addEventListener("click", () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  if (searchInput) searchInput.value = "";
  if (searchInputMobile) searchInputMobile.value = "";
  updateSearchWrapperState();
  filteredTeams = allTeams;
  renderTable(filteredTeams);
  searchInputMobile?.focus();
});

window.addEventListener("scroll", () => {
  if (!hasScrolled) {
    hasScrolled = true;
    loadData();
  }
});

updateSearchWrapperState();

console.log("🚀 Ranking app ready (waiting for first scroll to load data)");

export { loadData, searchTeams };
