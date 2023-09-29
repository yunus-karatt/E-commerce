const form = document.querySelector('form');
const error = document.querySelector('.productError')
const imageError = document.querySelector('.imageError')
const catValue = document.getElementById('categorySelect')
const processor = document.getElementById('processor')
catValue.addEventListener('change', (e) => {
  if (catValue.value == 'Laptop') {
    processor.style.display = 'block'
  } else {
    processor.style.display = 'none'
  }
})

form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent form submission for now

  // Get form input values
  const productName = form.querySelector('#productName').value;
  const productCategory = form.querySelector('#categorySelect').value;
  const productBrand = form.querySelector('#productBrand').value;
  const productDescription = form.querySelector('#productDescription').value;
  const productRam = form.querySelector('#productRam').value;
  const productStorage = form.querySelector('#productStorage').value;
  const productOs = form.querySelector('#productOs').value;
  const productColor = form.querySelector('#productColor').value;
  const productPrice = form.querySelector('#productPrice').value;
  const productQuantity = form.querySelector('#productQuantity').value;
  const productImages = form.querySelector('#productImages').files;

  let file;
  let fileType;

  for (let i = 0; i < productImages.length; i++) {
    file = productImages[i]
    fileType = file.type
  }

  // Validate each field
  if (!productName || !productCategory || !productBrand || !productDescription || !productRam || !productStorage || !productOs || !productColor || !productPrice || !productQuantity || productImages.length === 0) {
    error.innerHTML = 'Please fill in all fields'
  } else if (!fileType.startsWith('image/')) {
    imageError.innerHTML = 'Please select valid image'
  } else {
    form.submit();
  }
});
