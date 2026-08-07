// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Quiz data variables 
let currentQuestionIndex = 0; // Tracks the current question index
let selectedAnswers = []; // array for selected answers
let totalPoints = {
  "saver": 0,
  "lavish": 0,
  "investor": 0,
  "hustler": 0,
  "risk-taker": 0,
  "defensive": 0,
  "shopper": 0,
  "indifferent": 0
}; // Stores total points for each personality type

const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const slider = document.getElementById('slider');
const answerButtons = document.querySelectorAll('.AnswerButton');

const ProgressBarFill = document.querySelector('.ProgressBarFill');
let ProgressBarText = document.querySelector('.ProgressBarText');
const QuizAnimalIcon = document.querySelector('.QuizAnimalIcon');
const QuestionText = document.querySelector('.QuestionText');

// Next and Back Button
function changeQuestion(button) {
    if (button == nextBtn) {
        if (currentQuestionIndex == 15) {
            calculatePoints();
            // end quiz
            return;
        }
        
        // save answer
        selectedAnswers[currentQuestionIndex] = slider.value;

        currentQuestionIndex += 1;

        if (selectedAnswers[currentQuestionIndex]) {
            // load answer
            const answer = selectedAnswers[currentQuestionIndex];
            slider.value = answer;
            answerButtons.forEach( btn => {btn.classList.remove('active')});
            let answerValue = getAnswerValue();
            answerButtons[answerValue].classList.add('active');
        } else {
            slider.value = 49;
            answerButtons.forEach( btn => {btn.classList.remove('active')});
            answerButtons[2].classList.add('active');
        }
    }
    else if (button == backBtn) {
        if (currentQuestionIndex == 0) {
            // go to title
            return;
        }

        currentQuestionIndex -= 1;

        // load answer
        const answer = selectedAnswers[currentQuestionIndex];
        slider.value = answer;
        answerButtons.forEach( btn => {btn.classList.remove('active')});
        let answerValue = getAnswerValue();
        answerButtons[answerValue].classList.add('active');
    }
    updateSliderFill();

    const currQuestion = questions[currentQuestionIndex];

    // Progress bar bunny
    ProgressBarFill.style.width = (0.0625 * (currentQuestionIndex + 1) * 100) + "%"; 
    ProgressBarText.textContent = currQuestion.id + "/16";

    // Question content
    QuizAnimalIcon.src = currQuestion.image;
    QuestionText.innerHTML = currQuestion.value;
}

// Range bar stuff
function updateSliderFill() {
    // Calculate percentage dynamically based on current, min, and max values
    let isPortrait = window.matchMedia("(orientation: portrait)").matches;
    let min, max;
    if (isPortrait) {
        min = -15;
        max = 115;
    } else {
        min = -2.5;
        max = slider.max || 90;
    }
    const percentage = ((slider.value - min) / (max - min)) * 100;
    
    // Inject the percentage value straight into the CSS property
    slider.style.setProperty('--progress', `${percentage}%`);
}

function getAnswerValue() {
    const value = slider.value;
    let answerValue = 0;
    if (value >= 0 & value < 15) {
        answerValue = 0;
    } else if (value >= 15 & value < 40) {
        answerValue = 1;
    } else if (value >= 40 & value < 60) {
        answerValue = 2;
    } else if (value >= 60 & value < 85) {
        answerValue = 3;
    } else {
        answerValue = 4;
    }
    return answerValue;
}

// Slider Input 
function sliderInput() {
    let answerValue = getAnswerValue();

    slider.value = answerValue * 25 - 1; // Snap to the middle of the range
    updateSliderFill();
    
    answerButtons.forEach( btn => {btn.classList.remove('active')});
    answerButtons[answerValue].classList.add('active');
}
slider.addEventListener('change', sliderInput);


let isAnimating = false;

async function answerButtonInput(button) {
    if (isAnimating) return; // ignore clicks mid-animation
    isAnimating = true;

    let finishValue = Math.max(Number(slider.min), Math.min(Number(slider.max), (button.id - 1) * 25 - 1));
    let startValue = Number(slider.value);
    let steps = Math.abs(finishValue - startValue);
    let t = Math.floor(100/steps);
    //let t = 0;
    if (startValue > finishValue) {
        while (Number(slider.value) > finishValue) {
            slider.value = Number(slider.value) - 1;
            updateSliderFill();
            // let time = ((t - 1) ** 3 + 1); // function creates a value between 0 and 1, gets closer to 1 at the end
            // t += 4/steps;
            // console.log(time);
            // await sleep(time);
            await sleep(t);
        }
    } else if (startValue < finishValue) {
        while (Number(slider.value) < finishValue) {
            slider.value = Number(slider.value) + 1;
            updateSliderFill();
            await sleep(t);
        }
    }

    slider.value = finishValue;
    answerButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    isAnimating = false;
}

const pointskey = ['sd', 'd', 'n', 'a', 'sa'];

// Calculate results
function calculatePoints() {
    let index = 0;
    for (const value in selectedAnswers) {
        const answer = pointskey[value];
        const question = questions[index];
        const newPoints = question.points[answer];
        for (const key in newPoints) {
            if (totalPoints.hasOwnProperty(key)) {
                totalPoints[key] += newPoints[key];
            }
        }
    }
}