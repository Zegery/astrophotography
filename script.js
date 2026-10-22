const cards = document.querySelectorAll(".photo-card");
const dialog = document.querySelector("#lightbox");
const closeButton = document.querySelector(".lightbox-close");

const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxDetails = document.querySelector("#lightbox-details");

// Zoom/Pan elements
const zoomWrapper = document.querySelector(".zoom-wrapper");
const zoomInBtn = document.querySelector(".zoom-in");
const zoomOutBtn = document.querySelector(".zoom-out");
const lightboxMedia = document.querySelector(".lightbox-media");

// Zoom state
let scale = 1;
let tx = 0;
let ty = 0;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateTransform() {
  zoomWrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}

function clampPan() {
  if (scale <= 1) {
    tx = 0;
    ty = 0;
  } else {
    const imgWidth = lightboxImage.offsetWidth * scale;
    const imgHeight = lightboxImage.offsetHeight * scale;
    const containerWidth = lightboxMedia.clientWidth;
    const containerHeight = lightboxMedia.clientHeight;

    // Only allow panning if image is larger than container
    if (imgWidth < containerWidth) tx = 0;
    else {
      tx = clamp(tx, -(imgWidth - containerWidth), 0);
    }

    if (imgHeight < containerHeight) ty = 0;
    else {
      ty = clamp(ty, -(imgHeight - containerHeight), 0);
    }
  }
  updateTransform();
}

function zoomIn() {
  if (scale < MAX_ZOOM) {
    scale = Math.min(scale + ZOOM_STEP, MAX_ZOOM);
    updateTransform();
    clampPan();
  }
}

function zoomOut() {
  if (scale > MIN_ZOOM) {
    scale = Math.max(scale - ZOOM_STEP, MIN_ZOOM);
    tx = 0; // Center on zoom out
    ty = 0;
    updateTransform();
  }
}

// Pan state
let isPanning = false;
let startX, startY, startTx, startTy;

// Mouse pan
lightboxMedia.addEventListener("mousedown", (e) => {
  if (scale <= 1) return;
  isPanning = true;
  startX = e.clientX;
  startY = e.clientY;
  startTx = tx;
  startTy = ty;
  lightboxMedia.style.cursor = "grabbing";
  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  tx = startTx + dx;
  ty = startTy + dy;
  updateTransform();
  clampPan(); // Real-time clamping keeps it smooth
});

window.addEventListener("mouseup", () => {
  if (isPanning) {
    isPanning = false;
    lightboxMedia.style.cursor = "default";
  }
});

// Touch pan
lightboxMedia.addEventListener("touchstart", (e) => {
  if (scale <= 1) return;
  isPanning = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startTx = tx;
  startTy = ty;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  if (!isPanning) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  tx = startTx + dx;
  ty = startTy + dy;
  updateTransform();
  clampPan();
}, { passive: true });

window.addEventListener("touchend", () => {
  isPanning = false;
});

// Button listeners
zoomInBtn.addEventListener("click", zoomIn);
zoomOutBtn.addEventListener("click", zoomOut);

// Card click handler (modified to reset zoom)
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const imagePath = card.dataset.image;
    const thumbnail = card.querySelector("img");

    // Reset zoom state
    scale = 1;
    tx = 0;
    ty = 0;
    updateTransform();

    lightboxImage.src = imagePath;
    lightboxImage.alt = thumbnail ? thumbnail.alt : card.dataset.title;
    lightboxTitle.textContent = card.dataset.title || "Astrophotograph";
    lightboxCategory.textContent = card.dataset.category || "ASTROPHOTOGRAPHY";
    lightboxDescription.textContent = card.dataset.description || "";
    lightboxDetails.textContent = card.dataset.details || "";

    // Recalculate bounds once image loads
    lightboxImage.onload = () => clampPan();

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
