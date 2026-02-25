const video = document.getElementById("heroVideo");
const title = document.getElementById("heroTitle");

video.addEventListener("timeupdate", () => {
    if (video.currentTime > video.duration * 0.1) {
        title.style.opacity = "1";
        //title.style.transform = translateY(0);
    }
});

video.addEventListener("ended", () => {
    video.pause();
});

let lightMode = true;
const lightModeButton = document.getElementById("lightMode");

function ToggleLightmode() {
    lightMode = !lightMode;
    console.log(`lightmode: ${lightMode}`);
    if(lightMode) {
        lightModeButton.classList.add("lightModeState-light");
        lightModeButton.classList.remove("lightModeState-dark");
    }
    else {
        lightModeButton.classList.remove("lightModeState-light");
        lightModeButton.classList.add("lightModeState-dark");
    }
}