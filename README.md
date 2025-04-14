# 📧 MailX – Temp Email Generator

**MailX** is a Node.js-powered API to generate temporary/disposable email addresses and retrieve OTPs or messages. It uses the [Mail.tm](https://docs.mail.tm) API to create and manage temporary email sessions. Perfect for developers who need quick and clean email testing.

---

## 🚀 Features

- 🔹 Generate temporary email addresses on-the-fly
- 🔐 Automatically login using token-based authentication
- ⏳ Auto-expire email and token after 10 minutes
- 📥 Fetch OTP or full message content from the inbox
- 🛡️ Rate limiter (max 5 requests/sec per IP) to prevent spam abuse

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/khalil-deve/mailx.git
cd mailx
```

### 2. Install Dependencies

```bash
npm install
```

### 4. Run the Server

```bash
npm start
```

---

## 💡 Notes

- All email tokens expire after **10 minutes**.
- Each IP can make **5 requests/second** (rate-limited).
- Uses `req.ip` to identify the client.
- MongoDB is required for request logging. Make sure it's running!

---

## 👨‍💻 Author

**Muhammad Khalil**  
📎 [LinkedIn](https://linkedin.com/in/khalil-dev/)  
💻 [GitHub](https://github.com/khalil-deve)

---


