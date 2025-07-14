const API_URL = "http://20.244.56.144/evaluation-service/logs";
let token = "";

function initLogger(t) {
  token = t;
}

async function Log(stack, level, pkg, message) {
  if (!token) return;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (err) {
    console.error("Log failed:", err);
  }
}

module.exports = { initLogger, Log };
