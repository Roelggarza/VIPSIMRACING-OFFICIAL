import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Flag, Trophy, QrCode, Instagram, Facebook } from 'lucide-react';
import QRCode from 'qrcode.react';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';

export default function Landing() {
  const navigate = useNavigate();
  const racingDashboardUrl = window.location.origin + "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          {/* VIP Sim Racing Logo - Made Bigger */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/Adobe Express - file.png" 
              alt="VIP Sim Racing" 
              className="h-72 w-auto object-contain logo-enhanced"
            />
          </div>
          
          {/* Made text smaller */}
          <h2 className="text-xl md:text-2xl text-slate-300 font-light text-shadow-medium">
            Professional Racing Simulation Experience
          </h2>
          
          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed text-shadow-light">
            Experience the thrill of professional racing with our state-of-the-art simulators. 
            Train like a pro, compete with others, and push your limits in a safe environment.
          </p>
        </div>

        {/* Action Buttons - Keeping same size */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            icon={Flag}
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto transform hover:scale-105"
          >
            GET STARTED
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto"
            >
              MEMBER LOGIN
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate("/merch")}
              className="w-full sm:w-auto"
            >
              MERCH
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Car className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white text-shadow-medium">Professional Equipment</h3>
            <p className="text-slate-400 text-shadow-light">State-of-the-art racing simulators with realistic physics</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white text-shadow-medium">Competitive Racing</h3>
            <p className="text-slate-400 text-shadow-light">Join tournaments and compete with other racers</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Flag className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white text-shadow-medium">Private Events</h3>
            <p className="text-slate-400 text-shadow-light">Ask about our Private Events, Corporate Events, and Birthday Partys!</p>
          </div>
        </div>

        {/* Contact Info Footer - Made Much Smaller and Mobile-Friendly */}
        <div className="pt-6 border-t border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
            <a
              href="tel:8008975419"
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              (832) 490-4304
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a
              href="mailto:roel@vipsimracing.com"
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              roel@vipsimracing.com
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
            <a
              href="https://www.instagram.com/vipsimracing/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://www.facebook.com/p/VIP-Sim-Racing-61577303341374/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://discord.gg/zm8xtfn9HA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
              aria-label="Discord"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}