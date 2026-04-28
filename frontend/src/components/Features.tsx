import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { FiPlusCircle, FiGrid, FiBarChart2, FiDownload } from "react-icons/fi";

const features = [
  {
    icon: FiPlusCircle,
    title: "Add Expenses",
    description: "Log expenses in seconds with smart categorization and receipt scanning.",
    gradient: "from-primary to-accent",
  },
  {
    icon: FiGrid,
    title: "Categories",
    description: "Organize spending with custom categories and automatic tagging.",
    gradient: "from-accent to-secondary",
  },
  {
    icon: FiBarChart2,
    title: "Analytics",
    description: "Visualize your spending patterns with beautiful, interactive charts.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: FiDownload,
    title: "Export Data",
    description: "Export reports in multiple formats for taxes and budgeting.",
    gradient: "from-primary to-secondary",
  },
];

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium gradient-text mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">manage money</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you take control of your finances
            with minimal effort.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group"
            >
              <motion.div
                className="glass-card h-full relative overflow-hidden cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient Border on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10`} />
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Glow Effect */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;