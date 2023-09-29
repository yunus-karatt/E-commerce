async function getWishList() {
  try {
    const response = await fetch('/api/wishlist');
    const wishlistData = await response.json()

    document.querySelectorAll('.love-button').forEach(button => {
      let productId = button.getAttribute('product-id');

      if (wishlistData.length > 0) {
        if (wishlistData[0].productId.includes(productId)) {
          button.classList.add('loved');
        } else {
          button.classList.remove('loved')
        }
      }

      button.addEventListener('click', (async () => {
        const productId = button.getAttribute('product-id')
        const userId = button.getAttribute('user-id')

        const wishListData = {
          productId,
          userId
        }
        button.classList.toggle('loved');
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wishListData)
        }).catch((err) => console.log(err))
      }))
    })
  }
  catch (err) {
    console.log(err)
  }
}
window.addEventListener('load', getWishList())


// add to cart
document.querySelectorAll('.addCart').forEach((button) => {
  const productId = button.getAttribute('product-id');
  button.addEventListener('click', async (e) => {
    await fetch('/api/addcart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId })
    }).then((response) => {
      return response.json()

    }).then((data) => {
      if (data.loggedIn) {
        window.location.href = '/viewcart'
      }
      else {
        window.location.href = '/login'
      }
    })
  })
})