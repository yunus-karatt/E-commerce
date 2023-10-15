document.querySelectorAll('.addCart').forEach((button)=>{
  button.addEventListener('click',async(e)=>{
    const productId = button.getAttribute('product-id');
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

document.querySelectorAll('.love-button').forEach((button)=>{
  button.addEventListener('click',async(e)=>{
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
  })
})