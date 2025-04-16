const express = require('express');
const router = express.Router();
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const rateLimiter = require("../middleware/rateLimiter");
const TempEmailLog = require("../model/EmailLog");
const RequestLog = require("../model/requestLog.js");

// Route to generate a temporary email
router.get("/generate-email/:randEmail", rateLimiter, async (req, res) => {
  const ip = req.ip; // Get the IP address of the client
  const randEmail = req.params.randEmail; // Get the random email from the route parameter
  console.log("Random email:", randEmail);
  if (!randEmail) {
    // If no email is provided, return an error
    return res.status(500).json({ error: "No valid email available." });
  }

  const password = "TempPass123!"; // Temporary password for the email account

  try {
    // Step 1: Create account on mail.tm
    const accountRes = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: randEmail, password }),
    });

    const accountData = await accountRes.json();
    // console.log("Account response:", accountData);

    if (accountRes.status !== 201) {
      // If account creation fails, return an error
      return res.status(400).json({ error: "Account creation failed", details: accountData });
    }

    // Step 2: Login to get the authentication token
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before logging in
    const loginRes = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: randEmail, password }),
    });
  
    const loginData = await loginRes.json();
    // console.log("Login response:", loginData);

    if (!loginData.token) {
      // If login fails, return an error
      return res.status(401).json({ error: "Login failed", loginData });
    }

    // Step 3: Save the email, password, and token to MongoDB
    await TempEmailLog.findOneAndUpdate(
      { ip }, // Match the document by IP address
      { email: randEmail, password, token: loginData.token, createdAt: new Date() }, // Update or insert the document
      { upsert: true } // Create a new document if none exists
    );

    // Respond with the generated email
    res.json({ randEmail });
  } catch (err) {
    // Handle any errors that occur during the process
    console.error("Error generating email:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to fetch OTP from the inbox
router.get("/get-otp", async (req, res) => {
  const ip = req.ip; // Get the IP address of the client
  const log = await TempEmailLog.findOne({ ip }); // Find the email log for the client
  console.log("Log:", log);
  if (!log || !log.token) {
    // If no token is found, return an error
    return res.status(400).json({ error: "No token found. Please generate an email first." });
  }

  try {
    // Fetch the inbox messages using the token
    const inboxRes = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: `Bearer ${log.token}` },
    });

    const inbox = await inboxRes.json();
    // console.log("Inbox:", inbox);

    if (!inbox["hydra:member"] || inbox["hydra:member"].length === 0) {
      // If no messages are found, return an error
      return res.status(404).json({ error: "No messages received yet" });
    }

    // Get the latest message from the inbox
    const latestMsg = inbox["hydra:member"][0];
    const msgRes = await fetch(`https://api.mail.tm/messages/${latestMsg.id}`, {
      headers: { Authorization: `Bearer ${log.token}` },
    });

    const fullMsg = await msgRes.json();
    const content = fullMsg.text || fullMsg.html || fullMsg.subject; // Extract the message content
    const otpMatch = content?.match(/\b\d{4,8}\b/); // Extract OTP (4-8 digit number) from the content
    const otp = otpMatch ? otpMatch[0] : null; // Get the OTP if found

    // Respond with the OTP and message details
    res.json({ otp, subject: fullMsg.subject, from: fullMsg.from });
  } catch (err) {
    // Handle any errors that occur during the process
    // console.error("Error fetching OTP:", err);
    res.status(500).json({ error: "Could not fetch OTP" });
  }
});

module.exports = router;
