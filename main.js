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

let lightMode = document.cookie != "dark";
const lightModeButton = document.getElementById("lightMode");

function ToggleLightmode() {
    lightMode = !lightMode;
    console.log(`lightmode: ${lightMode}`);
    if(lightMode)
        document.body.classList.remove("darkMode");
    else
        document.body.classList.add("darkMode");

    document.cookie = lightMode ? "light" : "dark";
}

if(!lightMode)
    document.body.classList.add("darkMode");


document.addEventListener("DOMContentLoaded", function () {

  if (window.innerWidth >= 768) {
    const carousels = document.querySelectorAll(".carousel");

    carousels.forEach(function(carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        ride: "carousel"
      });
    });
  }

});


