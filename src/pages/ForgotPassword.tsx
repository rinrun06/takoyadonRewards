import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import Layout from "@/Components/Layout";
import { supabase } from "@/supabaseClient";

type FormInputs = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormInputs>();

  const handleReset: SubmitHandler<FormInputs> = async ({ email }) => {
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      if (error) throw error;
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      const apiError = err as { message: string };
      setError(apiError.message || "Failed to send reset email.");
    } 
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 py-12">
        <div className="w-full max-w-md px-6">
          <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>

          {message && <div className="text-green-600 text-center mb-4">{message}</div>}
          {error && <div className="text-red-600 text-center mb-4">{error}</div>}

          <form onSubmit={handleSubmit(handleReset)} className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
            <div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Email"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Remember your password?{" "}
            <button onClick={() => navigate("/login")} className="text-red-600 hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
