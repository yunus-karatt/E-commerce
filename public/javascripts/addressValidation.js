const addressFrom = document.querySelector('#address-form');
const addressError = document.querySelector('#addressError');
const locationbtn = document.querySelector('.location')
addressFrom.addEventListener('submit', (e) => {
  e.preventDefault()
  const firstName = addressFrom.firstName.value;
  const lastName = addressFrom.lastName.value;
  const inputAddress = addressFrom.inputAddress.value;
  const inputCity = addressFrom.inputCity.value;
  const inputState = addressFrom.inputState.value;
  const inputZip = addressFrom.inputZip.value;

  if (firstName == '' || lastName == '' || inputAddress == '' || inputCity == '' || inputState == '' || inputZip == '') {
    addressError.innerHTML = 'Please fill all fields'
  } else {
    addressFrom.submit()
  }
})

locationbtn.addEventListener('click', (e) => {
  let locationData
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=b98b406c2108486db5d7ffe6747ca238`
    await fetch(url).then(res => res.json()).then(data => locationData = data.features[0].properties)
    addressFrom.inputAddress.value = locationData.formatted
    addressFrom.inputCity.value = locationData.city
 
    addressFrom.inputState.value = locationData.state
    addressFrom.inputZip.value = locationData.postcode

  })

})