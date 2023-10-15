// const { json } = require("body-parser");

const addBtn = document.getElementById('addCouponBtn');
const AddCpnForm = document.getElementById('AddCpnForm');
const couponDiv = document.querySelector('.couponDiv');

(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault()
      event.stopPropagation()
      if (form.checkValidity()) {
        const formData = new FormData(form);
        try {
          const response = await fetch('/admin/create-coupon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: new URLSearchParams(formData).toString() 
          });

          if (response.ok) {
            window.location.reload()
          } else {
            console.error('Form submission failed');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

addBtn.addEventListener('click', (e) => {
  AddCpnForm.style.display = 'block';
  couponDiv.style.display = 'none';
})


