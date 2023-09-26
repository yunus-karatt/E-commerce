console.log('connected')
const checkOutAdd = document.getElementById('checkOutAdd');
const addErr = document.querySelector('.addErr');
const addressRadio = document.querySelectorAll('input[name="flexRadioDefault"]');
const checkOutForm = document.querySelector('#checkOutForm');
const productData = document.querySelectorAll('.product');
const existAddressDiv= document.querySelector('.existAddressDiv');
const addressCanceBtn= document.querySelector('#addressCanceBtn')
let addressId;
let product = []

productData.forEach((productElement) => {
  const productId = productElement.getAttribute('productId')
  const quantity = productElement.getAttribute('quantity');
  const pricePerQnt= productElement.getAttribute('pricePerQnt')
  product.push({ productId, quantity,pricePerQnt })
})
// new address
document.getElementById('addNewAddress').addEventListener('click', (e) => {
  existAddressDiv.style.display='none'
  checkOutAdd.style.display = 'block';
})

addressCanceBtn.addEventListener('click',(e)=>{
  existAddressDiv.style.display='block'
  checkOutAdd.style.display = 'none';
})

checkOutAdd.addEventListener('submit', async (e) => {
  e.preventDefault()
  const checkOutAddData = {
    firstName: checkOutAdd.firstName.value,
    lastName: checkOutAdd.lastName.value,
    inputAddress: checkOutAdd.inputAddress.value,
    inputCity: checkOutAdd.inputCity.value,
    inputState: checkOutAdd.inputState.value,
    inputZip: checkOutAdd.inputZip.value,
  }


  if (checkOutAddData.firstName == '' || checkOutAddData.lastName == '' || checkOutAddData.inputAddress == '' || checkOutAddData.inputCity == '' || checkOutAddData.inputState == '' || checkOutAddData.inputZip == '') {
    // checkOutAdd.classList.add='not-validated'
    addErr.innerHTML = 'Please fill All fields'
  } else {
    // checkOutAdd.classList.add='was-validated'
    // checkOutAdd.submit()
    await fetch('/addaddress', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ checkOutAddData })

    })
      .then((response) => {

        response.json()
          .then((response) => {
            addressId = response.addressId;
            checkOutAdd.style.display = 'none';
          })
      })
  }
}, false)


addressRadio.forEach((button) => {
  button.addEventListener('click', (e) => {
    addressId = button.value;
  })
})

checkOutForm.addEventListener('submit',async (e) => {
  e.preventDefault()
  if (!addressId) {
    Swal.fire(
      'Address?',
      'Please select or provide your address',
      'warning'
    )
    console.log('Please select a address')
  } else {
    if (checkOutForm.paymentMethod.value == '') {
      Swal.fire(
        'Payment Method?',
        'Please select your payment method',
        'warning'
      )
      console.log('Please select a payment method')
    } else {
      
        const totalPrice= document.querySelector('input[name="totalPrice"]').value
      const orderData = {
        addressId: addressId,
        paymentMethod: checkOutForm.paymentMethod.value,
        product: product,
        totalPrice: totalPrice
      }
      await fetch('/place-order',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({orderData})
      })
      .then((response)=>{
        response.json()
        .then((response)=>{
          console.log(response)
          if(response.orderplaced){
            Swal.fire({
              title: 'Order placed',
              text: 'Track your order at Orders',
              icon: 'success',
              showCancelButton: true, // Disable the cancel button
              confirmButtonText: 'Continue shopping',
              // showCloseButton: true,
              // closeButtonAriaLabel: 'Go to orders',
              cancelButtonText: 'Go to orders',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href='/'
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href='/view-order'
              }
            });
            
                console.log('order placed')
              }
        })
      })
    }

  }
})
