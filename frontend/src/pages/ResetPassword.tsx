import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowRight, Eye, EyeOff, Lock, AlertTriangle, CheckCircle } from "lucide-react";

const API_URL = "http://localhost:8000";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link");
        setTokenValid(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/reset-password/${token}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message || body?.error || "Invalid or expired reset link");
        setTokenValid(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid or expired reset link";
        setError(message);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

      const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || body?.error || "Failed to reset password");

      setSuccess(true);
      toast.success("Password reset successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-destructive/20 rounded-full blur-3xl animate-blob" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto">
            <Card className="glass-card border-0 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Please request a new password reset link.</p>
                <Button onClick={() => navigate("/forgot-password")} className="w-full gradient-btn text-white font-semibold">
                  Request New Link
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
                  Back to Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-blob" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto">
            <Card className="glass-card border-0 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
                <CardDescription>Your password has been successfully reset.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={() => navigate("/login")} className="w-full gradient-btn text-white font-semibold">
                  Continue to Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-blob-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto">
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </motion.div>
                )}

                <Button type="submit" className="w-full gradient-btn text-white font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Button variant="ghost" onClick={() => navigate("/login")} className="w-full text-muted-foreground hover:text-foreground transition-colors">
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

export default ResetPassword;
