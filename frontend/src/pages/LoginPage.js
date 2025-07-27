import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/AuthContext";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState("");

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password);
    } catch (err) {
      setApiError("Invalid username or password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Login</h2>
      {apiError && <p className="text-red-600 mb-2">{apiError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          {...register("username", { required: "Username is required" })}
          placeholder="Username"
          className="border p-2 mb-2 w-full"
        />
        {errors.username && <p className="text-red-600">{errors.username.message}</p>}

        <input
          {...register("password", { required: "Password is required" })}
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
        />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}

        <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
