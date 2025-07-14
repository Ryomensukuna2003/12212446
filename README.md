# Full Stack URL Shortener

This repository contains the Full Stack solution for Affordmed's Campus Hiring Evaluation, including:

- A reusable **Logging Middleware** package
- A **URL Shortener Microservice** (Backend)
- A responsive **React Web App** (Frontend)


---

## Logging Middleware

A reusable logging function to capture events from both backend and frontend:

```ts
Log(stack: "backend" | "frontend", level: "debug" | "info" | "warn" | "error" | "fatal", package, message)
````


## Backend - URL Shortener Microservice

### API Endpoints

#### 1. **Create Short URL**

* `POST /shorturls`
* Request Body:

```json
{
  "url": "https://example.com/very/long/path",
  "validity": 30,                   // Optional (in minutes)
  "shortcode": "custom123"          // Optional
}   
```

* Response:

```json
{
  "shortLink": "http://localhost:5000/custom123",
  "expiry": "2025-01-01T00:30:00Z"
}
```

#### 2. **Redirect Short URL**

* `GET /:shortcode`
* Redirects to original long URL if not expired.

#### 3. **Get URL Stats**

* `GET /shorturls/:shortcode`
* Response includes:

  * Click count

### 🔐 Notes

* All shortcodes are globally unique
* If validity not provided → default = 30 minutes
* Strong error handling & status codes
* Logging Middleware used in all major actions

---



### 🧩 Frontend

#### 1. **URL Shortener Page**

* Supports shortening up to **5 URLs at once**
* Inputs: Long URL, optional validity, optional shortcode
* Validates inputs (client-side)
* Displays shortened links with expiry dates

#### 2. **Statistics Page**

* Lists all created short links (current session or persisted)
* For each:

  * Short URL, creation & expiry time
  * Total clicks
  * Per-click data: timestamp, referrer, location

### 🎨 Styling

* Built with **Material UI**
* Clean, responsive layout with focus on UX

---

## 📦 Submission Guidelines

* Folders:

  * `Logging Middleware/`
  * `Backend Test Submission/`
  * `Frontend Test Submission/`
* Avoid console logs — use your custom logger

---

## 🚫 Disqualification Triggers

* Not using your Logging Middleware
* Plagiarism or sharing credentials
* Using CSS frameworks other than Material UI or vanilla CSS


---

