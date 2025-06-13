import React, { useState } from 'react';
import { Gamepad2, Play, Star, Clock, Users, Download } from 'lucide-react';
import { User, RACING_GAMES } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface GamesLibraryProps {
  user: User;
}

export default function GamesLibrary({ user }: GamesLibraryProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleLaunchGame = (gameId: string, gameName: string) => {
    // Simulate game launch
    alert(`Launching ${gameName}...\n\nThis would connect to the racing simulator and start the selected game.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Racing Games Library</h2>
            </div>
            <div className="text-sm text-slate-400">
              {RACING_GAMES.length} games available
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Choose from our collection of professional racing simulators. Each game offers unique tracks, 
            cars, and physics engines for the ultimate racing experience.
          </p>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RACING_GAMES.map((game) => (
          <Card 
            key={game.id} 
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedGame === game.id ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
          >
            <CardContent className="p-0">
              {/* Game Image */}
              <div className="h-48 overflow-hidden rounded-t-xl">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Game Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-slate-400 text-sm">{game.description}</p>
                </div>

                {/* Game Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span>4.{Math.floor(Math.random() * 3) + 6}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Users className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 50) + 10} online</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 30) + 15} min avg</span>
                  </div>
                </div>

                {/* Launch Button */}
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchGame(game.id, game.name);
                  }}
                  icon={Play}
                >
                  Launch Game
                </Button>

                {/* Expanded Details */}
                {selectedGame === game.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Game Features</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Realistic physics engine</li>
                        <li>• Multiple racing tracks</li>
                        <li>• Career mode progression</li>
                        <li>• Online multiplayer support</li>
                        <li>• Advanced telemetry data</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">System Requirements</h4>
                      <div className="text-sm text-slate-400">
                        <p>✅ VIP Edge Racing Simulator</p>
                        <p>✅ Active racing credits required</p>
                        <p>✅ Compatible with all simulator setups</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Launch Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">Quick Launch</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RACING_GAMES.slice(0, 4).map((game) => (
              <Button
                key={game.id}
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleLaunchGame(game.id, game.name)}
              >
                <Gamepad2 className="w-6 h-6" />
                <span className="text-xs">{game.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Racing Tips */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Racing Tips</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">For Beginners</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Start with Assetto Corsa for realistic physics</li>
                <li>• Practice braking points on each track</li>
                <li>• Use racing line assists initially</li>
                <li>• Focus on smooth inputs over speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Advanced Techniques</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Master trail braking for faster cornering</li>
                <li>• Learn to read tire temperature data</li>
                <li>• Practice heel-toe downshifting</li>
                <li>• Study telemetry for optimal lap times</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}