document.querySelectorAll('.cancel-order').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    let orderId = link.getAttribute('order-id');
    const paymentMethod=link.getAttribute('paymentMethod')
    Swal.fire({
      title: 'Are you sure?',
      text: "Cancel the Order!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        // window.location.href=`/cancel-order/${orderId}`
        Swal.fire({
          title: 'Please tell us the reason for cancell',
          input: 'text',
          inputPlaceholder: 'Type something...',
          showCancelButton: true,
          confirmButtonText: 'Submit',
        }).then(async (result) => {
          if (result.isConfirmed) {
            userInput = result.value;
            // window.location.href = `/cancel-order/${orderId}`
            await fetch('/cancel-order', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ orderId, userInput, paymentMethod })
            })
            .then(()=>window.location.reload())

          }
        });
      }
    })
  })
})

document.querySelectorAll('.product-remove').forEach((product) => {
  product.addEventListener('click', (e) => {
    e.preventDefault()
    let orderId = product.getAttribute('order-id');
    let prodcutId = product.getAttribute('product-id');
    Swal.fire({
      title: 'Are you sure?',
      text: "Remove product from your Order!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Romove!'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `/cancel-single-order/${orderId}/${prodcutId}`
      }
    })
  })
})