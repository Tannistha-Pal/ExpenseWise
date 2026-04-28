import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Link2, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in 30 seconds. No credit card required.",
  },
  {
    number: "02",
    icon: Link2,
    title: "Connect Banks",
    description: "Securely link your accounts with bank-level encryption.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track & Save",
    description: "Watch your expenses auto-categorize and savings grow.",
  },
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_1px,_transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium gradient-text mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Start in{" "}
            <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get up and running in minutes, not hours. Our streamlined onboarding
            makes expense tracking effortless.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Progress Line */}
          <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
              style={{ width: lineWidth }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <motion.div
                  className="relative z-10 mx-auto mb-8"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl gradient-btn shadow-xl glow-primary flex items-center justify-center mx-auto"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 5 }}
                  >
                    <span className="text-2xl font-bold text-white relative z-10">
                      {step.number}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Icon Card */}
                <motion.div
                  className="glass-card inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 mx-auto"
                  whileHover={{ y: -4 }}
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </motion.div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;