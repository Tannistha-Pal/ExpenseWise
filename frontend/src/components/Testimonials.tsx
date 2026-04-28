import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Manager",
    avatar: "SC",
    rating: 5,
    text: "ExpenseWise completely transformed how I manage my finances. The insights are incredibly helpful and have helped me save over $500 monthly!",
  },
  {
    name: "Marcus Johnson",
    role: "Software Engineer",
    avatar: "MJ",
    rating: 5,
    text: "As someone who hated budgeting, this app made it actually enjoyable. The beautiful interface and automatic categorization are game-changers.",
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    avatar: "ER",
    rating: 5,
    text: "Managing irregular income as a freelancer was always stressful. ExpenseWise's projections and analytics give me peace of mind like never before.",
  },
  {
    name: "David Park",
    role: "Graduate Student",
    avatar: "DP",
    rating: 5,
    text: "Perfect for students on a tight budget! I can finally see where my money goes and the savings goals feature keeps me motivated.",
  },
  {
    name: "Lisa Thompson",
    role: "Small Business Owner",
    avatar: "LT",
    rating: 5,
    text: "I use it for both personal and business expenses. The export feature for taxes alone has saved me countless hours and headaches.",
  },
];

const Testimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium gradient-text mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="gradient-text">thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with ExpenseWise.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative glass rounded-3xl p-8 lg:p-12">
              {/* Quote Icon */}
              <motion.div
                className="absolute -top-4 -left-4 w-12 h-12 rounded-xl gradient-btn flex items-center justify-center shadow-lg"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
              >
                <Quote className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl lg:text-2xl text-foreground mb-8 leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                    <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              onClick={goToPrev}
              className="w-12 h-12 rounded-xl glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-gradient-to-r from-primary to-accent"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <motion.button
              onClick={goToNext}
              className="w-12 h-12 rounded-xl glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;