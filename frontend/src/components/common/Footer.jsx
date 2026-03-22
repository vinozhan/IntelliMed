import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={14} />
              </div>
              <span className="text-lg font-bold font-heading text-white">IntelliMed</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-Enabled Smart Healthcare Platform. Your health, powered by intelligence.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm" aria-label="Quick links">
              <li><Link to="/doctors" className="text-slate-400 hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400" aria-label="Contact information">
              <li>support@intellimed.com</li>
              <li>+94 11 234 5678</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} IntelliMed. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
