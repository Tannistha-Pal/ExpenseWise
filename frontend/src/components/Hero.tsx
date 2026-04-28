import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, Play, TrendingUp, Wallet, PieChart } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-blob-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-blob-delay-4000" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div style={{ y, opacity }} className="text-center lg:text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="gradient-text">Advanced Expense Tracking</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Track Your Expenses.{" "}
              <span className="gradient-text">Control Your Money.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              The best way to manage your finances. Real-time tracking, 
              detailed insights, and beautiful analytics—all in one powerful app.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                className="gradient-btn px-8 py-4 rounded-2xl text-white font-semibold shadow-xl glow-primary flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.02, boxShadow: "0 0 60px hsl(var(--primary) / 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center gap-8 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="w-10 h-10 rounded-full border-2 border-background glass flex items-center justify-center text-xs font-bold gradient-text"
                  >
                    {String.fromCharCode(64 + i)}
                  </motion.div>
                ))}
              </div>
              <div>
                <p className="font-bold text-foreground">50,000+ users</p>
                <p className="text-sm text-muted-foreground">love ExpenseWise</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-3xl" />

            {/* Main Dashboard Card */}
            <motion.div
              className="relative glass-card p-6 lg:p-8 rounded-3xl shadow-2xl"
              initial={{ rotateY: 10, rotateX: 5 }}
              animate={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              {/* Window Controls */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-secondary/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>

              {/* Balance Card */}
              <motion.div
                className="gradient-btn rounded-2xl p-6 mb-6 text-white"
                whileHover={{ scale: 1.01 }}
              >
                <p className="text-white/80 text-sm mb-1">Total Balance</p>
                <motion.p
                  className="text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  $24,562.00
                </motion.p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+12.5% this month</span>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  className="glass rounded-xl p-4"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Income</p>
                  <p className="text-xl font-bold text-primary">$8,240</p>
                </motion.div>
                <motion.div
                  className="glass rounded-xl p-4"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    <PieChart className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-xl font-bold text-accent">$3,420</p>
                </motion.div>
              </div>

              {/* Mini Chart */}
              <div className="glass rounded-xl p-4">
                <p className="text-sm font-medium mb-4">Weekly Overview</p>
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-accent"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 1.2 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 glass-card p-4 rounded-2xl shadow-xl"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1.5 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <p className="text-xs text-muted-foreground">Savings Goal</p>
              <p className="font-bold gradient-text">78% Complete</p>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 glass-card p-4 rounded-2xl shadow-xl"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1.7 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
            >
              <p className="text-xs text-muted-foreground">Expense Insight</p>
              <p className="font-bold text-secondary">Save $340 more</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;