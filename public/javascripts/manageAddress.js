const addressManage= document.querySelector('.address-manage')

document.querySelectorAll('.delete-address').forEach((trash)=>{
  trash.addEventListener('click',(e)=>{
    const addressId = trash.getAttribute('addressid')
    console.log(addressId) 
    fetch('/deleteAddress',{
      method:'DELETE',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({addressId})
    }).then((response)=>{
      if(response.ok){
        const addressDiv= trash.closest('.address')
        addressDiv.remove()
      }
    }).catch((ere)=>{
      console.error(ere)
    })
  })
})

