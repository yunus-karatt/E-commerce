const checkOutAdd = document.getElementById('checkOutAdd');
const addErr = document.querySelector('.addErr');
const addressRadio = document.querySelectorAll('input[name="flexRadioDefault"]');
const checkOutForm = document.querySelector('#checkOutForm');
const productData = document.querySelectorAll('.product');
const existAddressDiv = document.querySelector('.existAddressDiv');
const addressCanceBtn = document.querySelector('#addressCanceBtn')
let addressId;
let product = []

productData.forEach((productElement) => {
  const productId = productElement.getAttribute('productId')
  const quantity = productElement.getAttribute('quantity');
  const pricePerQnt = productElement.getAttribute('pricePerQnt')
  product.push({ productId, quantity, pricePerQnt })
})

// new address
document.getElementById('addNewAddress').addEventListener('click', (e) => {
  existAddressDiv.style.display = 'none'
  checkOutAdd.style.display = 'block';
})

addressCanceBtn.addEventListener('click', (e) => {
  existAddressDiv.style.display = 'block'
  checkOutAdd.style.display = 'none';
  addErr.innerHTML = ''
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

checkOutForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!addressId) {
    Swal.fire(
      'Address?',
      'Please select or provide your address',
      'warning'
    )
  } else {
    if (checkOutForm.paymentMethod.value == '') {
      Swal.fire(
        'Payment Method?',
        'Please select your payment method',
        'warning'
      )
    } else {

      const totalPrice = document.querySelector('input[name="totalPrice"]').value
      let orderData = {
        addressId: addressId,
        paymentMethod: checkOutForm.paymentMethod.value,
        product: product,
        totalPrice: totalPrice
      }
      if (orderData.paymentMethod === 'cod') {
        orderData.orderStatus = 'placed'
      } else {
        orderData.orderStatus = 'pending'
      }

      await fetch('/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderData })
      })
        .then((response) => {
          response.json()
            .then((response) => {
              if (response.method === 'cod') {
                console.log(response)
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
                    window.location.href = '/'
                  } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = '/view-order'
                  }
                });
              } else if (response.status.method === 'online') {
                razorPayPayment(response)
              }
            })
        })
    }
  }
})

function razorPayPayment(order) {
  console.log('..........', order)
  var options = {
    "key": "rzp_test_ZAyPL2XD7S33Zs", // Enter the Key ID generated from the Dashboard
    "amount": order.status.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Quandum Gadgets",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.status.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response) {
      verifyPayment(response, order)
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9000090000"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#212529"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.on('payment.failed', function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });
  rzp1.open();
}

function verifyPayment(response, order) {
  fetch('/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ response, order })
  }).then((response) => {
    response.json()
      .then(response => {
        if (response.updated) {
          window.location.href = '/view-order'
        }
      })
  })
}