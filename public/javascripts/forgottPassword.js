import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const forgottPasswordSection = document.querySelector('#forgott-password-section');
const mobileLoginForm = document.getElementById('mobile-login-form');
const otpLoginSection = document.getElementById('otp-login-section');
const otpLoginForm = document.getElementById('otp-login-form');
const badNumAlert = document.querySelector('.badnumalert');
const badOtpAlert = document.querySelector('.loginotpalert')
const passwordSection = document.querySelector('#change-ps-section')
const passwordForm = document.querySelector('#change-ps-form')
const badPasswordAlert = document.querySelector('.badPasswordAlert')

let mobileNumber;

//  fire base
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

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'submitPhone', {
  'size': 'invisible',
  'callback': (response) => {
    // reCAPTCHA solved, allow signInWithPhoneNumber.
  }
})


mobileLoginForm.addEventListener('submit', (e) => {
  e.preventDefault()

  mobileNumber = mobileLoginForm.mobilelogininput.value
  // validate mobile number/
  if (mobileNumber == '') {
    badNumAlert.innerHTML = 'Mobile Number is required'
  } else if (mobileNumber.length != 10) {
    badNumAlert.innerHTML = 'Please Enter a valid Mobile Number'
  } else {
    // checking Mobile number exist
    fetch('/check-mobile-exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobileNumber })
    }).then((response) => {
      response.json().then((response) => {
        if (response.user.Mobilenumber) {
          const fmobileNumber = '+91' + mobileNumber
          const appVerifier = window.recaptchaVerifier;
          signInWithPhoneNumber(auth, fmobileNumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              forgottPasswordSection.style.display = 'none';
              otpLoginSection.style.display = 'block';
              // ...
            }).catch((error) => {
              // Error; SMS not sent

              badNumAlert.innerHTML = "Sorry, Can't send otp. Please check your mobile number"
            });
        } else {
          badNumAlert.innerHTML = "cannot find your number, please signup first"
        }
      })
    })
  }
})

// OTP submition
otpLoginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  let otp_number = otpLoginForm.digit.value
  confirmationResult.confirm(otp_number)
    .then(async (result) => {
      // User signed in successfully.
      const user = result;
      otpLoginSection.style.display = 'none';
      passwordSection.style.display = 'block'
    }).catch((err) => {
      badOtpAlert.innerHTML = "OTP doesn't match"
    })
})

// update Password
passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const passData = {
    password: passwordForm.password.value,
    confirmPassword: passwordForm.confirmPassword.value
  }
  // VALIDATE PASSWORD
  if (passData.password == '') {
    badPasswordAlert.innerHTML = 'Please Enter Passwod'
  } else if (passData.confirmPassword == '') {
    badPasswordAlert.innerHTML = 'Please Enter confirm Passwod'
  } else if (passData.password.length < 8) {
    badPasswordAlert.innerHTML = 'Password minimum length should be eight'
  } else if (passData.password !== passData.confirmPassword) {
    badPasswordAlert.innerHTML = "Your password doesn't match"
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
          window.location.href = '/login'
        }
      })
    })
  }
})