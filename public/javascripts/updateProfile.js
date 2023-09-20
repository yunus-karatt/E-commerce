

const updateForm = document.querySelector('#update-profile')
const savePofile = document.querySelector('#save-profile')
const profileEdit = document.querySelector('#profile-edit')
const updateEmail = document.querySelector('#updateEmail')
const updateUsername = document.querySelector('#updateUsername')

savePofile.addEventListener('click', (e) => {
  e.preventDefault()

  const updateData = {
    userName: updateForm.updateUsername.value,
    email: updateForm.updateEmail.value
  }
  console.log(updateData)
  fetch('/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ updateData })
  }).then((response) => {
    response.json().then((response) => {
      console.log(response)
      if (response.update) {
        updateEmail.disabled = true
        updateUsername.disabled = true
        profileEdit.style.display = 'block'
        savePofile.style.display = 'none'
        updateForm.updateUsername.value = updateData.userName
        updateForm.updateEmail.value = updateData.email
      }
    })


  })
})

profileEdit.addEventListener('click', (e) => {
  e.preventDefault()
  updateEmail.disabled = false
  updateUsername.disabled = false
  profileEdit.style.display = 'none'
  savePofile.style.display = 'block'
})