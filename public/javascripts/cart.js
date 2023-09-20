console.log('connected')
const popup = document.querySelector('.popup-container');

document.querySelectorAll('.cart-remove').forEach((button)=>{
  button.addEventListener('click',(e)=>{
    popup.style.display='block'
  })
})

function closePopup(){
  popup.style.display='none'
}
async function deleteCartItem (productId){
 await fetch('/removecart',{
    method:'DELETE',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({productId})
  })
    window.location.reload()
}

