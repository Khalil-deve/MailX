// This function toggles the theme of the page between light and dark mode
function toggleTheme() {
  const body = document.body;
  body.classList.toggle("bg-secondary");
  body.classList.toggle("text-white");
}

console.log("Muhammad khalil");

// Navbar toggling (placeholder for navbar-related functionality)

// Email generator script
const emailSpan = document.getElementById("generated-email");
const finalEmail = document.getElementById("finalEmail");
const inboxCard = document.getElementById("inboxCard");
const copyBtn = document.getElementById("copyBtn");
const deleteBtn = document.getElementById("deleteBtn");

let email; // Stores the generated email
let timerInterval; // Timer interval for countdown
let timeLeft = 600; // Time left in seconds (10 minutes)

// List of available email domains
const domains = [
  "@getnada.com",
  "@inboxes.com",
  "@nada.email",
  "@mailsac.com",
  "@maildrop.cc"
];

// Function to generate a random string for the email username
function getRandomString(length = 7) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Function to update the email span with a random email
function updateRandomEmail() {
  const randomName = getRandomString();
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  emailSpan.textContent = `${randomName}${randomDomain}`;
}

// Start the auto-updating loop for random email generation
let intervalId = setInterval(updateRandomEmail, 2000);
updateRandomEmail();

// Function to set the email display and stop the auto-updating loop
function setEmailDisplay(email) {
  console.log(email);
  emailSpan.textContent = email;
  clearInterval(intervalId); // Stop the auto-updating loop
  finalEmail.textContent = email;
  inboxCard.style.display = "block"; // Show the inbox card
}

// Function to close the modal properly
function closeModalProperly() {
  const modal = bootstrap.Modal.getInstance(document.getElementById("emailModal"));
  modal.hide();
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  }, 300);
}

// Function to check OTP in a loop
async function checkOtpLoop() {
  const otpResult = document.getElementById("otpResult");
  const loader = document.getElementById("otpLoader");
  const emailSubject = document.getElementById("emailSubject");

  const pollInterval = 3000; // Polling interval in milliseconds (3 seconds)

  // Function to poll the server for OTP
  const pollOtp = async () => {
    try {
      const res = await fetch("/get-otp"); // Fetch OTP from the server
      const data = await res.json();
      console.log(data);

      if (data.otp || data.subject || data.from || data.link) {
        // If OTP or other data is received, display it
        console.log("the link of the data is: ", data.link);
        loader.style.display = "none";
        otpResult.innerHTML = `🔐 OTP: <strong>${data.otp}</strong>`;
        document.getElementById("emailFrom").textContent = data.from.address || "No sender found";
        document.getElementById("emailTo").textContent = email || "No recipient found";
        document.getElementById("emailSub").textContent = data.subject || "No subject found";

        return; // Stop polling
      }
    } catch (err) {
      console.error("Error fetching OTP:", err);
    }

    setTimeout(pollOtp, pollInterval); // Retry polling after the interval
  };

  pollOtp(); // Start polling
}

// Function to get a valid domain from the mail.tm API
async function getValidDomain() {
  const res = await fetch("https://api.mail.tm/domains");
  const data = await res.json();
  return data["hydra:member"]?.[0]?.domain; // Return the first valid domain
}

// Event listener for automatically generating an email address
document.getElementById("luckyBtn").addEventListener("pointerdown", async () => {
  const randomName = getRandomString();
  const domain = await getValidDomain();
  const randomEmail = `${randomName}@${domain}`;
  console.log("the user email address is: ", randomEmail);
  setEmailDisplay(randomEmail);
  closeModalProperly();
  //Refresh the page
  deleteBtn.disabled = false; // Enable the delete button
  deleteBtn.addEventListener("pointerdown", () => {
    location.reload(); // This will reload the current page
  });

  //Copy the email address
  copyBtn.disabled = false; // Enable the copy button
  copyBtn.addEventListener("pointerdown", () => {
    navigator.clipboard.writeText(randomEmail); // Copy the email to clipboard
    copyBtn.innerText = "Copied!"; // Change button text to indicate success
  });

  const res = await fetch(`/generate-email/${randomEmail}`); // Send the generated email to the server
  const data = await res.json();
  email = data.randEmail;
  console.log("the user email address is: ", email);

  clearInterval(timerInterval); // Reset the timer
  timeLeft = 600;
  startTimer();
  checkOtpLoop(); // Start OTP polling
});

// Event listener for custom username and domain selection
document.getElementById("addInboxBtn").addEventListener("pointerdown", async () => {
  const username = document.getElementById("customUsername").value.trim();
  const domain = await getValidDomain();
  if (username) {
    const randEmail = `${username}@${domain}`;
    setEmailDisplay(randEmail);
    closeModalProperly();
    //Refresh the page
    deleteBtn.disabled = false; // Enable the delete button
    deleteBtn.addEventListener("pointerdown", () => {
      location.reload(); // This will reload the current page
    });

    //Copy the email address
    copyBtn.disabled = false; // Enable the copy button
    copyBtn.addEventListener("pointerdown", () => {
      navigator.clipboard.writeText(randEmail); // Copy the email to clipboard
      copyBtn.innerText = "Copied!"; // Change button text to indicate success
    });
    const res = await fetch(`/generate-email/${randEmail}`); // Send the custom email to the server
    const data = await res.json();
    email = data.randEmail;
    console.log("the user email address is: ", email);
    clearInterval(timerInterval); // Reset the timer
    timeLeft = 600;
    startTimer();
    checkOtpLoop(); // Start OTP polling
  } else {
    alert("Please enter a username"); // Alert if no username is provided
  }
});

// Timer function to count down the email's validity period
function startTimer() {
  timerInterval = setInterval(() => {
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    document.getElementById("timer").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval); // Stop the timer when time runs out
      document.getElementById("otpResult").innerText = "⏰ Email expired.";
      copyBtn.disabled = true;
      deleteBtn.disabled = true;
    }
  }, 1000);
}

// Form submission prevention for invalid fields
(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission if invalid
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated'); // Add validation styles
    }, false);
  });
})();

