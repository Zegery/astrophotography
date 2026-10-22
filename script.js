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

// 🎯 PAN SENSITIVITY: 1.0 = 1:1, 1.5-2.0 = snappy
const PAN_SENSITIVITY = 1.8;

// Pan state
let isPanning = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTx = 0;
let dragStartTy = 0;

// Cached boundaries for precise clamping
let panBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

function updatePanBounds() {
  if (scale <= 1) {
    panBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    tx = 0;
    ty = 0;
    updateTransform();
    return;
  }

  const contW = lightboxMedia.clientWidth;
  const contH = lightboxMedia.clientHeight;
  const imgW = lightboxImage.clientWidth;
  const imgH = lightboxImage.clientHeight;

  // If image fits entirely, reset to center
  if (imgW <= contW && imgH <= contH) {
    panBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    tx = 0;
    ty = 0;
    updateTransform();
    return;
  }

  // Calculate exact overflow boundaries
  panBounds.minX = -(imgW - contW);
  panBounds.maxX = 0;
  panBounds.minY = -(imgH - contH);
  panBounds.maxY = 0;
}

function clampPan() {
  // Clamp with tiny tolerance to prevent floating-point edge drift
  const TOLERANCE = 0.5;
  tx = Math.max(panBounds.minX + TOLERANCE, Math.min(panBounds.maxX - TOLERANCE, tx));
  ty = Math.max(panBounds.minY + TOLERANCE, Math.min(panBounds.maxY - TOLERANCE, ty));
  updateTransform();
}

function updateTransform() {
  zoomWrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}

function startPan(e) {
  if (scale <= 1) return;
  isPanning = true;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  dragStartX = clientX;
  dragStartY = clientY;
  dragStartTx = tx;
  dragStartTy = ty;
  zoomWrapper.classList.add('is-panning');
  lightboxMedia.style.cursor = 'grabbing';
  e.preventDefault();
}

function movePan(e) {
  if (!isPanning) return;
  e.preventDefault();
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;

  // Apply sensitivity to raw mouse movement
  const dx = (clientX - dragStartX) * PAN_SENSITIVITY;
  const dy = (clientY - dragStartY) * PAN_SENSITIVITY;

  tx = dragStartTx + dx;
  ty = dragStartTy + dy;
  clampPan();
}

function endPan() {
  if (!isPanning) return;
  isPanning = false;
  zoomWrapper.classList.remove('is-panning');
  lightboxMedia.style.cursor = 'grab';
}

function zoomIn() {
  if (scale < MAX_ZOOM) {
    scale = Math.min(scale + ZOOM_STEP, MAX_ZOOM);
    updatePanBounds();
    clampPan();
  }
}

function zoomOut() {
  if (scale > MIN_ZOOM) {
    scale = Math.max(scale - ZOOM_STEP, MIN_ZOOM);
    tx = 0;
    ty = 0;
    updateTransform();
  }
}

// Button listeners
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);

[zoomInBtn, zoomOutBtn].forEach(btn => {
  btn.addEventListener('mousedown', e => e.stopPropagation());
  btn.addEventListener('touchstart', e => e.stopPropagation());
});

// Document-level pan tracking (prevents drag loss)
document.addEventListener('mousedown', startPan);
document.addEventListener('mousemove', movePan);
document.addEventListener('mouseup', endPan);
document.addEventListener('touchstart', startPan, { passive: false });
document.addEventListener('touchmove', movePan, { passive: false });
document.addEventListener('touchend', endPan);

// Card click handler
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const imagePath = card.dataset.image;
    const thumbnail = card.querySelector("img");

    // Reset zoom & pan
    scale = 1;
    tx = 0;
    ty = 0;
    zoomWrapper.classList.remove('is-panning');
    updateTransform();

    lightboxImage.src = imagePath;
    lightboxImage.alt = thumbnail ? thumbnail.alt : card.dataset.title;
    lightboxTitle.textContent = card.dataset.title || "Astrophotograph";
    lightboxCategory.textContent = card.dataset.category || "ASTROPHOTOGRAPHY";
    lightboxDescription.textContent = card.dataset.description || "";
    lightboxDetails.textContent = card.dataset.details || "";

    // Recalculate boundaries once image renders
    lightboxImage.onload = () => {
      requestAnimationFrame(() => {
        updatePanBounds();
        clampPan();
      });
    };
    if (lightboxImage.complete) lightboxImage.onload();

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

closeButton.addEventListener("click", () => dialog.close());

// Prevent backdrop click from closing the dialog
dialog.addEventListener('mousedown', (e) => {
  if (e.target === dialog) e.preventDefault();
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