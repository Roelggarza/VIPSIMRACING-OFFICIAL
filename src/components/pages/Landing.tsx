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
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Car className="w-12 h-12 text-red-500" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
              VIP Edge
            </h1>
            <Trophy className="w-12 h-12 text-red-500" />
          </div>
          
          <h2 className="text-2xl md:text-3xl text-slate-300 font-light">
            Professional Racing Simulation Experience
          </h2>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience the thrill of professional racing with our state-of-the-art simulators. 
            Train like a pro, compete with others, and push your limits in a safe environment.
          </p>
        </div>

        {/* Action Buttons */}
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
            <h3 className="text-xl font-semibold text-white">Professional Equipment</h3>
            <p className="text-slate-400">State-of-the-art racing simulators with realistic physics</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Competitive Racing</h3>
            <p className="text-slate-400">Join tournaments and compete with other racers</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Flag className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Training Programs</h3>
            <p className="text-slate-400">Improve your skills with professional coaching</p>
          </div>
        </div>
      </div>
    </div>
  );
}