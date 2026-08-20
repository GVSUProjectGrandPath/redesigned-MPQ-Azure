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


        downloadButton?.addEventListener(
            "click",
            downloadResults
        );

        if (downloadButton) {
            downloadButton.addEventListener(
                "click",
                downloadResults
            );
        }
        const feedbackButton =
            document.getElementById(
                "feedback-button"
            );

        const feedbackCloseButton =
            document.getElementById(
                "feedback-closeXButton"
            );

        const feedbackOverlay =
            document.getElementById(
                "feedback-overlay"
            );

        const feedbackForm =
            document.getElementById(
                "feedback-form"
            );


        feedbackButton?.addEventListener(
            "click",
            openFeedbackPopup
        );


        feedbackCloseButton?.addEventListener(
            "click",
            closeFeedbackPopup
        );


        feedbackOverlay?.addEventListener(
            "click",
            closeFeedbackPopup
        );


        feedbackForm?.addEventListener(
            "submit",
            submitFeedback
        );

        const nextStepsButton =
            document.getElementById(
                "next-steps-button"
            );

        const nextStepsCloseButton =
            document.getElementById(
                "closeNextStepsPopup"
            );

        const nextStepsOverlay =
            document.getElementById(
                "next-steps-overlay"
            );


        nextStepsButton?.addEventListener(
            "click",
            openNextStepsPopup
        );


        nextStepsCloseButton?.addEventListener(
            "click",
            closeNextStepsPopup
        );


        nextStepsOverlay?.addEventListener(
            "click",
            closeNextStepsPopup
        );

        const meetupButton =
            document.getElementById(
                "meetup-jpg-btn"
            );


        meetupButton?.addEventListener(
            "click",
            () => {

                const link =
                    document.createElement("a");


                link.href =
                    "./src/assets/Money_Mindset_Meetup.jpg";


                link.download =
                    "Money-Mindset-Meetup-Worksheet.jpg";


                document.body.appendChild(link);

                link.click();

                link.remove();
            }
        );


    }
);


// =====================================================
// DOWNLOAD RESULT
// =====================================================

function downloadResults() {

    const personalityType =
        window.userPersonalityType;


    if (!personalityType) {

        console.error(
            "Personality result has not been set."
        );

        return;
    }


    const downloadMap = {

        saver:
            "./src/assets/animal_results/saver.jpg",

        lavish:
            "./src/assets/animal_results/lavish.jpg",

        investor:
            "./src/assets/animal_results/investor.jpg",

        hustler:
            "./src/assets/animal_results/hustler.jpg",

        "risk-taker":
            "./src/assets/animal_results/risk-taker.jpg",

        defensive:
            "./src/assets/animal_results/defensive.jpg",

        shopper:
            "./src/assets/animal_results/shopper.jpg",

        indifferent:
            "./src/assets/animal_results/indifferent.jpg"
    };


    const fileUrl =
        downloadMap[personalityType];


    if (!fileUrl) {

        console.error(
            "No downloadable result found for:",
            personalityType
        );

        return;
    }


    const link =
        document.createElement("a");


    link.href =
        fileUrl;


    link.download =
        `${personalityType}-money-mindset-result.jpg`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();
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

// =====================================================
// FEEDBACK POPUP
// =====================================================

function openFeedbackPopup() {

    const popup =
        document.getElementById("feedback-popup");

    const overlay =
        document.getElementById("feedback-overlay");


    popup?.classList.add("active");

    overlay?.classList.add("active");
}


function closeFeedbackPopup() {

    const popup =
        document.getElementById("feedback-popup");

    const overlay =
        document.getElementById("feedback-overlay");


    popup?.classList.remove("active");

    overlay?.classList.remove("active");
}

// =====================================================
// SUBMIT FEEDBACK
// =====================================================

async function submitFeedback(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const recommendSurvey =
        document.getElementById(
            "recommendSurvey"
        ).value;


    const resultsHelpful =
        document.getElementById(
            "resultsHelpful"
        ).value;


    const company =
        form.elements["company"]?.value || "";


    // Bot caught by honeypot
    if (company) {
        console.warn("Spam submission blocked.");
        return;
    }


    if (
        !recommendSurvey ||
        !resultsHelpful
    ) {

        alert(
            "Please answer both questions before submitting."
        );

        return;
    }


    const submitBtn =
        document.getElementById("submitBtn");


    const spinner =
        document.getElementById("loadingSpinner");


    submitBtn.disabled = true;

    submitBtn.style.display = "none";

    spinner?.classList.remove("hidden");


    const feedbackData = {

        name: "anonymous",

        question1:
            "Would you recommend the Money Personality survey to others?",

        answer1:
            recommendSurvey,

        question2:
            "Did you find the results helpful in understanding your financial habits?",

        answer2:
            resultsHelpful,

        company: company
    };


    try {

        const response =
            await fetch(
                "https://mpq-backend.onrender.com/submit-feedback",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            feedbackData
                        )
                }
            );


        let result = {};

        try {
            result =
                await response.json();
        }
        catch {
            // backend may not return JSON
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to submit feedback."
            );
        }


        alert(
            result.message ||
            "Thank you for your feedback!"
        );


        form.reset();

        closeFeedbackPopup();


    }
    catch (error) {

        console.error(
            "Feedback submission failed:",
            error
        );


        alert(
            "We couldn't submit your feedback. Please try again."
        );

    }
    finally {

        spinner?.classList.add("hidden");

        submitBtn.style.display = "block";

        submitBtn.disabled = false;
    }
}

// =====================================================
// NEXT STEPS POPUP
// =====================================================

function openNextStepsPopup() {

    const popup =
        document.getElementById("next-steps-popup");

    const overlay =
        document.getElementById("next-steps-overlay");


    popup?.classList.add("active");

    overlay?.classList.add("active");
}


function closeNextStepsPopup() {

    const popup =
        document.getElementById("next-steps-popup");

    const overlay =
        document.getElementById("next-steps-overlay");


    popup?.classList.remove("active");

    overlay?.classList.remove("active");
}