const form = document.querySelector('form');
const error = document.querySelector('.productError')
const imageError = document.querySelector('.imageError')
const catValue = document.getElementById('categorySelect')
const processor = document.getElementById('processor')
const mainImage = document.getElementById('cropImage');
const croppedImage = document.getElementById('cropped-image')

let base64data

catValue.addEventListener('change', (e) => {
  if (catValue.value == 'Laptop') {
    processor.style.display = 'block'
  } else {
    processor.style.display = 'none'
  }
})



var bs_modal = $('#modal');
var image = document.getElementById('image');
var cropper, reader, file;


$("body").on("change", "#cropImage", function (e) {
  var files = e.target.files;

  if (files && files.length > 0) {
    var file = files[0];
    
    if (file.type.startsWith('image/')) {
      var done = function (url) {
        image.src = url;
        bs_modal.modal('show');
      };
      
      if (URL) {
        done(URL.createObjectURL(file));
      } else if (FileReader) {
        var reader = new FileReader();
        reader.onload = function (e) {
          done(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      error.innerHTML='Please select a valid image file (e.g., JPG, PNG).';
      $("#cropImage").val('');
    }
  }
});


bs_modal.on('shown.bs.modal', function () {
  cropper = new Cropper(image, {
    aspectRatio: 1 / 1,
    viewMode: 0,
    autoCrop: true,
    preview: '.preview'
  });
}).on('hidden.bs.modal', function () {
  cropper.destroy();
  cropper = null;
});

$("#crop").click(function () {
  canvas = cropper.getCroppedCanvas({
    width: 160,
    height: 160,
  });

  canvas.toBlob(function (blob) {
    url = URL.createObjectURL(blob);
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      base64data = reader.result;

      bs_modal.modal('hide');
    };
  });
});
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const productName = form.productName.value;
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
  console.log(productName)
  let file;
  let fileType;

  for (let i = 0; i < productImages.length; i++) {
    file = productImages[i]
    fileType = file.type
  }

  // Validate each field
  if (productName === '' || !productCategory || !productBrand || !productDescription || !productRam || !productStorage || !productOs || !productColor || !productPrice || !productQuantity || productImages.length === 0) {
    error.innerHTML = 'Please fill in all fields'
    // form.style.backgroundColor=' red'
  } else if (!fileType.startsWith('image/')) {
    imageError.innerHTML = 'Please select valid image'
  } else {
    base64data = base64data.split(',')[1];

    const binaryData = atob(base64data)

    const uint8Array = new Uint8Array(
      binaryData.length
    );

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], {
      type: "image/png",
    });

    const file = new File([blob], "image.png", {
      type: "image/png",
    });
    console.log(file)
    const form = document.getElementById('form')
    let formData = new FormData(form);
    formData.append('productMainImages', file);
    fetch('/admin/addproduct', {
      method: 'POST',

      body: formData

    })
      .then((response) => {
        response.json()
          .then((response) => {
            if (response.success) {
              Swal.fire(
                'Created',
                'New porduct Added',
                'success'
              )
                .then(() => {
                  location.href = '/admin/products'
                })
            }
          })
      })

  }
});
