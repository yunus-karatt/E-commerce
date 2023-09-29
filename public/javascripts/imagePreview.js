const imageview = document.getElementById('image-previewE');
const imageinput = document.getElementById('productImages');
const imageInputView = document.querySelector('.image-preview')
const existingProduct = document.querySelectorAll('.existingProduct')
imageinput.addEventListener('input', (e) => {
  const imageData = e.target.files
  let sourceUrl = []
  if (imageData.length > 0) {
    for (let i = 0; i < imageData.length; i++) {
      const file = imageData[i];
      //  sourceUrl.push(URL.createObjectURL(file))
      const sourceURL = URL.createObjectURL(file)
      const imgElement = document.createElement('img');
      existingProduct[i].src = sourceURL;
      imgElement.alt = '';
      //  imageInputView.appendChild(imgElement);
    }
  }
})