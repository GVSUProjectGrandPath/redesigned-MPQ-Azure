function showResultsPage() {
  document.querySelector(".QuizContainer").classList.remove("active");

  const resultsContainer = document.querySelector(".ResultsContainer");

  if (!resultsContainer) {
    console.error("ResultsContainer not found");
    return;
  }

  resultsContainer.classList.add("active");

  const debugResults = document.getElementById("debug-results");
  if (debugResults) {
    debugResults.textContent = JSON.stringify(totalPoints);
  }

  console.log("Quiz finished. Final points:", totalPoints);
}