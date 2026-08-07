// VARIABLES:
const topBubbles = document.querySelector(".top-bubbles");
const bottomBubbles = document.querySelector(".bottom-bubbles");
const startBtn = document.querySelector(".start-btn");
const logo = document.querySelector(".logo");
// animal elements
const animals = document.querySelectorAll(".animal");

// used to make jump animation only play on hover (desktop) or play without hovering (mobile)
let mobile = false;

window.addEventListener("resize", screenChanges);
function screenChanges() {
    mobile = window.innerWidth <= 768; // boolean value 

    animals.forEach(animal => {
        animal.style.animationPlayState = mobile ? "running" : "paused"; // if mobile "running" if not "paused"
    });

    if (mobile) {
        topBubbles.src = "./src/assets/Mobile Asset/SVG/SVG Quiz Cover/QuizCoverUpperBubbleMobile.svg";
        bottomBubbles.src = "./src/assets/Mobile Asset/SVG/SVG Quiz Cover/QuizCoverLowerBubblesMobile.svg";
        logo.src = "src/assets/Mobile Asset/SVG/SVG Quiz Cover/QuizCoverMoblieLogo.svg";
    } else {
        topBubbles.src = "./src/assets/Desktop Asset/SVG/SVG Quiz Cover/QuizCoverUpperBubbleDesktop.svg";
        bottomBubbles.src = "./src/assets/Desktop Asset/SVG/SVG Quiz Cover/QuizCoverLowerBubblesDesktop.svg";
        logo.src = "./src/assets/Desktop Asset/SVG/SVG Quiz Cover/QuizCoverDeskTopLogo.svg";
    }
}   
screenChanges()


// function tracks user hovering start-btn, when hovering the animals jump.
//  when the user stops hovering it makes sure to not instantly pause the animation
//  instead it awaits for jump to finish then pauses the animation cycle
function setAnimalJump (animal) {
    let userHovering = false;
    // user hovering
    startBtn.addEventListener("mouseover", () => {
        if (!mobile) {
            userHovering = true;
            animal.style.animationPlayState = "running";
        }
    });
    // user stop hovering
    startBtn.addEventListener("mouseout", () => {
        userHovering = false;
    });

    // when animation end check if user still hovering if not stop animation
    animal.addEventListener("animationiteration", () => {
        if (!mobile && !userHovering) {
            animal.style.animationPlayState = "paused";
        }
    });
}
animals.forEach(setAnimalJump);

function quizStart() {
    document.querySelector(".QuizContainer").classList.add("active");
    document.getElementById("start-page").classList.remove("active");
}
        
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
