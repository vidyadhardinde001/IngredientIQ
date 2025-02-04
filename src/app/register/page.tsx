"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  email: string;
  password: string;
  healthIssues: string;
  allergies: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    healthIssues: "",
    allergies: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert comma-separated strings to arrays
    const healthIssuesArray = formData.healthIssues
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
      
    const allergiesArray = formData.allergies
      .split(',')
      .map(item => item.trim())
      .filter(item => item);

    try {
      const res = await fetch("/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: formData.username,
          email: formData.email,
          password: formData.password,
          healthIssues: healthIssuesArray,
          allergies: allergiesArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert("Registration successful! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="w-80 p-6 bg-white rounded-lg shadow-md">
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          required
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          value={formData.username}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded mb-4"
          onChange={handleChange}
          value={formData.password}
        />

        <input
          type="text"
          name="healthIssues"
          placeholder="Health Issues (comma separated)"
          className="w-full p-2 border rounded mb-2"
          onChange={handleChange}
          value={formData.healthIssues}
        />
        <input
          type="text"
          name="allergies"
          placeholder="Allergies (comma separated)"
          className="w-full p-2 border rounded mb-4"
          onChange={handleChange}
          value={formData.allergies}
        />

        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}
