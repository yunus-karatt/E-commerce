const addressFrom= document.querySelector('#address-form');
const addressError= document.querySelector('#addressError');

addressFrom.addEventListener('submit',(e)=>{
  e.preventDefault()
  const firstName= addressFrom.firstName.value;
  const lastName= addressFrom.lastName.value;
  const inputAddress= addressFrom.inputAddress.value;
  const inputCity= addressFrom.inputCity.value;
  const inputState= addressFrom.inputState.value;
  const inputZip= addressFrom.inputZip.value;
  
  if(firstName==''||lastName==''||inputAddress==''||inputCity==''||inputState==''||inputZip==''){
    addressError.innerHTML='Please fill all fields'
  }else{
    addressFrom.submit()
  }
})