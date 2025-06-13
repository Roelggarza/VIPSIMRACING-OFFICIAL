export interface User {
  fullName: string;
  dob: string;
  email: string;
  password: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  registrationDate: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  racingCredits: number; // in minutes
  accountBalance: number; // in dollars
  isAdmin?: boolean;
  isOnline?: boolean;
  lastActive?: string;
  currentSimulator?: number | null; // 1-8 for simulator number
  isStreaming?: boolean;
  currentGame?: string;
  vipMembership?: {
    active: boolean;
    expiryDate: string;
    discount: number; // percentage
  };
  stats?: {
    totalRaces: number;
    bestLapTime: string;
    rank: number;
    wins: number;
    podiums: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund';
  packageName: string;
  amount: number; // dollars spent
  credits: number; // minutes added/used
  date: string;
  description: string;
}

export interface Simulator {
  id: number;
  name: string;
  isActive: boolean;
  currentUser?: User;
  currentGame?: string;
  screens?: string[]; // URLs to screen captures
}

const STORAGE_KEY_USERS = "vipSimUsers";
const STORAGE_KEY_SESSION = "vipSimSession";
const STORAGE_KEY_TRANSACTIONS = "vipSimTransactions";
const STORAGE_KEY_SIMULATORS = "vipSimSimulators";

export function getUsers(): User[] {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  // Initialize default stats and admin user if needed
  return users.map((user: User, index: number) => ({
    ...user,
    stats: user.stats || {
      totalRaces: Math.floor(Math.random() * 50),
      bestLapTime: `1:${30 + Math.floor(Math.random() * 30)}.${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`,
      rank: index + 1,
      wins: Math.floor(Math.random() * 15),
      podiums: Math.floor(Math.random() * 25)
    },
    isOnline: Math.random() > 0.7,
    lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    currentSimulator: Math.random() > 0.8 ? Math.floor(Math.random() * 8) + 1 : null,
    isStreaming: Math.random() > 0.9,
    currentGame: Math.random() > 0.7 ? getRandomGame() : undefined
  }));
}

function getRandomGame(): string {
  const games = ['Assetto Corsa', 'Forza Horizon 5', 'Gran Turismo 7', 'F1 23', 'iRacing', 'rFactor 2'];
  return games[Math.floor(Math.random() * games.length)];
}

export function saveUser(user: Omit<User, 'registrationDate' | 'racingCredits' | 'accountBalance'>): void {
  const users = getUsers();
  const newUser: User = {
    ...user,
    registrationDate: new Date().toISOString(),
    racingCredits: 0,
    accountBalance: 0,
    isAdmin: users.length === 0, // First user is admin
    stats: {
      totalRaces: 0,
      bestLapTime: '--:--',
      rank: users.length + 1,
      wins: 0,
      podiums: 0
    }
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Update session if this is the current user
    const currentSession = getSession();
    if (currentSession && currentSession.email.toLowerCase() === updatedUser.email.toLowerCase()) {
      saveSession(updatedUser);
    }
  }
}

export function findUser(email: string, password: string): User | undefined {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  // Ensure user has credits and balance properties (for existing users)
  if (user && (user.racingCredits === undefined || user.accountBalance === undefined)) {
    user.racingCredits = user.racingCredits || 0;
    user.accountBalance = user.accountBalance || 0;
    updateUser(user);
  }
  
  return user;
}

export function saveSession(user: User): void {
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

export function getSession(): User | null {
  const session = localStorage.getItem(STORAGE_KEY_SESSION);
  const user = session ? JSON.parse(session) : null;
  
  // Ensure session user has credits and balance properties
  if (user && (user.racingCredits === undefined || user.accountBalance === undefined)) {
    user.racingCredits = user.racingCredits || 0;
    user.accountBalance = user.accountBalance || 0;
  }
  
  return user;
}

export function emailExists(email: string): boolean {
  const users = getUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Credit and Balance Management Functions
export function addCreditsAndBalance(userId: string, packageData: any): Transaction {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === userId.toLowerCase());
  
  if (userIndex === -1) throw new Error('User not found');
  
  const user = users[userIndex];
  const credits = packageData.id === 'vip' ? 30 : 30; // VIP membership now adds 30 minutes
  const amount = packageData.price;
  
  // Add credits and update balance
  user.racingCredits = (user.racingCredits || 0) + credits;
  user.accountBalance = (user.accountBalance || 0) + amount;
  
  // Handle VIP membership
  if (packageData.id === 'vip') {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    user.vipMembership = {
      active: true,
      expiryDate: expiryDate.toISOString(),
      discount: 25
    };
  }
  
  // Create transaction record
  const transaction: Transaction = {
    id: Date.now().toString(),
    userId: user.email,
    type: 'purchase',
    packageName: packageData.name,
    amount: amount,
    credits: credits,
    date: new Date().toISOString(),
    description: `Purchased ${packageData.name} - Added ${credits} minutes`
  };
  
  // Save transaction
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  
  // Update user
  updateUser(user);
  
  return transaction;
}

export function useCredits(userId: string, minutes: number, description: string): Transaction {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === userId.toLowerCase());
  
  if (userIndex === -1) throw new Error('User not found');
  
  const user = users[userIndex];
  
  if ((user.racingCredits || 0) < minutes) {
    throw new Error('Insufficient racing credits');
  }
  
  user.racingCredits = (user.racingCredits || 0) - minutes;
  
  const transaction: Transaction = {
    id: Date.now().toString(),
    userId: user.email,
    type: 'usage',
    packageName: 'Racing Session',
    amount: 0,
    credits: -minutes,
    date: new Date().toISOString(),
    description: description
  };
  
  // Save transaction
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  
  // Update user
  updateUser(user);
  
  return transaction;
}

export function getTransactions(): Transaction[] {
  const transactionsStr = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  return transactionsStr ? JSON.parse(transactionsStr) : [];
}

export function getUserTransactions(userId: string): Transaction[] {
  const transactions = getTransactions();
  return transactions.filter(t => t.userId.toLowerCase() === userId.toLowerCase());
}

export function formatCreditsDisplay(minutes: number): string {
  if (minutes === 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

// Simulator Management
export function getSimulators(): Simulator[] {
  const simulatorsStr = localStorage.getItem(STORAGE_KEY_SIMULATORS);
  const simulators = simulatorsStr ? JSON.parse(simulatorsStr) : [];
  
  // Initialize simulators if empty
  if (simulators.length === 0) {
    const defaultSimulators: Simulator[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Racing Simulator ${i + 1}`,
      isActive: Math.random() > 0.5,
      screens: [
        `https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400`,
        `https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400`,
        `https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=400`
      ]
    }));
    
    localStorage.setItem(STORAGE_KEY_SIMULATORS, JSON.stringify(defaultSimulators));
    return defaultSimulators;
  }
  
  return simulators;
}

export function updateSimulator(simulator: Simulator): void {
  const simulators = getSimulators();
  const index = simulators.findIndex(s => s.id === simulator.id);
  if (index !== -1) {
    simulators[index] = simulator;
    localStorage.setItem(STORAGE_KEY_SIMULATORS, JSON.stringify(simulators));
  }
}

export const RACING_GAMES = [
  {
    id: 'assetto-corsa',
    name: 'Assetto Corsa',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Professional racing simulation with realistic physics'
  },
  {
    id: 'forza-horizon-5',
    name: 'Forza Horizon 5',
    image: 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Open-world racing adventure in Mexico'
  },
  {
    id: 'gran-turismo-7',
    name: 'Gran Turismo 7',
    image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'The ultimate driving simulator experience'
  },
  {
    id: 'f1-23',
    name: 'F1 23',
    image: 'https://images.pexels.com/photos/8986201/pexels-photo-8986201.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Official Formula 1 racing simulation'
  },
  {
    id: 'iracing',
    name: 'iRacing',
    image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Professional online racing platform'
  },
  {
    id: 'rfactor-2',
    name: 'rFactor 2',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Advanced racing simulation with mod support'
  }
];