import { motion } from "framer-motion";
import { Sparkles, ExternalLink, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const footerLinks = {
    Product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Security", href: "/#security" },
      { name: "Mobile App", href: "/#mobile" }
    ],
    Company: [
      { name: "About", href: "/#about" },
      { name: "Blog", href: "/#blog" },
      { name: "Careers", href: "/#careers" },
      { name: "Press Kit", href: "/#press" }
    ],
    Resources: [
      { name: "Documentation", href: "/#docs" },
      { name: "Help Center", href: "/#help" },
      { name: "API", href: "/#api" },
      { name: "Status", href: "/#status" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" }
    ],
  };

  const socialLinks = [
    { 
      name: "Twitter", 
      href: "https://twitter.com/expensewise", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.748 5.475 5.475 0 01-2.825-.748zM12 15a3 3 0 100-6 3 3 0 000 6zm6.5-8.5a5.5 5.5 0 00-5.5-5.5 5.5 5.5 0 00-5.5 5.5z"/>
        </svg>
      )
    },
    { 
      name: "GitHub", 
      href: "https://github.com/expensewise", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.1-.484.154-.762.052-.278.1-.577.082-.89.082-.613 0-1.228-.052-1.789-.052-.468 0-.9.053-1.232-.052-1.23 0-2.395.87-2.395 2.395 0 1.607.553 2.868 1.514 3.435.826.79 1.423 1.799 1.423 1.799 0 3.2-2.659 3.2-5.95 0-.447-.023-.87-.064-1.292-.064-.445 0-.87.064-1.28.064-4.181 0-7.5 3.319-7.5 7.5 0 4.181 3.319 7.5 7.5z"/>
        </svg>
      )
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com/company/expensewise", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-2.432-.805-3.108-2.592v2.592h-3.554V9h3.554v-2.83c0-3.51 1.932-5.524 5.524-5.524 1.351 0 2.326.417 2.326.417v2.83h-2.326C-3.207 0-5.524 2.317-5.524 5.524v11.452h6.878z"/>
        </svg>
      )
    },
    { 
      name: "Email", 
      href: "mailto:contact@expensewise.app", 
      icon: <Mail className="w-5 h-5" />
    }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeMessage("");

    try {
      // Simulate newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribeMessage("Successfully subscribed! Check your email for confirmation.");
      setEmail("");
    } catch (error) {
      setSubscribeMessage("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <motion.a
              href="#"
              className="inline-flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">ExpenseWise</span>
            </motion.a>
            <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">
              The smartest way to track expenses and take control of your
              financial future. Built for the modern generation.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:glow-primary transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-block"
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-border"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-lg mb-1">Stay in the loop</h4>
              <p className="text-muted-foreground text-sm">
                Get the latest updates on new features and tips.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl glass bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <motion.button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 rounded-xl gradient-btn text-white font-medium shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </span>
              </motion.button>
            </form>
          </div>
          
          {/* Subscription Message */}
          {subscribeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-4 p-3 rounded-lg text-sm text-center",
                subscribeMessage.includes("Successfully") 
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}
            >
              {subscribeMessage}
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-sm text-muted-foreground">
              © 2024 ExpenseWise. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Made with ❤️ by ExpenseWise Team</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:support@expensewise.app" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                Support
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
                +1-234-567-890
              </a>
              <a 
                href="#" 
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;