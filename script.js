var displayAds = false;

// Image and GIF URLs
const staticImage = "./imgs/kek.png"; // PNG image
const gifImage = "./imgs/kek.gif"; // GIF

const muchmuchmuchAudio = new Audio("/audio/munch.m4a");
const wowAudio = new Audio("/audio/wow.m4a");
const music = new Audio("/audio/music.mp3");

// DOM Elements
const mainImage = document.getElementById("main-image");
//const chickenBucketImg = document.getElementById("chicken-bucket-img");
//const meterContainer = document.getElementById("meter-container");
const flashScreen = document.getElementById("flash-screen");
const content = document.getElementById("content");
const intermediaryImage = document.getElementById("intermediary-image");

const hearts = document.querySelectorAll(".heart");

let clickCount = 0;

function playGif() {
  mainImage.src = gifImage;
  setTimeout(() => {
    mainImage.src = staticImage;
  }, 800); // Adjust GIF duration
}

document.getElementById("click-area").addEventListener("click", () => {
  if (clickCount >= 5) return;
  muchmuchmuchAudio.pause(); // Pause the audio
  muchmuchmuchAudio.currentTime = 0;
  muchmuchmuchAudio.play();

  playGif();
  hearts[clickCount].src = "./imgs/full-heart.png";
  clickCount++;

  //const fillPercentage = (clickCount / 5) * 100;
  //document.getElementById("meter-fill").style.width = `${fillPercentage}%`;

  if (clickCount === 5) {
    setTimeout(() => {
      // Fade out the elements
      mainImage.style.opacity = "0";
      //chickenBucketImg.style.opacity = "0";
      //meterContainer.style.opacity = "0";
      document.getElementById("hearts-container").style.opacity = "0";

      setTimeout(() => {
        // Display intermediary image
        intermediaryImage.style.display = "block";
        intermediaryImage.style.opacity = "1";

        // Handle click on intermediary image
        intermediaryImage.addEventListener("click", () => {
          wowAudio.play();
          flashScreen.style.opacity = "1";

          setTimeout(() => {
            flashScreen.style.opacity = "0";
            intermediaryImage.style.opacity = "0";
            setTimeout(() => {
              flashScreen.style.display = "none";
              intermediaryImage.style.display = "none";
              content.style.display = "flex";
              document.getElementById("click-area").style.display = "none";
              music.loop = true;
              music.play();
              displayAds = true;
            }, 200); // Match fade-out duration
          }, 1800);
        });
      }, 500); // Wait for fade-out to complete
    }, 1300); // Delay after 5th click
  }
});

const images = [
  "./imgs/ad1.jpg",
  "./imgs/ad2.jpg",
  "./imgs/ad3.jpg",
  "./imgs/ad4.jpg",
  "./imgs/ad5.jpg",
  "./imgs/ad6.jpg",
  "./imgs/ad7.jpg",
  "./imgs/ad8.jpg",
  "./imgs/ad9.jpg",
];

const audios = [
  "./audio/firesale.m4a",
  "./audio/crisssssssssssspy.m4a",
  "./audio/imsoogooood.m4a",
  "./audio/mmmwowwwww.m4a",
  "./audio/itssoocrispy.m4a",
  "./audio/criiiiiiiiiiiiiiispy.m4a",
  "./audio/omygod.m4a",
  "./audio/sogood.m4a",
  "./audio/OMG.m4a",
];

function createAdPopup() {
  if (!displayAds) return;

  const popup = document.createElement("div");
  popup.classList.add("popup");

  // Close button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-btn");
  closeButton.textContent = "✖";
  closeButton.addEventListener("click", () => {
    popup.classList.remove("active");
    setTimeout(() => popup.remove(), 400);
  });

  popup.appendChild(closeButton);

  const videoOverlay = document.createElement("div");
  videoOverlay.classList.add("video-overlay");

  popup.appendChild(videoOverlay);

  // // Advertisement content
  const adContent = document.createElement("img");
  adContent.classList.add("ad-img");

  // // Set background image for the ad content
  //   adContent.style.backgroundImage = `url(${
  //     images[Math.floor(Math.random() * images.length)]
  //   })`;

  const randomIndex = Math.floor(Math.random() * images.length);
  adContent.src = images[randomIndex];
  popup.appendChild(adContent);

  // Add popup to body
  document.body.appendChild(popup);

  // Random position
  const x = Math.random() * (window.innerWidth - 320); // Account for popup width
  const y = Math.random() * (window.innerHeight - 180); // Account for popup height
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Show popup with animation
  setTimeout(() => popup.classList.add("active"), 50);

  // Play corresponding audio
  const adAudio = new Audio(audios[randomIndex]);
  adAudio.volume = 0.6; // Lower volume
  adAudio.play();

  // Remove popup after 5-10 seconds
  const displayDuration = Math.random() * 5000 + 10000; // Random between 5-10 seconds
  setTimeout(() => {
    popup.classList.remove("active");
    setTimeout(() => popup.remove(), 4000); // Ensure removal after animation
    adAudio.pause(); // Stop audio playback if popup is removed early
    adAudio.currentTime = 0; // Reset audio playback
  }, displayDuration);
}

// Start displaying ads at random intervals
function startAdPopups() {
  setInterval(createAdPopup, Math.random() * 5000 + 2000); // Between 2-7 seconds
}

// Initialize popups
startAdPopups();

const memeCreatorDiv = document.getElementById("meme-creator");
const showMemeCreatorButton = document.getElementById("show-meme-creator");
const showpfpCreatorButton = document.getElementById("show-pfp-creator");
const aboutButton = document.querySelector("#about-btn");
const tokenmicsButton = document.querySelector("#tokenmics-btn");
const aboutDiv = document.querySelector("#about");
const tokenmicsDiv = document.querySelector("#tokenmics");

let isAboutVisible = false;
let isTokenmicsVisible = false;
let isMemevisible = false;
let isPfpvisible = false;

// Move #about div inside aboutButton if screen width <= 768px
if (window.matchMedia("(max-width: 768px)").matches) {
  aboutButton.appendChild(aboutDiv);
  tokenmicsButton.appendChild(tokenmicsDiv);
}

document.querySelector("#home .nav-link").classList.add("active-nav");

aboutButton.addEventListener("click", () => {
  if (!isAboutVisible) {
    memeCreatorDiv.classList.remove("show"); // Add 'show' class to trigger animation
    tokenmicsDiv.style.display = "none"; // Add 'show' class to trigger animation
    aboutDiv.style.display = "block"; // Add 'show' class to trigger animation

    document
      .querySelectorAll(".nav-link")
      .forEach((e) => e.classList.remove("active-nav"));
    aboutButton.querySelector(".nav-link").classList.add("active-nav");

    isTokenmicsVisible = false;
    isPfpvisible = false;
    isMemevisible = false;
    isAboutVisible = true;
  } else {
    aboutDiv.style.display = "none"; // Add 'show' class to trigger animation
    isAboutVisible = false;
  }
});

tokenmicsButton.addEventListener("click", () => {
  if (!isTokenmicsVisible) {
    memeCreatorDiv.classList.remove("show"); // Add 'show' class to trigger animation
    aboutDiv.style.display = "none"; // Add 'show' class to trigger animation
    tokenmicsDiv.style.display = "block"; // Add 'show' class to trigger animation

    document
      .querySelectorAll(".nav-link")
      .forEach((e) => e.classList.remove("active-nav"));
    tokenmicsButton.querySelector(".nav-link").classList.add("active-nav");

    isAboutVisible = false;
    isPfpvisible = false;
    isMemevisible = false;
    isTokenmicsVisible = true;
  } else {
    tokenmicsDiv.style.display = "none"; // Add 'show' class to trigger animation
    isTokenmicsVisible = false;
  }
});

showMemeCreatorButton.addEventListener("click", () => {
  if (!isMemevisible) {
    document
      .querySelectorAll(".nav-link")
      .forEach((e) => e.classList.remove("active-nav"));
    showMemeCreatorButton
      .querySelector(".nav-link")
      .classList.add("active-nav");

    addTextButton.style.display = "inline";

    tokenmicsDiv.style.display = "none"; // Add 'show' class to trigger animation
    aboutDiv.style.display = "none";
    memeCreatorDiv.classList.add("show"); // Add 'show' class to trigger animation
    isTokenmicsVisible = false;
    isAboutVisible = false;
    isPfpvisible = false;
    isMemevisible = true;
  } else {
    memeCreatorDiv.classList.remove("show"); // Add 'show' class to trigger animation
    isMemevisible = false;
  }
});

showpfpCreatorButton.addEventListener("click", () => {
  if (!isPfpvisible) {
    document
      .querySelectorAll(".nav-link")
      .forEach((e) => e.classList.remove("active-nav"));
    showpfpCreatorButton.querySelector(".nav-link").classList.add("active-nav");

    addTextButton.style.display = "none";
    resetButton.click();
    tokenmicsDiv.style.display = "none"; // Add 'show' class to trigger animation
    aboutDiv.style.display = "none";

    memeCreatorDiv.classList.add("show"); // Add 'show' class to trigger animation
    isAboutVisible = false;
    isTokenmicsVisible = false;
    isMemevisible = false;
    isPfpvisible = true;
  } else {
    memeCreatorDiv.classList.remove("show"); // Add 'show' class to trigger animation
    isPfpvisible = false;
  }
});

document.querySelector("#close-popup").addEventListener("click", () => {
  memeCreatorDiv.classList.remove("show"); // Add 'show' class to trigger animation
});
