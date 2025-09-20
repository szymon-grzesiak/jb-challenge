const API_URL =
  "https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4328&s=2024-2025";

async function fetchRankingData() {
  try {
    console.log("🔄 Pobieranie danych z API...");

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Dane pobrane:", data);
    console.log("Liczba drużyn:", data.table?.length);

    if (data.table && data.table[0]) {
      console.log("Przykład druzyny:", data.table[0]);
    }

    return data.table || [];
  } catch (error) {
    console.error("Błąd API:", error);
    throw error;
  }
}

export { fetchRankingData };
