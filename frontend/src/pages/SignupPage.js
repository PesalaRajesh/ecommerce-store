import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function SignupPage() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setApiError("");
    setLoading(true);
    try {
      await signup(data.username, data.password, data.email);
      navigate("/login");
    } catch (err) {
      setApiError("Signup failed. Username or email may already be in use.");
    }
    setLoading(false);
  };

  // Watch password field for confirming password match
  const password = watch("password", "");

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Sign Up</h2>
      {apiError && <p className="mb-2 text-red-600">{apiError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          {...register("username", { required: "Username is required" })}
          placeholder="Username"
          className="border p-2 mb-2 w-full"
          autoComplete="username"
        />
        {errors.username && <p className="text-red-600">{errors.username.message}</p>}

        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
              message: "Email is not valid",
            },
          })}
          placeholder="Email"
          className="border p-2 mb-2 w-full"
          autoComplete="email"
        />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}

        <input
          type="password"
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" }})}
          placeholder="Password"
          className="border p-2 mb-2 w-full"
          autoComplete="new-password"
        />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}

        <input
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          placeholder="Confirm Password"
          className="border p-2 mb-4 w-full"
          autoComplete="new-password"
        />
        {errors.confirmPassword && <p className="text-red-600">{errors.confirmPassword.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded w-full"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignupPage;
