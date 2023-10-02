const brandBtn = document.getElementById('brandBtn')
const brandForm = document.getElementById('brandForm')
brandBtn.addEventListener('click', () => {
  if (brandForm.style.display === 'block') {
    brandForm.style.display = 'none'
  } else {
    brandForm.style.display = 'block'
  }
})