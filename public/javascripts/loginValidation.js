const loginForm = document.querySelector('#submission');
const error = document.querySelector('.loginerror');

loginForm.addEventListener('submit', (e) => {
  const userName = loginForm.Username.value
  const password = loginForm.Password.value
  if (userName == '' || password == '') {
    e.preventDefault()
    error.innerHTML = 'please fill all fields'
  }
})