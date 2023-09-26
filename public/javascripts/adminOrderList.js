

document.querySelectorAll('.orderManageBtn').forEach((btn)=>{
  btn.addEventListener('click',async (e)=>{
    const orderId = btn.getAttribute('orderId');
    const productId= btn.getAttribute('productId');
    await fetch(`/admin/manage-order/${orderId}/${productId}`)
  })
})