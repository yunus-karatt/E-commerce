import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const updateForm = document.querySelector('#update-profile');
const savePofile = document.querySelector('#save-profile');
const profileEdit = document.querySelector('#profile-edit');
const updateEmail = document.querySelector('#updateEmail');
const updateUsername = document.querySelector('#updateUsername');
const saveMobile = document.querySelector('#save-mobile');
const mobileEdit = document.querySelector('#mobile-edit');
const updateMobile = document.querySelector('#updateMobile');
const mobileErr = document.querySelector('#mobile-error');
const otpDiv = document.querySelector('.otp-div');
const saveotp = document.querySelector('#save-otp');
const otp = document.querySelector('#otp');
const mobileDiv = document.querySelector('#mobile-div');
const changePass = document.querySelector('#password-chage');
const passwordOtpdiv = document.querySelector('.password-otp');
const emailOtpForm = document.querySelector('#emial-otp-form');
const savePassDiv = document.querySelector('.change-ps');
const changePassForm = document.querySelector('#change-ps-form');
const changePassErr = document.querySelector('#change-ps-err');
const maileOtpErr = document.querySelector('#mail-otp-error');
const profileErr = document.querySelector('.profileErr');

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
let mobileNumber;

const firebaseConfig = {
  apiKey: "AIzaSyAYbmkCfbyyY7hWKKsbTxWTZqH8EwEAWTs",
  authDomain: "e-commerce-ff372.firebaseapp.com",
  projectId: "e-commerce-ff372",
  storageBucket: "e-commerce-ff372.appspot.com",
  messagingSenderId: "201968717019",
  appId: "1:201968717019:web:e20ca9a3700ec9261d90fe",
  measurementId: "G-4C36EDFLE4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

savePofile.addEventListener('click', async (e) => {
  e.preventDefault()

  const updateData = {
    userName: updateForm.updateUsername.value,
    email: updateForm.updateEmail.value
  }

  if (updateData.userName == '' || updateData.email == '') {
    profileErr.innerHTML = 'Please fill all fields'
  } else if (emailRegex.test(updateData.email) == false) {
    profileErr.innerHTML = 'Please check your mail'
  } else {
    await fetch('/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updateData })
    }).then((response) => {
      response.json().then((response) => {
        if (response.update) {
          updateEmail.disabled = true
          updateUsername.disabled = true
          profileEdit.style.display = 'block'
          savePofile.style.display = 'none'
          updateForm.updateUsername.value = updateData.userName
          updateForm.updateEmail.value = updateData.email
          profileErr.innerHTML = ''
        }
      })
    })
  }
})

profileEdit.addEventListener('click', (e) => {
  e.preventDefault()
  updateEmail.disabled = false
  updateUsername.disabled = false
  profileEdit.style.display = 'none'
  savePofile.style.display = 'block'
})

// EDIT MOBILE NUMBER
mobileEdit.addEventListener('click', (e) => {
  e.preventDefault()
  updateMobile.disabled = false
  mobileEdit.style.display = 'none'
  saveMobile.style.display = 'block'
})


window.recaptchaVerifier = new RecaptchaVerifier(auth, 'save-mobile', {
  'size': 'invisible',
  'callback': (response) => {
    // reCAPTCHA solved, allow signInWithPhoneNumber.
  }
})

saveMobile.addEventListener('click', async (e) => {
  e.preventDefault()
  mobileNumber = updateMobile.value
  if (mobileNumber === '') {
    mobileErr.innerHTML = 'Please enter number  '
  } else if (mobileNumber.length != 10) {
    mobileErr.innerHTML = 'Please check your number'
  } else {
    const fmobileNumber = '+91' + mobileNumber
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, fmobileNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        otpDiv.style.display = 'block'
        mobileDiv.style.display = 'none'
        // ...
      }).catch((error) => {
        // Error; SMS not sent
        mobileErr.innerHTML = "Sorry, Can't send otp. Please check your mobile number"
      });
  }
})

saveotp.addEventListener('click', (e) => {
  e.preventDefault()
  let otp_number = otp.value
  confirmationResult.confirm(otp_number).then(async (result) => {
    // User signed in successfully.
    const user = result;
    await fetch('/change-number', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobileNumber }),
    }).then((response) => {
      response.json().then((response) => {
        if (response.updated) {
          window.location.reload()
        }
      })
    }).catch((err) => {
    })
  })
})

changePass.addEventListener('click', (e) => {
  const email = changePass.getAttribute('userEmail')
  fetch('/send-emial-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  }).then((response) => {
    passwordOtpdiv.style.display = 'block';
    changePass.style.display = 'none';
  })
})

emailOtpForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const otp = emailOtpForm.emailOtp.value
  if (otp == '') {
    maileOtpErr.innerHTML = 'Please enter OTP'
  } else {
    await fetch('/confirm-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ otp })
    }).then((response) => {
      response.json().then((response) => {
        if (response.otpVerified) {
          savePassDiv.style.display = 'block';
          passwordOtpdiv.style.display = 'none'
        } else {
          console.log('otp not matched')
        }
      })
    })
  }
})

changePassForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const mobileNumber = changePassForm.getAttribute('mobile')
  const passData = {
    password: changePassForm.changePs.value,
    confirmPassword: changePassForm.changePsCfm.value
  }
  if (passData.password == '') {
    changePassErr.innerHTML = 'Please Enter Passwod'
  } else if (passData.confirmPassword == '') {
    changePassErr.innerHTML = 'Please Enter confirm Passwod'
  } else if (passData.password.length < 8) {
    changePassErr.innerHTML = 'Password minimum length should be eight'
  } else if (passData.password !== passData.confirmPassword) {
    changePassErr.innerHTML = "Your password doesn't match"
  } else {

    await fetch('/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobileNumber, passData })
    }).then((response) => {
      response.json().then((response) => {
        if (response.updated) {
          window.location.reload()
        }
      })
    })
  }
})       