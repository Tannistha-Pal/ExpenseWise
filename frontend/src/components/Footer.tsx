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
      name: "GitHub", 
      href: "https://github.com/expensewise", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com/company/expensewise", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-.184-4.708-.157-1.67-.683-2.859-1.586-3.661-.902-.802-2.065-1.203-3.487-1.203-1.422 0-2.585.401-3.487 1.203-.903.802-1.429 1.991-1.586 3.661-.157 1.671-.184 3.38-.184 4.708v5.569h-3.554V9h3.554v1.821c.586-.878 1.432-1.576 2.538-2.095 1.106-.519 2.339-.778 3.701-.778 2.597 0 4.698.997 6.301 2.99 1.603 1.993 2.404 4.852 2.404 8.578v9.938zM5.337 7.433c-1.144 0-2.003-.396-2.578-1.188-.575-.792-.863-1.86-.863-3.205 0-1.345.288-2.413.863-3.205.575-.792 1.434-1.188 2.578-1.188 1.144 0 2.003.396 2.578 1.188.575.792.863 1.86.863 3.205 0 1.345-.288 2.413-.863 3.205-.575.792-1.434 1.188-2.578 1.188zm3.685 13.019H1.652V9h7.37v11.452zM22.094 0h-20.188c-1.235 0-2.235 1-2.235 2.235v19.53c0 1.235 1 2.235 2.235 2.235h20.188c1.235 0 2.235-1 2.235-2.235v-19.53c0-1.235-1-2.235-2.235-2.235z"/>
        </svg>
      )
    },
    { 
      name: "Email", 
      href: "mailto:contact@expensewise.app", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      )
    },
    { 
      name: "WhatsApp", 
      href: "https://wa.me/12345678901", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.868 1.159l-.358-.177-3.707.952.968-3.536-.229-.36a9.9 9.9 0 011.51-4.684c1.476-1.483 3.446-2.297 5.538-2.297 1.484 0 2.974.356 4.335 1.059 1.361.703 2.528 1.71 3.34 2.908 1.627 2.571 2.1 5.871 1.271 8.991-.835 3.12-3.531 5.65-6.651 6.319-3.12.669-6.481-.355-8.632-2.665-.552-.601-1.024-1.27-1.375-1.967l3.06-.978c.268.487.604.927.992 1.304 1.407 1.407 3.29 2.189 5.287 2.189 1.997 0 3.88-.782 5.287-2.189 1.407-1.407 2.189-3.29 2.189-5.287 0-1.997-.782-3.88-2.189-5.287-1.407-1.407-3.29-2.189-5.287-2.189-.577 0-1.143.068-1.695.202-.552.134-1.093.35-1.609.645z"/>
        </svg>
      )
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

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border"
        >
          <h4 className="font-semibold text-lg mb-6">Get In Touch</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Email */}
            <motion.a
              href="mailto:contact@expensewise.app"
              className="p-4 rounded-xl glass hover:bg-primary/10 transition-all group"
              whileHover={{ y: -4 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary group-hover:text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">contact@expensewise.app</p>
                </div>
              </div>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/12345678901"
              className="p-4 rounded-xl glass hover:bg-primary/10 transition-all group"
              whileHover={{ y: -4 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.868 1.159l-.358-.177-3.707.952.968-3.536-.229-.36a9.9 9.9 0 011.51-4.684c1.476-1.483 3.446-2.297 5.538-2.297 1.484 0 2.974.356 4.335 1.059 1.361.703 2.528 1.71 3.34 2.908 1.627 2.571 2.1 5.871 1.271 8.991-.835 3.12-3.531 5.65-6.651 6.319-3.12.669-6.481-.355-8.632-2.665-.552-.601-1.024-1.27-1.375-1.967l3.06-.978c.268.487.604.927.992 1.304 1.407 1.407 3.29 2.189 5.287 2.189 1.997 0 3.88-.782 5.287-2.189 1.407-1.407 2.189-3.29 2.189-5.287 0-1.997-.782-3.88-2.189-5.287-1.407-1.407-3.29-2.189-5.287-2.189-.577 0-1.143.068-1.695.202-.552.134-1.093.35-1.609.645z"/>
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium text-foreground">+1 (234) 567-8901</p>
                </div>
              </div>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://linkedin.com/company/expensewise"
              className="p-4 rounded-xl glass hover:bg-primary/10 transition-all group"
              whileHover={{ y: -4 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-.184-4.708-.157-1.67-.683-2.859-1.586-3.661-.902-.802-2.065-1.203-3.487-1.203-1.422 0-2.585.401-3.487 1.203-.903.802-1.429 1.991-1.586 3.661-.157 1.671-.184 3.38-.184 4.708v5.569h-3.554V9h3.554v1.821c.586-.878 1.432-1.576 2.538-2.095 1.106-.519 2.339-.778 3.701-.778 2.597 0 4.698.997 6.301 2.99 1.603 1.993 2.404 4.852 2.404 8.578v9.938z"/>
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <p className="text-sm font-medium text-foreground">@expensewise</p>
                </div>
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/expensewise"
              className="p-4 rounded-xl glass hover:bg-primary/10 transition-all group"
              whileHover={{ y: -4 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary group-hover:text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <div>
                  <p className="text-sm text-muted-foreground">GitHub</p>
                  <p className="text-sm font-medium text-foreground">expensewise</p>
                </div>
              </div>
            </motion.a>
          </div>
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