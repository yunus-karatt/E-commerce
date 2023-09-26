console.log('connected')
document.querySelectorAll('.deleteCart').forEach((button) => {
  button.addEventListener('click', async (e) => {
    const productId = button.getAttribute('productId');
    Swal.fire({
      title: 'Are you sure?',
      text: "Remove from cart !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch('/removecart', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        })
        window.location.reload()
      }
    })
  })
})

async function updateCart(productId, count , existCount, butid) {
  const button= document.getElementById(butid)
  await fetch('/update-cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, count,existCount })
  })
    .then((response) => {
      response.json()
        .then((response) => {
          if (response.updated) {
            window.location.reload()
          }else{
            Swal.fire(
              'SORRY!',
              "We didn't have enough stock",
              'info'
            )
              button.disabled=true
            
          }
        })
    })
}

document.querySelectorAll('.cartBtn').forEach((button)=>{
  const count= button.getAttribute('count')
  if(count==1){
    button.disabled=true
  }
})