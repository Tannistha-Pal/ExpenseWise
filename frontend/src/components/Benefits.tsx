import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  Clock,
  Globe,
  Smartphone,
  Shield,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time sync across all devices",
    size: "lg",
  },
  {
    icon: Clock,
    title: "Save 5+ Hours Weekly",
    description: "Automatic categorization",
    size: "sm",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "150+ currencies supported",
    size: "sm",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Beautiful iOS & Android apps",
    size: "md",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit encryption",
    size: "md",
  },
  {
    icon: Sparkles,
    title: "Advanced Analytics",
    description: "Detailed insights & reports",
    size: "lg",
  },
];

const Benefits = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium gradient-text mb-4">
            Benefits
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Why users{" "}
            <span className="gradient-text">love ExpenseWise</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for people who value their time and want to make smarter
            financial decisions.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const gridClasses = {
              lg: "col-span-2 row-span-2",
              md: "col-span-2 md:col-span-1 row-span-1",
              sm: "col-span-1 row-span-1",
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`${gridClasses[benefit.size as keyof typeof gridClasses]}`}
              >
                <motion.div
                  className="glass-card h-full flex flex-col justify-between cursor-pointer group"
                  whileHover={{ 
                    y: -8, 
                    rotateX: 2, 
                    rotateY: 2,
                    transition: { duration: 0.3 } 
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div>
                    <motion.div
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl gradient-btn flex items-center justify-center mb-4 shadow-lg group-hover:glow-primary transition-all"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <benefit.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </motion.div>
                    <h3 className={`font-semibold mb-2 group-hover:gradient-text transition-all ${
                      benefit.size === "lg" ? "text-xl lg:text-2xl" : "text-base lg:text-lg"
                    }`}>
                      {benefit.title}
                    </h3>
                    <p className={`text-muted-foreground ${
                      benefit.size === "lg" ? "text-base" : "text-sm"
                    }`}>
                      {benefit.description}
                    </p>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "$10M+", label: "Money Tracked" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9★", label: "App Rating" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center glass-card"
              whileHover={{ y: -4 }}
            >
              <p className="text-3xl lg:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;