import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Check if user exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        // Don't reveal if email exists or not for security
        setSuccess(true);
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry
      
      // Store reset token
      const resetTokens = JSON.parse(localStorage.getItem("reset_tokens") || "{}");
      resetTokens[resetToken] = {
        email,
        expiry: resetExpiry
      };
      localStorage.setItem("reset_tokens", JSON.stringify(resetTokens));

      // In a real app, you would send an email with the reset link
      // For demo purposes, we'll show the reset token
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: ${window.location.origin}/reset-password?token=${resetToken}`);
      
      setSuccess(true);
    } catch (err) {
      setError("Failed to process password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-blob-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob-delay-4000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <Card className="glass-card border-0 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mx-auto w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent password reset instructions to your email
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    If an account exists for <strong>{email}</strong>, you'll receive an email with instructions shortly.
                  </p>
                  <p>
                    For demo purposes, check the browser console for the reset link.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full gradient-btn text-white font-semibold"
                  >
                    Back to Login
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Try Another Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-blob-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob-delay-4000" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mx-auto w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mb-4"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-btn text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="w-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
