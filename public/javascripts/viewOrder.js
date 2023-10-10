// const { json } = require("body-parser");

document.querySelectorAll('.itemStatus').forEach((status, index) => {
  if (status.textContent.trim() === 'cancelled') {
    // Select the corresponding card footer and hide it
    const cardFooter = document.querySelectorAll('.card-footer')[index];
    if (cardFooter) {
      cardFooter.style.display = 'none';
    }
  }
});

document.querySelectorAll('.order-cancel').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const orderId = link.getAttribute('order-id')
    const paymentMethod=link.getAttribute('order-method')
    let userInput
    Swal.fire({
      title: 'Are you sure?',
      text: "Cancel the Order!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Please tell us the reason for cancell',
          input: 'text',
          inputPlaceholder: 'Type something...',
          showCancelButton: true,
          confirmButtonText: 'Submit',
        }).then(async(result) => {
          if (result.isConfirmed) {
            userInput = result.value;
            // window.location.href = `/cancel-order/${orderId}`
            await fetch('/cancel-order',{
              method:'post',
              headers:{
                'Content-Type':'application/json'
              },
              body:JSON.stringify({orderId,userInput,paymentMethod})
            })
            .then(()=>window.location.reload())

          }
        });

      }
    })
  })
})

document.querySelectorAll('.track').forEach((track) => {
  track.addEventListener('click', (e) => {
    e.preventDefault();
    let id = track.getAttribute('order-id')
    let progressBar = document.getElementById(`progressbar-${id}`)
    let orderStatus = track.getAttribute('status')
    if (progressBar.style.display === 'block') {
      progressBar.style.display = 'none';
    } else {
      progressBar.style.display = 'block';
    }
    console.log(orderStatus)
    if (orderStatus == 'shipped') {
      document.getElementById(`step2-${id}`).classList.add('active')
    } else if (orderStatus === 'delivered') {
      document.getElementById(`step2-${id}`).classList.add('active')
      document.getElementById(`step3-${id}`).classList.add('active')
    }
  })

})