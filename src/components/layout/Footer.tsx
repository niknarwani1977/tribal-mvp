import { Link } from 'react-router-dom';
import { Github, Mail, MapPin, Calendar, FileText, User } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <Logo className="h-8 w-auto text-primary-500" />
              <span className="ml-2 text-xl font-display font-bold">
                TribalConnect
              </span>
            </div>
            <p className="mt-3 text-sm text-neutral-400">
              Strengthening indigenous communities through technology and connection.
            </p>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h5 className="text-lg font-display font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/map" className="text-neutral-400 hover:text-primary-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Community Map</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-neutral-400 hover:text-primary-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-neutral-400 hover:text-primary-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Resources</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-neutral-400 hover:text-primary-400 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h5 className="text-lg font-display font-bold mb-4">Support</h5>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h5 className="text-lg font-display font-bold mb-4">Contact</h5>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:contact@tribalconnect.org" 
                  className="text-neutral-400 hover:text-primary-400 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>contact@tribalconnect.org</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/yourusername/tribal-connect" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-primary-400 flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-800 text-sm text-neutral-500 text-center">
          <p>© {currentYear} TribalConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;