const checkOutAdd = document.getElementById('checkOutAdd');
const addErr = document.querySelector('.addErr');
const addressRadio = document.querySelectorAll('input[name="flexRadioDefault"]');
const checkOutForm = document.querySelector('#checkOutForm');
const productData = document.querySelectorAll('.product');
const existAddressDiv = document.querySelector('.existAddressDiv');
const addressCanceBtn = document.querySelector('#addressCanceBtn');
const viewCouponBtn = document.querySelector('#viewCouponBtn');
const couponDiv = document.querySelector('#couponDiv');
const discountPrice = document.querySelector('.discountPrice')
const totalPayable = document.querySelector('.totalPayable')
const discountDisplay = document.querySelector('.discountDisplay');

let addressId;
const totalPrice = document.querySelector('input[name="totalPrice"]').value
const WalletBalance = document.querySelector('input[name="walletBalance"]').value
console.log(typeof (WalletBalance))
let totalValue;
let couponId;
let product = []
const templateString = `
{{#each couponData}}
<div class="card col-12 my-2">
<div class="card-body">
<span claass="text-muted">coupen code</span>{{couponCode}}<br>
{{description}} </br>
<button class="btn btn-primary btn-sm float-end applybtn" data-coupon-id="{{_id}}" data-coupon-discount="{{discountValue}}" 
data-coupon-purchaseLimit="{{purchaseLimit}}" coupon-code="{{couponCode}}"
>APPLY</button>
</div>
</div>
  {{/each}}
`
const template = Handlebars.compile(templateString)

// coupon
viewCouponBtn.addEventListener('click', async (e) => {
  fetch('/getCoupons')
    .then((response) => {
      response.json()
        .then((response) => {
          couponDiv.style.display = 'block'
          const productHtml = template({ couponData: response });
          couponDiv.innerHTML = productHtml
        })
    })
})

couponDiv.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('applybtn')) {
    couponId = e.target.getAttribute('data-coupon-id');
    const couponDiscount = e.target.getAttribute('data-coupon-discount');
    const couponPurchaseLimit = e.target.getAttribute('data-coupon-purchaseLimit');
    const couponCode = e.target.getAttribute('coupon-code');
    if (parseInt(totalPrice) < parseInt(couponPurchaseLimit)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `coupon only for above ${couponPurchaseLimit} purachases `,
      })
    } else {
      const discountValue = totalPrice * couponDiscount / 100
      totalValue = totalPrice - discountValue;
      discountDisplay.style.display = 'block'
      discountPrice.innerHTML = discountValue;
      totalPayable.innerHTML = totalValue;
      document.querySelector('.couponCodeP').innerHTML = couponCode
      couponDiv.style.display = 'none'
    }


    // console.log(`Button clicked for coupon code: ${couponId},${couponDiscount},${couponPurchaseLimit}`);

    // You can perform additional actions here, such as applying the coupon.
  }
});


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

      if (totalValue == null) {
        totalValue = totalPrice
      }
      let orderData = {
        addressId: addressId,
        paymentMethod: checkOutForm.paymentMethod.value,
        product: product,
        couponId: couponId,
        totalPrice: totalValue
      }
      if (orderData.paymentMethod === 'cod') {
        orderData.orderStatus = 'placed'
      } else if (orderData.paymentMethod === 'wallet') {

        if (parseInt(orderData.totalPrice) > parseInt(WalletBalance)) {

          Swal.fire(
            'Not enough balance in the wallet',
            'Please choose another payment option',
            'warning'
          )
        } else {
          orderData.orderStatus = 'placed'
        }
      }
      else {
        orderData.orderStatus = 'pending'
      }


      if (orderData.orderStatus) {
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
                if (response.status.status === 'cod'||response.status.status === 'wallet') {
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
                      window.location.href = `/view-order-details/${response.status.orderId}`
                    }
                  });
                } else if (response.status.method === 'online') {
                  razorPayPayment(response)
                }
              })
          })
      }

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
    "order_id": order.status.id,
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
          window.location.href = `/view-order-details/${response.orderId}`
        }
      })
  })
}