import React from 'react';
import { User, Phone, Mail, MapPin, Award, Target, Users, Zap } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">About VIP SIM RACING</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Where passion meets precision. Experience the ultimate in professional racing simulation.
          </p>
        </div>

        {/* Owner Information */}
        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Meet the Owner</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">Roel Garza</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Founder and owner of VIP SIM RACING, bringing years of passion for motorsports 
                  and cutting-edge simulation technology to create the ultimate racing experience. 
                  Dedicated to providing professional-grade equipment and unmatched customer service.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-red-500" />
                    <a 
                      href="tel:8324904304" 
                      className="text-white hover:text-red-400 transition-colors font-semibold"
                    >
                      (832) 490-4304
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-red-500" />
                    <a 
                      href="mailto:roel@vipsimracing.com" 
                      className="text-white hover:text-red-400 transition-colors font-semibold"
                    >
                      roel@vipsimracing.com
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-white">Houston, Texas Area</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-red-900/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-24 h-24 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-400">Professional Racing Enthusiast</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-slate-300">
                To provide the most realistic and immersive racing simulation experience, 
                making professional-grade racing accessible to enthusiasts of all skill levels.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Our Promise</h3>
              <p className="text-slate-300">
                State-of-the-art equipment, professional coaching, and an unmatched 
                racing environment that delivers authentic motorsport thrills.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Our Community</h3>
              <p className="text-slate-300">
                Building a passionate community of racers who share the love for speed, 
                precision, and the pursuit of the perfect lap.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What Sets Us Apart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">What Sets VIP SIM RACING Apart</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Professional Equipment</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>8 state-of-the-art racing simulators</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Force feedback steering wheels and pedals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Triple monitor setups for immersive racing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Professional racing seats and rigs</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Premium Experience</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>VIP membership with exclusive benefits</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Professional coaching and telemetry analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Competitive tournaments and events</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Community-driven racing environment</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-slate-700/50 to-red-900/20">
          <CardHeader>
            <h2 className="text-2xl font-bold text-white text-center">Get In Touch</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <p className="text-slate-300 text-lg">
                Ready to experience the thrill of professional racing simulation? 
                Contact us today to book your session or learn more about our services.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = 'tel:8008975419'}
                  icon={Phone}
                >
                  Call (800) 897-5419
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = 'mailto:roel@vipsimracing.com'}
                  icon={Mail}
                >
                  Email Us
                </Button>
              </div>
              
              <div className="pt-6 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  Visit us online at{' '}
                  <a 
                    href="tel:8008975419" 
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (800) 897-5419
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}