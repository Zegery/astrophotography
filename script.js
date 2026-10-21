const cards = document.querySelectorAll(".photo-card");
const dialog = document.querySelector("#lightbox");
const closeButton = document.querySelector(".lightbox-close");

const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxDescription = document.querySelector("#lightbox-description");
const lightboxDetails = document.querySelector("#lightbox-details");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const imagePath = card.dataset.image;
    const thumbnail = card.querySelector("img");

    // Reset zoom state
    lightboxImage.style.transform = `translate3d(0, 0, 0) scale(1)`;
    lightboxImage.classList.remove("is-zoomed");

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

/* ── Simple Click-to-Zoom Logic ── */

lightboxImage.addEventListener("click", (e) => {
  // Prevent the lightbox from closing when we click the image
  e.stopPropagation();

  if (lightboxImage.classList.contains("is-zoomed")) {
    // Zoom Out
    lightboxImage.classList.remove("is-zoomed");
    lightboxImage.style.transform = `translate3d(0, 0, 0) scale(1)`;
  } else {
    // Zoom In
    lightboxImage.classList.add("is-zoomed");
    
    const rect = lightboxImage.getBoundingClientRect();
    
    // Calculate where the user clicked relative to the image center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate distance from center
    const diffX = x - centerX;
    const diffY = y - centerY;
    
    // Scale factor
    const scale = 2;
    
    // Calculate translation to keep the clicked point in the center
    // We use translate3d for GPU acceleration (prevents lag)
    const translateX = diffX * (scale - 1);
    const translateY = diffY * (scale - 1);
    
    lightboxImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }
});
