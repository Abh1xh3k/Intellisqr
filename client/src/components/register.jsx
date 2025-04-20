import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const registerSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  password: z.string().min(6, "Password is too short")
});

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    uid: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    uid: "",
    password: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setErrors({ uid: "", password: "" });
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          email: formData.uid,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }
      );
      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        uid: error.response?.data?.message || 'Registration failed',
        password: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            className="w-full p-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            name="uid"
            placeholder="Email"
            value={formData.uid}
            onChange={handleChange}
          />
          {errors.uid && (
            <p className="mt-1 text-sm text-red-600">{errors.uid}</p>
          )}
        </div>

        <div className="mb-6">
          <input
            className="w-full p-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-3 bg-indigo-900 text-white font-medium rounded hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
        >
          {isSubmitting ? "Loading..." : "Register"}
        </button>
      </form>
    </div>
  );
}
