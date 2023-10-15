
const imageEditBtn = document.getElementById('imageEdit')
const detailsForm = document.getElementById('basic-form')
const deleteImagebtn = document.querySelectorAll('.deleteImage')
const imgChangeForm = document.getElementById('imgChangeForm')
const imgChangediv = document.getElementById('imgChangediv')
const mainIMageChange = document.getElementById('mainIMageChange')
const mainImage = document.getElementById('mainImage')
const addNewImageForm = document.getElementById('addNewImageForm')
const newImage = document.getElementById('newImage')
const addNewImageInput = document.getElementById('addNewImageInput')
const mainImgErr = document.querySelector('.mainImgErr');
const newImgErr = document.querySelector('.newImgErr')

$(document).ready(function () {
  $("#basic-form").validate();
});

imageEditBtn.addEventListener('click', (e) => {
  detailsForm.style.display = 'none';
  imgChangediv.style.display = 'block';
  imageEditBtn.style.display = 'none'

})
mainIMageChange.addEventListener("change", (e) => {
  const imageData = e.target.files
  const file = imageData[0]
  if (file.type.startsWith("image/")) {
    const sourceURL = URL.createObjectURL(file)
    mainImage.src = sourceURL
  } else {
    mainImgErr.innerHTML = 'Please select a image type '
  }

})
imgChangeForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // const imageData=imgChangeForm.mainIMageChange.value
  if (mainIMageChange.value == '') {
    mainImgErr.innerHTML = 'Please select a image'
  }
  else {
    const formData = new FormData(imgChangeForm)
    fetch('/admin/change-main-image', {
      method: 'POST',
      // headers:{
      //   'Content-Type':'application/json'
      // },
      body: formData
    })
      .then((response) => {
        response.json()
          .then((response) => {
            if (response.updated) {
              Swal.fire(
                'Updated',
                'Featured Image of your product ',
                'success'
              )
            }
          })
      })
  }

})

addNewImageInput.addEventListener("change", (e) => {
  const imageData = e.target.files
  const file = imageData[0]
  if (file.type.startsWith("image/")) {
    const sourceURL = URL.createObjectURL(file)
    newImage.src = sourceURL
  } else {
    newImgErr.innerHTML = 'Please select a image type'
  }

})

addNewImageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  if (addNewImageInput.value === '') {
    newImgErr.innerHTML = 'Please select a image'
  } else {
    const formData = new FormData(addNewImageForm)
    fetch('/admin/add-image', {
      method: 'POST',
      body: formData
    })
      .then((response) => {
        response.json()
          .then((response) => {
            if (response.updated) {
              Swal.fire(
                'Updated',
                'Featured Image of your product ',
                'success'
              )
              window.location.reload()
            }
          })
      })
  }


})

deleteImagebtn.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault()
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        let productId = btn.getAttribute('productId');
        let imageData = btn.getAttribute('imageData');
        const removeDiv = document.getElementById(imageData)

        await fetch(`/admin/delete-product-image/${productId}/${imageData}`, {
          method: 'PUT',
        })
          .then((response) => {
            response.json()
              .then((response) => {
                if (response.updated) {
                  removeDiv.remove()
                  Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                  )
                }
              })
          })

      }
    })

  })
})
