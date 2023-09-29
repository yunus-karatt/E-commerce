document.querySelectorAll('.cancel-order').forEach((link)=>{
  link.addEventListener('click',(e)=>{
    e.preventDefault()
    let orderId= link.getAttribute('order-id');
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
        window.location.href=`/cancel-order/${orderId}`
      }
    })
  })
})

document.querySelectorAll('.product-remove').forEach((product)=>{
  product.addEventListener('click',(e)=>{
    e.preventDefault()
    let orderId=product.getAttribute('order-id');
    let prodcutId= product.getAttribute('product-id');
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
        window.location.href=`/cancel-single-order/${orderId}/${prodcutId}`
      }
    })
  })
})