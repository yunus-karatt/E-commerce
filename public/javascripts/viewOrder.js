document.querySelectorAll('.itemStatus').forEach((status, index) => {
  if (status.textContent.trim() === 'cancelled') {
    // Select the corresponding card footer and hide it
    const cardFooter = document.querySelectorAll('.card-footer')[index];
    if (cardFooter) {
      cardFooter.style.display = 'none';
    }
  }
});
