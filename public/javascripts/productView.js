// product-view.js
document.addEventListener('DOMContentLoaded', function() {
  const smallImages = document.querySelectorAll('.imgSm');
  const largeImage = document.querySelector('.imgLg');

  smallImages.forEach(function(imgSm) {
    imgSm.addEventListener('mouseover', function() {
      largeImage.src = imgSm.src;
    });
  });
});

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
         Swal.fire({
           title: 'Added to cart',
           text: "Go to cart for checkout",
           icon: 'success',
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#008000',
           confirmButtonText: 'Go to cart',
           cancelButtonText:'Continue shopping'
         }).then((result) => {
           if (result.isConfirmed) {
             // Swal.fire(
             //   'Deleted!',
             //   'Your file has been deleted.',
             //   'success'
             // )
             window.location.href='/viewcart'
           }
         })
     }else{
       window.location.href='/login'
     }
   })
  })
 })