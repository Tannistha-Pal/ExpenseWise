import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuth();

  // Updated to check authentication status
  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      sessionStorage.setItem('login_source', 'get_started');
      navigate("/login");
    }
  };

  const handleLoginClick = () => {
    sessionStorage.setItem('login_source', 'login_button');
    navigate("/login");
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  const linkVariants = {
    hover: {
      y: -2,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg glow-primary"
                whileHover={{ rotate: 5 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-bold text-xl gradient-text">expenseWise</span>
            </motion.div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
                variants={linkVariants}
                whileHover="hover"
              >
                {link.name}
                <motion.span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent group-hover:w-3/4 transition-all duration-300"
                />
              </motion.a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <motion.div
                className="gradient-btn px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg glow-primary cursor-pointer flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
              >
                <User className="w-4 h-4" />
                <span className="relative z-10">Profile</span>
              </motion.div>
            ) : (
              <motion.button
                className="px-5 py-2.5 font-medium text-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoginClick}
              >
                Login
              </motion.button>
            )}

            <motion.div
              className="gradient-btn px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg glow-primary cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStartedClick}
            >
              <span className="relative z-10">Get Started</span>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <motion.button
              className="p-2 text-foreground glass rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ x: -20, opacity: 0 }}
                animate={isOpen ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block px-4 py-3 text-foreground font-medium glass-card"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </motion.a>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              {isAuthenticated ? (
                <div 
                  className="w-full py-3 font-semibold text-white gradient-btn rounded-xl text-center cursor-pointer flex items-center justify-center gap-2"
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  Profile
                </div>
              ) : (
                <button 
                  className="w-full py-3 font-medium text-foreground glass-card"
                  onClick={() => {
                    handleLoginClick();
                    setIsOpen(false);
                  }}
                >
                  Login
                </button>
              )}

              <div 
                className="w-full py-3 font-semibold text-white gradient-btn rounded-xl text-center cursor-pointer"
                onClick={() => {
                  handleGetStartedClick();
                  setIsOpen(false);
                }}
              >
                Get Started
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
