// import "../styles/LoginPage.css";

// import React, { useState } from "react";

// import { Link } from "react-router-dom";

// export default function LoginPage() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);
//         try {
//         const response = await fetch("http://127.0.0.1:5000/login", {
//             method: "POST",
//             headers: {
//             "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();

//         if (response.ok) {
//             localStorage.setItem("token", data.token);
//             alert("Login successful!");
//             console.log("JWT Token:", data.token);
//         } else {
//             setError(data.error || "Login failed");
//         }
//         } catch (err) {
//         console.error("Error:", err);
//         setError("Something went wrong. Please try again.");
//         } finally {
//         setLoading(false);
//         }
//     };

//     return (
//         <div className="login-container">
//         <div className="glass-box">
//             <h2>Login</h2>
//             <form onSubmit={handleSubmit}>
//             <div className="input-field">
//                 <input
//                 type="text"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Email or Username"
//                 required
//                 />
//             </div>
//             <div className="input-field">
//                 <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 required
//                 />
//             </div>

//             {error && <p className="error-text">{error}</p>}

//             <div className="options">
//                 <label>
//                 <input type="checkbox" /> Remember me
//                 </label>
//                 <a href="#">Forgot Password?</a>
//             </div>

//             <button type="submit" disabled={loading}>
//                 {loading ? "Logging in..." : "Login"}
//             </button>

//             <p className="register-text">
//                 Don’t have an account? <Link to="/signup">Register</Link>
//             </p>
//             </form>
//         </div>
//         </div>
//     );
// }
