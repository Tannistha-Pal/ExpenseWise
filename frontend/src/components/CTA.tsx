import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Floating Particle Component
const Particle = ({ delay }: { delay: number }) => {
  const randomX = Math.random() * 100;
  const randomSize = 2 + Math.random() * 4;
  const duration = 15 + Math.random() * 10;

  return (
    <motion.div
      className="absolute rounded-full bg-white/20"
      style={{
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
      }}
      initial={{ y: "100%", opacity: 0 }}
      animate={{
        y: "-100%",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => i));
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-[2.5rem] blur-3xl opacity-30" />

          {/* Main Card */}
          <div className="relative gradient-btn rounded-[2.5rem] p-10 lg:p-16 overflow-hidden">
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((i) => (
                <Particle key={i} delay={i * 0.5} />
              ))}
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Limited Time Offer - 14 Days Free
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6"
              >
                Ready to take control of your finances?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              >
                Join 50,000+ users who have transformed their financial habits.
                Start your free trial today—no credit card required.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  className="group relative px-10 py-5 rounded-2xl bg-white text-primary font-bold text-lg shadow-2xl overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Cancel anytime
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;