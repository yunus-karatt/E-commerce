// const userName = document.getElementById('Username').value
// const password= document.getElementById('Password').value
const loginForm = document.querySelector('#submission');

const error = document.querySelector('.loginerror')
console.log('page connected')
loginForm.addEventListener('submit',(e)=>{
  const userName= loginForm.Username.value
const password= loginForm.Password.value
  
  console.log(userName)
  if(userName==''||password==''){
    e.preventDefault()
    error.innerHTML='please fill all fields'
  }
})