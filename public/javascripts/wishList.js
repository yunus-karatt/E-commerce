
async function getWishList() {
  try {
    const response = await fetch('/api/wishlist');
     
    const wishlistData =await response.json()
   console.log(wishlistData)
    document.querySelectorAll('.love-button').forEach(button => {
      let productId = button.getAttribute('product-id');
      // console.log(productId)
      if(wishlistData.length>0){
        
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
        console.log(wishListData)
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wishListData)
        }).catch((err) => console.log(err))
        console.log('button clicked')
      }))
    })
  }
  catch (err) {
    console.log(err)
  }
}
window.addEventListener('load', getWishList())
// add to cart
document.querySelectorAll('.addCart').forEach((button)=>{
 const productId= button.getAttribute('product-id');
 button.addEventListener('click',async(e)=>{
  console.log(productId)
 await fetch('/api/addcart',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
    },
    body: JSON.stringify({productId})
  }).then((response)=>{
    return response.json()
    
  }).then((data)=>{
    if(data.loggedIn){
        // popup.style.display='block'
        // Swal.fire({
        //   title: 'Added to cart',
        //   text: "Go to cart for checkout",
        //   icon: 'success',
        //   showCancelButton: true,
        //   confirmButtonColor: '#3085d6',
        //   cancelButtonColor: '#008000',
        //   confirmButtonText: 'Go to cart',
        //   cancelButtonText:'Continue shopping'
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     // Swal.fire(
            //   'Deleted!',
            //   'Your file has been deleted.',
            //   'success'
            // )
            window.location.href='/viewcart'
          // }
        // })
    }
    else{
      window.location.href='/login'
    }
  })
 })
})