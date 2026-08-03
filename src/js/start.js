// VARIABLES:
const startBtn = document.querySelector(".start-btn")
// animal elements
const animals = document.querySelectorAll(".animal");

let animalJump = 0; // variable tracking if user is hovering "GET STARTED" button

function setAnimalJump (animal) {
    let userHovering = false;
    // user hovering
    startBtn.addEventListener("mouseover", () => {
        userHovering = true;
        animal.style.animationPlayState = "running";
    });
    // user stop hovering
    startBtn.addEventListener("mouseout", () => { 
        userHovering = false;
    });

    // when animation end check if user still hovering if not stop animation
    animal.addEventListener("animationiteration", () => {
        if (!userHovering) {
            animal.style.animationPlayState = "paused";
        }
    });
}
animals.forEach(setAnimalJump);

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}