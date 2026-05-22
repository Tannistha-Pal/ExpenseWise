import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const API_URL = "http://localhost:8000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devResetLink, setDevResetLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDevResetLink("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.message || body?.error || "Failed to send reset email");
      }

      setSuccess(true);
      setDevResetLink(body?.data?.resetLink || "");
      toast.success("Password reset instructions sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process password reset";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription>Password reset instructions have been sent if the account exists.</CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                <p className="text-sm text-muted-foreground">
                  The reset link expires in 15 minutes. Check the inbox for <strong>{email}</strong>.
                </p>

                {devResetLink && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-left">
                    <p className="text-xs text-muted-foreground mb-2">Development reset link:</p>
                    <a href={devResetLink} className="break-all text-sm text-primary hover:underline">
                      {devResetLink}
                    </a>
                  </div>
                )}

                <div className="space-y-3">
                  <Button onClick={() => navigate("/login")} className="w-full gradient-btn text-white font-semibold">
                    Back to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                      setDevResetLink("");
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-blob-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob-delay-4000" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md mx-auto">
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription>Enter your email address and we'll send a reset link.</CardDescription>
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
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </motion.div>
                )}

                <Button type="submit" className="w-full gradient-btn text-white font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Button variant="ghost" onClick={() => navigate("/login")} className="w-full text-muted-foreground hover:text-foreground transition-colors">
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
