document.querySelectorAll('.wish-button').forEach((button) => {
  button.addEventListener('click', (e) => {
    const userId = button.getAttribute('userId')
    const productId = button.getAttribute('productId')
    const wishData = {
      userId,
      productId
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "Remove from wishlist !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        fetch('/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wishData)
        }).then((response) => {

          if (response.ok) {
            const wishlistItem = button.closest('.wishlist-item');
            wishlistItem.remove();
            const remainingWishlistItem = document.querySelectorAll('.wishlist-item')
            if (remainingWishlistItem.length === 0) {
              window.location.reload()
            }
          }
        }).catch((err) => console.log(err))
      }
    })

  })
})

document.querySelectorAll('.addCart').forEach((btn)=>{
  btn.addEventListener('click',async(e)=>{
    const productId = btn.getAttribute('product-id')
    await fetch('/api/addcart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId })
    }).then((response) => {
      return response.json();
    }).then((data) => {
      if (data.loggedIn) {
        window.location.href = '/viewcart';
      } else {
        window.location.href = '/login';
      }
    });
  })
})