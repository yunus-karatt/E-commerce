const catValue = document.getElementById('categorySelect')
const processor = document.getElementById('processor')
catValue.addEventListener('change',(e)=>{
  if(catValue.value=='Laptop'){
    processor.style.display='block'
  }else{
    processor.style.display='none'
  }
})
