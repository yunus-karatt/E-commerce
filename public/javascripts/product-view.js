// product-view.js
document.addEventListener('DOMContentLoaded', function() {
  const smallImages = document.querySelectorAll('.imgSm');
  const largeImage = document.querySelector('.imgLg');

  smallImages.forEach(function(imgSm) {
    imgSm.addEventListener('mouseover', function() {
      largeImage.src = imgSm.src;
    });
  });
});
