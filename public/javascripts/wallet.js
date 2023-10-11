const topUpBtn=document.querySelector('#topUpBtn')

function copyReferralCode(referralCode){
  if (navigator.clipboard) {
    navigator.clipboard.writeText(referralCode)
      .then(function() {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: "Referral code copied: " + referralCode,
          showConfirmButton: false,
          timer: 1500
        })
      })
      .catch(function(err) {
        console.error("Unable to copy referral code: ", err);
      });
  } else {
    console.error("Clipboard API not available in this browser.");
  }
}

function razorPayPayment(order) {
  console.log(order)
  var options = {
    "key": "rzp_test_ZAyPL2XD7S33Zs", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Quandum Gadgets",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id,
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
  console.log(response,order)
  fetch('/verify-topup-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ response, order })
  }).then((response) => {
    response.json()
      .then(response => {
        if (response.updated) {
          Swal.fire('Success!', `You've topped up  your wallet.`, 'success')
          .then(()=>window.location.reload())
        }
      })
  })
}

topUpBtn.addEventListener('click',(e)=>{
  Swal.fire({
    title: 'Top Up Your Wallet',
    text: 'Enter the top-up amount (below ₹25000):',
    input: 'text',
    inputAttributes: {
      inputmode: 'numeric',
      pattern: '[0-9]*'
    },
    showCancelButton: true,
    confirmButtonText: 'Top Up',
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return 'Please enter the top-up amount';
      }
      if (!/^\d+$/.test(value)) {
        return 'Please enter a valid top-up amount (digits only)';
      }
      if (parseInt(value) >= 25000) {
        return 'Top-up amount must be below ₹25000';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const topupAmount = parseInt(result.value);
      fetch(`/topup-wallet/${topupAmount}`)
      .then((response)=>{
        response.json()
        .then((response)=>{
          razorPayPayment(response)
        })
      })
    }
  });
  
  
})