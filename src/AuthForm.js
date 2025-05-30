import React, { useState } from "react";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return {
    question: `What is ${a} + ${b}?`,
    answer: (a + b).toString()
  };
}

const AuthForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    dob: "",
    captcha: ""
  });

  const [captchaQuestion, setCaptchaQuestion] = useState(generateCaptcha());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.username || !form.password || !form.dob || !form.captcha) {
      setError("Please fill out every field.");
      return;
    }
    if (form.captcha !== captchaQuestion.answer) {
      setError("Captcha is incorrect. Try again.");
      setForm({ ...form, captcha: "" });
      setCaptchaQuestion(generateCaptcha());
      return;
    }

    try {
      const result = await fetch("http://localhost:4000/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          dob: form.dob
        }),
      });

      if (!result.ok) {
        const data = await result.json();
        setError(data.message || "Login failed.");
        return;
      }

      setSuccess("Authentication successful!");
      setForm({ username: "", password: "", dob: "", captcha: "" });
      setCaptchaQuestion(generateCaptcha());
    } catch (err) {
      setError("Network error or server unreachable.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login</h2>
      <div style={{ marginBottom: 10 }}>
        <label>
          Username:<br />
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="off"
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Password:<br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Date of Birth:<br />
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div>
          Captcha: <b>{captchaQuestion.question}</b>
        </div>
        <input
          type="text"
          name="captcha"
          value={form.captcha}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Authenticate</button>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 10 }}>{success}</div>}
    </form>
  );
};

export default AuthForm;
