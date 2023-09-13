import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
// import { showAlert, hideAlert } from './javascript';

const firebaseConfig = {
  apiKey: "AIzaSyDHjeIovSp7TBAEAIFfBpP9Sc3QfPkSOzU",
  authDomain: "quantum-gadgets.firebaseapp.com",
  projectId: "quantum-gadgets",
  storageBucket: "quantum-gadgets.appspot.com",
  messagingSenderId: "594768256182",
  appId: "1:594768256182:web:a96036f981540d2eb0da17",
  measurementId: "G-V0KSGV5TL4"
};
let userData;
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const loginform = document.querySelector('#signup-form')
const loginsection = document.querySelector('#login-section')
const otpsection = document.querySelector('#otp-section')
const otpform = document.querySelector('#otp-form')
const errorP = document.querySelector('.passwordalert')
const otpalert = document.querySelector('.otpalert')
const currentURL = window.location.href;
if (currentURL.includes('/signup')) {
  console.log('hai')
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log('captcha verified')
    }
  });
  loginform.addEventListener('submit', async (e) => {
    e.preventDefault()
    userData = {
      Username: loginform.Username.value,
      Password: loginform.Password.value,
      Confirmpassword: loginform.Confirmpassword.value,
      Mobilenumber: loginform.Mobilenumber.value,
      Email: loginform.Email.value
    }

    if (userData.Password !== userData.Confirmpassword) {
      errorP.innerHTML = "Password doesn't match."
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      const mobilenumber = '+91' + loginform.Mobilenumber.value
      const appVerifier = window.recaptchaVerifier;
      await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      }).then((response) => {
        if (response.status === 400) {
          window.location.href = '/login'
          alert('Please login, Already signedIn')
        } else if (response.status === 200) {
          signInWithPhoneNumber(auth, mobilenumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              loginsection.style.display = 'none';
              otpsection.style.display = 'block';
              // ...
            }).catch((error) => {
              // Error; SMS not sent
              // ...
              errorP.innerHTML = "Sorry, Can't send otp"
              setTimeout(() => {
                window.location.reload()
              }, 1000)
              console.log(error)
            });
        }
      })
    }
  })
  otpform.addEventListener('submit', (e) => {
    e.preventDefault()
    let otp_number = otpform.otp.value
    console.log(otp_number)
    confirmationResult.confirm(otp_number).then(async (result) => {
      // User signed in successfully.
      const user = result;
      await fetch('/createsession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      }).then(() => {
        otpform.otp.value = '';

        window.location.href = '/';
      }).catch((err) => {
        console.log(err)
      })

      // console.log(user)
      // ...
    }).catch((error) => {
      // User couldn't sign in (bad verification code?)
      // ...
      loginsection.style.display = 'none';
      otpsection.style.display = 'block';
      otpalert.innerHTML = "otp didn't match"
    });
  })
} else {
  const mobileLoginSection = document.getElementById('mobile-login-section')
  const mobileLoginForm = document.querySelector('#mobile-login-form')
  const otpLoginSection = document.querySelector('#otp-login-section')
  const otpLoginForm = document.querySelector('#otp-login-form')
  const loginotpalert = document.querySelector('.loginotpalert')
  const badnumalert = document.querySelector('.badnumalert')

  window.recaptchaVerifiers = new RecaptchaVerifier(auth, 'submitPhone', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log('captcha verified')
    }
  });
  mobileLoginForm.addEventListener('submit', (e) => {

    e.preventDefault();
    let mobilenumber = mobileLoginForm.mobilelogininput.value;
    const appVerifier = window.recaptchaVerifiers;
    fetch('/otplogin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({mobilenumber})})
      .then((response) => {
       const loginnumber='+91' + mobilenumber
        if (response.status == 400) {
          // window.location.reload()
          badnumalert.innerHTML = "Looks like you are new here, please Signup"
        } else if (response.status == 200) {
          signInWithPhoneNumber(auth, loginnumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResults = confirmationResult;
              mobileLoginSection.style.display = 'none';
              otpLoginSection.style.display = 'block';
              // ...
            }).catch((error) => {
              // Error; SMS not sent
              // ...
              console.log(error)
            });
        }
      })
    

  })
  otpLoginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let otp_numberL = otpLoginForm.digit.value
    console.log(otpLoginForm.digit.value)
    confirmationResults.confirm(otp_numberL).then(async (result) => {
      // User signed in successfully.
      const user = result;
      await fetch('/loginsession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobilenumber }),
      }).then(() => {
        otpform.otp.value = '';

        window.location.href = '/';
      }).catch((err) => {
        console.log(err)
      })

      // console.log(user)
      // ...
    }).catch((error) => {
      // User couldn't sign in (bad verification code?)
      // ...
      loginotpalert.innerHTML = "otp didn't match"
    });
  })
}


// LOGIN OTP VERIFICATION


