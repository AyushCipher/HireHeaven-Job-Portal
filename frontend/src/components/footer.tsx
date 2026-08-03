import Link from "next/link";
import React from "react";
import {
  Briefcase,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Jobs", href: "/jobs" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const jobSeekerLinks = [
  { label: "Create Account", href: "/register" },
  { label: "My Applications", href: "/account" },
  { label: "Career Guide", href: "/" },
  { label: "Resume Analyzer", href: "/" },
];

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
];

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={"/"} className="flex items-center gap-1 w-fit">
              <div className="text-2xl font-bold tracking-tight">
                <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Hire
                </span>
                <span className="text-red-500">Heaven</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed opacity-70 max-w-sm">
              Connecting ambitious talent with forward-thinking companies.
              Powered by AI-driven matching, resume insights and career
              guidance to help you land the role you deserve.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="h-9 w-9 flex items-center justify-center rounded-full border bg-background hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="opacity-70 hover:opacity-100 hover:text-blue-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Job seeker links */}
          <div>
            <h3 className="font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2.5 text-sm">
              {jobSeekerLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="opacity-70 hover:opacity-100 hover:text-blue-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 opacity-70">
                <Mail size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span>support@hireheaven.com</span>
              </li>
              <li className="flex items-start gap-2 opacity-70">
                <Phone size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 opacity-70">
                <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm opacity-60">
          <p>© {new Date().getFullYear()} HireHeaven. All rights reserved.</p>
          <p>Built with care for job seekers and recruiters alike.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
