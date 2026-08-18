function showResultsPage() {
    // Hide quiz
    document.querySelector(".QuizContainer").classList.remove("active");

    // Show results page
    const resultsContainer = document.querySelector(".ResultsContainer");

    if (!resultsContainer) {
        console.error("ResultsContainer not found");
        return;
    }

    resultsContainer.classList.add("active");

    // Allow scrolling on results page
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    showResults();
}


// =====================================================
// RESULT CALCULATION + DISPLAY
// =====================================================

function showResults() {
    let maxPoints = -Infinity;
    let personalityType = "";

    // Find personality with highest score
    for (const type in totalPoints) {
        if (totalPoints[type] > maxPoints) {
            maxPoints = totalPoints[type];
            personalityType = type;
        }
    }

    // Save globally for download / other actions
    window.userPersonalityType = personalityType;

    const personalityData =
        personalitiesData.descriptions[personalityType];

    if (!personalityData) {
        console.error(
            "No personality data found for:",
            personalityType
        );
        return;
    }

    // ===============================
    // WINNER HEADER
    // ===============================

    const resultHeader =
        document.getElementById("result-header");

    if (resultHeader) {
        resultHeader.textContent =
            `You are most similar to the ${capitalize(personalityData.animal)}`;
    }


    // ===============================
    // WINNER IMAGE
    // ===============================

    const imageMap = {
        saver:
            "./src/assets/Animal_resultbar/Squirrel_Result.png",

        lavish:
            "./src/assets/Animal_resultbar/Poodle_Result.png",

        investor:
            "./src/assets/Animal_resultbar/Owl_Result.png",

        hustler:
            "./src/assets/Animal_resultbar/Bee_Result.png",

        "risk-taker":
            "./src/assets/Animal_resultbar/Rabbit_Result.png",

        defensive:
            "./src/assets/Animal_resultbar/Armadillo_Result.png",

        shopper:
            "./src/assets/Animal_resultbar/Octopus_Result.png",

        indifferent:
            "./src/assets/Animal_resultbar/Panda_Result.png"
    };


    const winnerImage =
        document.getElementById("polaroid-animal-image");

    if (winnerImage) {
        winnerImage.src = imageMap[personalityType];
        winnerImage.alt =
            `${capitalize(personalityData.animal)} personality`;
    }


    // ===============================
    // CALCULATE PERCENTAGES
    // ===============================

    const total = getTotalPoints();

    const sortedTypes =
        Object.keys(totalPoints)
            .map(type => {

                const percentage =
                    total > 0
                        ? (totalPoints[type] / total) * 100
                        : 0;

                return {
                    type,
                    percentage
                };

            })
            .sort(
                (a, b) =>
                    b.percentage - a.percentage
            );


    // ===============================
    // CREATE RESULT BUTTONS
    // ===============================

    const detailedResults =
        document.getElementById("detailed-results");

    if (detailedResults) {

        detailedResults.innerHTML = "";

        sortedTypes.forEach(({ type, percentage }) => {

            const data = personalitiesData.descriptions[type];
            if (!data) return;

            const button = document.createElement("button");
            button.classList.add("result-score-button");

            const animalName = capitalize(data.animal);

            button.innerHTML = `
                <span class="result-score-text">
                    ${animalName}: ${percentage.toFixed(2)}%
                </span>
            `;

            // ===========================
            // BAR WIDTH BASED ON PERCENTAGE
            // ===========================

            const highestPercentage = sortedTypes[0].percentage;

            // winner = 100% width
            // everyone else proportional to winner
            const relativeWidth =
                highestPercentage > 0
                    ? (percentage / highestPercentage) * 100
                    : 100;

            // don't allow tiny unreadable bars
            const finalWidth = 55 + (relativeWidth * 0.45);

            button.style.width = `${finalWidth}%`;


            // Winning personality
            if (type === personalityType) {
                button.classList.add("active");

                const eye = document.createElement("i");
                eye.className = "fa-solid fa-eye result-eye";

                button.appendChild(eye);
            }


            button.addEventListener("click", () => {

                showPersonalityDetails(type);

                document
                    .querySelectorAll(".result-score-button")
                    .forEach(btn => {

                        btn.classList.remove("active");

                        const eye =
                            btn.querySelector(".result-eye");

                        if (eye) {
                            eye.remove();
                        }
                    });

                button.classList.add("active");

                const eye =
                    document.createElement("i");

                eye.className =
                    "fa-solid fa-eye result-eye";

                button.appendChild(eye);
            });


            detailedResults.appendChild(button);
        });
    }


    // Show winner details initially
    showPersonalityDetails(personalityType);

    console.log(
        "Winner:",
        personalityType
    );

    console.log(
        "Final scores:",
        totalPoints
    );
}


// =====================================================
// PERSONALITY DETAILS
// =====================================================

function showPersonalityDetails(personalityType) {

    const data =
        personalitiesData.descriptions[
            personalityType
        ];

    if (!data) return;


    // Description
    const description =
        document.getElementById(
            "descriptionText"
        );

    if (description) {
        description.textContent =
            data.description;
    }


    // Lists
    injectList(
        "advantagesList",
        data.advantages
    );

    injectList(
        "disadvantagesList",
        data.disadvantages
    );

    injectList(
        "motivatorsList",
        data.motivators
    );

    injectList(
        "demotivatorsList",
        data.demotivators
    );


    // Update main animal image
    const imageMap = {
        saver:
            "./src/assets/Animal_resultbar/Squirrel_Result.png",

        lavish:
            "./src/assets/Animal_resultbar/Poodle_Result.png",

        investor:
            "./src/assets/Animal_resultbar/Owl_Result.png",

        hustler:
            "./src/assets/Animal_resultbar/Bee_Result.png",

        "risk-taker":
            "./src/assets/Animal_resultbar/Rabbit_Result.png",

        defensive:
            "./src/assets/Animal_resultbar/Armadillo_Result.png",

        shopper:
            "./src/assets/Animal_resultbar/Octopus_Result.png",

        indifferent:
            "./src/assets/Animal_resultbar/Panda_Result.png"
    };


    const resultImage =
        document.getElementById(
            "polaroid-animal-image"
        );

    if (resultImage) {
        resultImage.src =
            imageMap[personalityType];

        resultImage.alt =
            capitalize(data.animal);
    }
}


// =====================================================
// LIST HELPER
// =====================================================

function injectList(id, items) {

    const ul =
        document.getElementById(id);

    if (!ul) return;

    ul.innerHTML = "";

    items.forEach(item => {

        const li =
            document.createElement("li");

        li.textContent = item;

        ul.appendChild(li);
    });
}


// =====================================================
// TOTAL POINTS
// =====================================================

function getTotalPoints() {

    return Object.values(
        totalPoints
    ).reduce(
        (sum, points) =>
            sum + points,
        0
    );
}


// =====================================================
// RESTART QUIZ
// =====================================================

function restartResultsQuiz() {

    // Reset quiz data
    currentQuestionIndex = 0;

    selectedAnswers = [];

    totalPoints = {
        saver: 0,
        lavish: 0,
        investor: 0,
        hustler: 0,
        "risk-taker": 0,
        defensive: 0,
        shopper: 0,
        indifferent: 0
    };


    // Reset slider
    const slider =
        document.getElementById("slider");

    if (slider) {
        slider.value = 49;
        updateSliderFill();
    }


    // Reset answer buttons
    document
        .querySelectorAll(
            ".AnswerButton"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    const neutral =
        document.getElementById("3");

    if (neutral) {
        neutral.classList.add(
            "active"
        );
    }


    // Reset question
    const firstQuestion =
        questions[0];

    if (firstQuestion) {

        const QuestionText =
            document.querySelector(
                ".QuestionText"
            );

        const QuizAnimalIcon =
            document.querySelector(
                ".QuizAnimalIcon"
            );

        const ProgressBarFill =
            document.querySelector(
                ".ProgressBarFill"
            );

        const ProgressBarText =
            document.querySelector(
                ".ProgressBarText"
            );


        if (QuestionText) {
            QuestionText.innerHTML =
                firstQuestion.value;
        }

        if (QuizAnimalIcon) {
            QuizAnimalIcon.src =
                firstQuestion.image;
        }

        if (ProgressBarFill) {
            ProgressBarFill.style.width =
                "6.25%";
        }

        if (ProgressBarText) {
            ProgressBarText.textContent =
                "1/16";
        }
    }


    // Hide results
    document
        .querySelector(
            ".ResultsContainer"
        )
        ?.classList.remove(
            "active"
        );


    // Return to start page
    document
        .getElementById(
            "start-page"
        )
        ?.classList.add(
            "active"
        );


    window.scrollTo(0, 0);
}


// =====================================================
// BUTTON EVENTS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const restartButton =
            document.getElementById(
                "restart-button"
            );

        if (restartButton) {
            restartButton.addEventListener(
                "click",
                restartResultsQuiz
            );
        }


        const downloadButton =
            document.getElementById(
                "downloadResultsBtn"
            );

        if (downloadButton) {
            downloadButton.addEventListener(
                "click",
                downloadResults
            );
        }
    }
);


// =====================================================
// DOWNLOAD RESULTS
// =====================================================

function downloadResults() {

    const personalityType =
        window.userPersonalityType;

    if (!personalityType) {
        console.warn(
            "No personality result available."
        );
        return;
    }


    // Keep this mapping until final
    // downloadable result assets are confirmed.
    console.log(
        "Download requested for:",
        personalityType
    );
}


// =====================================================
// UTILITY
// =====================================================

function capitalize(str) {

    if (!str) return "";

    return (
        str.charAt(0).toUpperCase()
        +
        str.slice(1)
    );
}