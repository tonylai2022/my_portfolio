function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

document.querySelectorAll('.carousel').forEach(carousel => {
  const items = carousel.querySelector('.carousel-items');
  const images = items.querySelectorAll('img');
  let currentIndex = 0;

  function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    items.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function showPreviousImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    items.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // Add navigation buttons (optional)
  const nextButton = document.createElement('button');
  nextButton.innerText = '>';
  nextButton.onclick = showNextImage;
  nextButton.style.position = 'absolute';
  nextButton.style.right = '10px';
  nextButton.style.top = '50%';
  carousel.appendChild(nextButton);

  const prevButton = document.createElement('button');
  prevButton.innerText = '<';
  prevButton.onclick = showPreviousImage;
  prevButton.style.position = 'absolute';
  prevButton.style.left = '10px';
  prevButton.style.top = '50%';
  carousel.appendChild(prevButton);
});
