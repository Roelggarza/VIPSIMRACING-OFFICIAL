import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Flag, Trophy, QrCode } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            icon={Flag}
            onClick={() => navigate("/register")}
            className="w-full sm:w-auto transform hover:scale-105"
          >
            GET STARTED
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto"
          >
            MEMBER LOGIN
          </Button>
        </div>

        {/* QR Code Section */}
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-slate-300 mb-4">
              <QrCode className="w-5 h-5" />
              <span className="font-semibold">Quick Access</span>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">
              Scan to access your Racing Dashboard from mobile
            </p>
            
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCode 
                  value={racingDashboardUrl} 
                  size={160}
                  fgColor="#ef4444"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
            <h3 className="text-xl font-semibold text-white text-shadow-medium">Training Programs</h3>
            <p className="text-slate-400 text-shadow-light">Improve your skills with professional coaching</p>
          </div>
        </div>

        {/* Contact Info Footer - Made Much Smaller and Mobile-Friendly */}
        <div className="pt-6 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
            <a 
              href="tel:8008975419" 
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              (800) 897-5419
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a 
              href="mailto:roel@vipsimracing.com" 
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              roel@vipsimracing.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}