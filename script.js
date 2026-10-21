const cards = document.querySelectorAll(".photo-card");
const dialog = document.querySelector("#lightbox");
const closeButton = document.querySelector(".lightbox-close");

const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxDetails = document.querySelector("#lightbox-details");

// Zoom & Pan Variables
let scale = 1;
let isPanning = false;
let startX, startY;
let translateX = 0;
let translateY = 0;

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const imagePath = card.dataset.image;
    const thumbnail = card.querySelector("img");

    // Reset Zoom and Pan on every new image open
    scale = 1;
    translateX = 0;
    translateY = 0;
    lightboxImage.style.transform = `translate(0px, 0px) scale(1)`;

    lightboxImage.src = imagePath;
    lightboxImage.alt = thumbnail ? thumbnail.alt : card.dataset.title;
    lightboxTitle.textContent = card.dataset.title || "Astrophotograph";
    lightboxCategory.textContent = card.dataset.category || "ASTROPHOTOGRAPHY";
    lightboxDescription.textContent = card.dataset.description || "";
    lightboxDetails.textContent = card.dataset.details || "";

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

closeButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();

/* ── Scroll reveal observer ── */
const revealTargets = document.querySelectorAll(
  ".section-heading, .photo-card, .about-inner > *, .section-note"
);

if (!("IntersectionObserver" in window)) {
  revealTargets.forEach((element) => {
    element.classList.add("visible");
  });
} else {
  revealTargets.forEach((element) => {
    element.classList.add("reveal");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealTargets.forEach((element) => {
    revealObserver.observe(element);
  });
}

/* ── Zoom and Pan Logic ── */

const lightboxMedia = document.querySelector(".lightbox-media");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");

// Handle Zoom Buttons
zoomInBtn.addEventListener("click", () => {
  scale += 0.3;
  updateTransform();
});

zoomOutBtn.addEventListener("click", () => {
  scale = Math.max(1, scale - 0.3);
  updateTransform();
});

// Handle Mouse Wheel Zoom
lightboxMedia.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    scale += 0.1;
  } else {
    scale = Math.max(1, scale - 0.1);
  }
  updateTransform();
}, { passive: false });

function updateTransform() {
  lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Handle Panning
lightboxMedia.addEventListener("mousedown", (e) => {
  if (scale > 1.1) {
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxMedia.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", (e) => {
  if (isPanning) {
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  }
});

window.addEventListener("mouseup", () => {
  isPanning = false;
  lightboxMedia.style.cursor = "grab";
});
