# 🔐 Secure & Streamlined Google OAuth + OTP Authentication API

A modern, passwordless authentication system combining the simplicity of Google OAuth signup with the security of email-based OTP login.

---

## ✨ Why This Setup?

In a world full of logins and passwords, users crave convenience **and** security. This project offers both:

- ✅ **Google OAuth for signup** – quick and easy, no need to remember another password.
- 🔐 **Email OTP for login** – temporary, secure codes without friction.
- 🧠 **Passwordless experience** – faster onboarding, fewer user drop-offs.

---

## 🛠️ Tech Stack

| Tool / Library | Purpose |
|----------------|---------|
| **Google OAuth2** | Verify user's identity during signup |
| **MongoDB** | Store user details |
| **Node.js & Express** | Backend API server |
| **Nodemailer** | Send OTP emails to users |
| **JWT (JSON Web Tokens)** | Issue session tokens after OTP verification |
| **dotenv** | Manage and protect environment secrets |

---

## 🔁 How the Flow Works

### 1. 🧾 Signup via Google

- User sends their Google token and basic info (name, phone).
- Server verifies the token with Google.
- If email is verified:
  - Check if user exists in MongoDB.
  - If not, save user data securely.
- If verification fails, signup is denied.

### 2. 📧 Login with OTP

- User enters their email.
- If user exists:
  - Generate a random 4-digit OTP.
  - Store it temporarily (in-memory).
  - Send OTP via email using Nodemailer.

### 3. ✅ OTP Verification

- User submits the received OTP.
- Server checks:
  - OTP matches the stored one.
  - OTP hasn’t expired (valid for 3 minutes).
- If valid:
  - Issue a signed JWT token (valid for 1 hour).
  - User is authenticated!

---

## 🔒 Security Notes

- ⚠️ **OTP Storage**: Uses in-memory store. For production, switch to **Redis** or similar.
- 🧪 **Environment Variables**: Never hardcode secrets (JWT secret, Google keys, email credentials). Use `.env` files.
- 🚫 **Rate Limiting**: Prevent OTP spamming and abuse by adding rate limiting.
- 📬 **Email Deliverability**: Use reliable email providers to avoid spam issues.

---
Please have a look at https://medium.com/@aayushiiiii09/how-to-connect-google-authentication-in-minutes-step-by-step-guide-d875ba69fbf8
for more details
