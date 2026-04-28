import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const DashboardPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("weekly");
  const [animatedBalance, setAnimatedBalance] = useState(0);

  const tabs = ["daily", "weekly", "monthly"];

  const chartData = {
    daily: [30, 45, 55, 40, 65, 50, 70],
    weekly: [45, 65, 50, 80, 60, 90, 75],
    monthly: [60, 75, 65, 85, 70, 95, 80],
  };

  const categories = [
    { name: "Food & Dining", amount: 450, percentage: 35, color: "from-primary to-accent" },
    { name: "Transportation", amount: 280, percentage: 22, color: "from-accent to-secondary" },
    { name: "Entertainment", amount: 180, percentage: 14, color: "from-secondary to-primary" },
    { name: "Shopping", amount: 370, percentage: 29, color: "from-primary to-secondary" },
  ];

  // Animate balance counter
  useEffect(() => {
    if (isInView) {
      const target = 24562;
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setAnimatedBalance(target);
          clearInterval(timer);
        } else {
          setAnimatedBalance(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium gradient-text mb-4">
            Dashboard
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Your finances,{" "}
            <span className="gradient-text">beautifully visualized</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            An intuitive dashboard that makes understanding your money a pleasure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-3xl opacity-50" />

          <div className="relative glass rounded-3xl p-6 lg:p-10 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-1">Financial Overview</h3>
                <p className="text-muted-foreground">January 2024</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1.5 rounded-xl glass">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? "gradient-btn text-white shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">{tab}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Balance */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  className="gradient-btn rounded-2xl p-6 text-white"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/70 mb-1">Total Balance</p>
                      <motion.p
                        className="text-4xl lg:text-5xl font-bold"
                        key={animatedBalance}
                      >
                        ${animatedBalance.toLocaleString()}.00
                      </motion.p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.5%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">Income</span>
                      </div>
                      <p className="text-2xl font-bold">$8,240</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <ArrowDownRight className="w-4 h-4" />
                        <span className="text-sm">Expenses</span>
                      </div>
                      <p className="text-2xl font-bold">$3,420</p>
                    </div>
                  </div>
                </motion.div>

                {/* Chart */}
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-semibold mb-6">Spending Trends</h4>
                  <div className="flex items-end gap-3 h-48">
                    {chartData[activeTab as keyof typeof chartData].map((height, i) => (
                      <motion.div
                        key={`${activeTab}-${i}`}
                        className="flex-1 flex flex-col items-center gap-2"
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <motion.div
                          className="w-full rounded-t-xl bg-gradient-to-t from-primary via-accent to-secondary"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-semibold mb-6">Spending by Category</h4>
                <div className="space-y-5">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">${category.amount}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${category.percentage}%` } : {}}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="w-full mt-6 py-3 rounded-xl glass font-medium hover:bg-card transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Categories
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;