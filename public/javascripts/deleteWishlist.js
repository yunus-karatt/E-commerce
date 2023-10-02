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