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

// 🎯 PAN SENSITIVITY: Locked to 1.0 (1:1 movement)
const PAN_SENSITIVITY = 1.0;

// Pan state
let isPanning = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTx = 0;
let dragStartTy = 0;

function clampPan() {
  if (scale <= 1) {
    tx = 0;
    ty = 0;
    updateTransform();
    return;
  }

  // 🎯 FORCE SYNCHRONOUS LAYOUT UPDATE
  // This ensures clientWidth/clientHeight reflect the exact rendered state
  void lightboxMedia.offsetHeight;
  void lightboxImage.offsetHeight;

  // 🎯 USE INTEGER-BASED DIMENSIONS (avoids subpixel rounding bugs)
  const contW = lightboxMedia.clientWidth;
  const contH = lightboxMedia.clientHeight;
  const imgW = lightboxImage.clientWidth;
  const imgH = lightboxImage.clientHeight;

  // If image fits entirely, reset to center
  if (imgW <= contW && imgH <= contH) {
    tx = 0;
    ty = 0;
    updateTransform();
    return;
  }

  // 🎯 CALCULATE ALLOWABLE OFFSET FROM CENTER (always positive)
  const maxOffsetX = Math.max(0, (imgW - contW) / 2);
  const maxOffsetY = Math.max(0, (imgH - contH) / 2);

  // Clamp to exact boundaries
  tx = Math.max(-maxOffsetX, Math.min(maxOffsetX, tx));
  ty = Math.max(-maxOffsetY, Math.min(maxOffsetY, ty));

  updateTransform();
}

function updateTransform() {
  // 🎯 GPU-ACCELERATED + INTEGER COORDINATES (prevents subpixel jumping)
  zoomWrapper.style.transform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0) scale(${scale})`;
}

// Pointer-based pan (unifies mouse + touch)
function onPointerDown(e) {
  if (scale <= 1) return;
  isPanning = true;
  lightboxMedia.setPointerCapture(e.pointerId);
  
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStartTx = tx;
  dragStartTy = ty;
  
  zoomWrapper.classList.add('is-panning');
  lightboxMedia.style.cursor = 'grabbing';
  e.preventDefault();
}

function onPointerMove(e) {
  if (!isPanning) return;
  e.preventDefault();
  
  const dx = (e.clientX - dragStartX) * PAN_SENSITIVITY;
  const dy = (e.clientY - dragStartY) * PAN_SENSITIVITY;
  
  tx = dragStartTx + dx;
  ty = dragStartTy + dy;
  clampPan();
}

function onPointerUp(e) {
  if (!isPanning) return;
  isPanning = false;
  zoomWrapper.classList.remove('is-panning');
  lightboxMedia.style.cursor = 'grab';
}

function onPointerCancel() {
  onPointerUp();
}

function zoomIn() {
  if (scale < MAX_ZOOM) {
    scale = Math.min(scale + ZOOM_STEP, MAX_ZOOM);
    // 🎯 SYNC LAYOUT BEFORE CLAMPING
    requestAnimationFrame(() => {
      void lightboxMedia.offsetHeight;
      clampPan();
    });
  }
}

function zoomOut() {
  if (scale > MIN_ZOOM) {
    scale = Math.max(scale - ZOOM_STEP, MIN_ZOOM);
    tx = 0;
    ty = 0;
    requestAnimationFrame(() => {
      void lightboxMedia.offsetHeight;
      updateTransform();
      clampPan();
    });
  }
}

// Button listeners
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);

// Prevent buttons from triggering pan
[zoomInBtn, zoomOutBtn].forEach(btn => {
  btn.addEventListener('pointerdown', e => e.stopPropagation());
});

// Attach pointer events to the media container
lightboxMedia.addEventListener('pointerdown', onPointerDown);
lightboxMedia.addEventListener('pointermove', onPointerMove);
lightboxMedia.addEventListener('pointerup', onPointerUp);
lightboxMedia.addEventListener('pointercancel', onPointerCancel);

// Card click handler
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const imagePath = card.dataset.image;
    const thumbnail = card.querySelector("img");

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

    lightboxImage.onload = () => {
      requestAnimationFrame(() => {
        void lightboxMedia.offsetHeight;
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

// Prevent backdrop click from closing
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