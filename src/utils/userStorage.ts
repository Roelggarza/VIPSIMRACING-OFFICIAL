export interface User {
  fullName: string;
  dob: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  state: string;
  zipCode: string;
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
  status?: 'online' | 'away' | 'busy' | 'offline';
  statusMessage?: string;
  spotifyData?: {
    connected: boolean;
    currentTrack?: {
      name: string;
      artist: string;
      album: string;
      imageUrl: string;
      isPlaying: boolean;
      duration: number;
      progress: number;
    };
    recentTracks?: Array<{
      name: string;
      artist: string;
      album: string;
      imageUrl: string;
      playedAt: string;
    }>;
    topTracks?: Array<{
      name: string;
      artist: string;
      album: string;
      imageUrl: string;
      popularity: number;
    }>;
  };
  socialAccounts?: {
    steam?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    discord?: {
      username: string;
      discriminator: string;
      connected: boolean;
    };
    twitch?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    youtube?: {
      channelName: string;
      channelUrl: string;
      connected: boolean;
    };
    twitter?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    personalWebsite?: {
      url: string;
      title: string;
      connected: boolean;
    };
    spotify?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
  };
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
  registrationSource?: string; // Track where the registration came from
  ipAddress?: string; // For tracking purposes
  deviceInfo?: string; // Browser/device information
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  replies?: Comment[]; // Nested replies
  likes: number;
  likedBy: string[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  type: 'screenshot' | 'video' | 'lap_record' | 'highlight';
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string; // For videos
  game?: string;
  track?: string;
  lapTime?: string;
  achievement?: string;
  tags?: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  shares: number;
  sharedBy: string[];
  createdAt: string;
  isPublic: boolean;
  reportedBy?: string[]; // Users who reported this post
  reportCount?: number;
  isHidden?: boolean; // Admin can hide posts
}

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  reporterName: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  post?: CommunityPost; // Include post data for context
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isAI: boolean;
  type: 'support' | 'report' | 'general';
  relatedPostId?: string; // If chat is about a specific post
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

export interface Screenshot {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  game?: string;
  track?: string;
  lapTime?: string;
  achievement?: string;
  likes: number;
  likedBy?: string[];
  comments?: Comment[];
  createdAt: string;
}

export interface Simulator {
  id: number;
  name: string;
  isActive: boolean;
  currentUser?: User;
  currentGame?: string;
  screens?: string[]; // URLs to screen captures
}

// Security Configuration
const SECURITY_CONFIG = {
  // Prevent data exposure in production
  HIDE_SENSITIVE_DATA: true,
  // Rate limiting for API calls
  MAX_REQUESTS_PER_MINUTE: 60,
  // Data encryption key (in production, this would be from environment)
  ENCRYPTION_KEY: 'vip-edge-racing-2024-secure',
  // Admin-only access patterns
  ADMIN_DOMAINS: ['vipsimracing.com'],
  // Allowed origins for CORS
  ALLOWED_ORIGINS: ['https://vipsimracing.com', 'https://www.vipsimracing.com']
};

// Central storage keys - these will be shared across all users
const STORAGE_KEY_USERS = "vipSimUsers_CENTRAL";
const STORAGE_KEY_SESSION = "vipSimSession";
const STORAGE_KEY_TRANSACTIONS = "vipSimTransactions_CENTRAL";
const STORAGE_KEY_SIMULATORS = "vipSimSimulators_CENTRAL";
const STORAGE_KEY_SCREENSHOTS = "vipSimScreenshots_CENTRAL";
const STORAGE_KEY_COMMUNITY_POSTS = "vipSimCommunityPosts_CENTRAL";
const STORAGE_KEY_ADMIN_NOTIFICATIONS = "vipSimAdminNotifications";
const STORAGE_KEY_POST_REPORTS = "vipSimPostReports_CENTRAL";
const STORAGE_KEY_CHAT_MESSAGES = "vipSimChatMessages_CENTRAL";

// Security Functions
function sanitizeEmail(email: string): string {
  // Basic email sanitization
  return email.toLowerCase().trim();
}

function hashPassword(password: string): string {
  // Simple hash function (in production, use bcrypt or similar)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

function isAdminDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return SECURITY_CONFIG.ADMIN_DOMAINS.includes(domain);
}

function sanitizeUserData(user: User, isPublic: boolean = true): Partial<User> {
  if (!isPublic) {
    // Return full data for admin/owner access
    return user;
  }

  // For public access, hide sensitive information
  const sanitized: Partial<User> = {
    fullName: user.fullName,
    email: user.email.replace(/(.{2}).*@/, '$1***@'), // Mask email
    profilePicture: user.profilePicture,
    bannerImage: user.bannerImage,
    bio: user.bio,
    racingCredits: user.racingCredits,
    isOnline: user.isOnline,
    status: user.status,
    statusMessage: user.statusMessage,
    stats: user.stats,
    vipMembership: user.vipMembership ? { active: user.vipMembership.active } : undefined,
    socialAccounts: user.socialAccounts
  };

  return sanitized;
}

function validateInput(input: string, type: 'email' | 'password' | 'text'): boolean {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) && input.length <= 254;
    case 'password':
      return input.length >= 6 && input.length <= 128;
    case 'text':
      return input.length <= 1000; // Prevent extremely long text
    default:
      return false;
  }
}

function logSecurityEvent(event: string, details: any): void {
  // In production, this would send to a security monitoring service
  console.warn(`[SECURITY] ${event}:`, details);
}

// Rate limiting storage
const rateLimitStorage: { [key: string]: number[] } = {};

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimitStorage[identifier]) {
    rateLimitStorage[identifier] = [];
  }
  
  // Remove old requests
  rateLimitStorage[identifier] = rateLimitStorage[identifier].filter(time => time > windowStart);
  
  // Check if under limit
  if (rateLimitStorage[identifier].length >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    logSecurityEvent('Rate limit exceeded', { identifier, requests: rateLimitStorage[identifier].length });
    return false;
  }
  
  // Add current request
  rateLimitStorage[identifier].push(now);
  return true;
}

// Initialize central database with sample data if empty
function initializeCentralDatabase() {
  const existingUsers = localStorage.getItem(STORAGE_KEY_USERS);
  if (!existingUsers) {
    const sampleUsers: User[] = [
      {
        fullName: "Roel Garza",
        dob: "1985-01-01",
        email: "roel@vipsimracing.com",
        password: hashPassword("Roelgarza1!"), // Hash the password
        phone: "(832) 490-4304",
        address: "VIP Edge Racing Facility",
        state: "TX",
        zipCode: "77001",
        emergencyName: "VIP Edge Emergency",
        emergencyPhone: "(832) 490-4304",
        registrationDate: new Date().toISOString(),
        racingCredits: 500,
        accountBalance: 1000,
        isAdmin: true,
        status: 'online',
        statusMessage: 'Owner & Founder of VIP Edge Racing',
        spotifyData: { connected: false },
        socialAccounts: {},
        bio: "Founder and owner of VIP Edge Racing. Passionate about motorsports and providing the ultimate racing simulation experience.",
        stats: {
          totalRaces: 100,
          bestLapTime: '1:18.234',
          rank: 1,
          wins: 75,
          podiums: 95
        },
        registrationSource: 'Owner Account',
        ipAddress: '127.0.0.1',
        deviceInfo: 'Admin Dashboard'
      },
      {
        fullName: "Admin User",
        dob: "1990-01-01",
        email: "admin@vipedge.com",
        password: hashPassword("admin123"), // Hash the password
        phone: "(555) 123-4567",
        address: "123 Racing Street",
        state: "CA",
        zipCode: "90210",
        emergencyName: "Emergency Contact",
        emergencyPhone: "(555) 987-6543",
        registrationDate: new Date().toISOString(),
        racingCredits: 120,
        accountBalance: 500,
        isAdmin: true,
        status: 'online',
        statusMessage: 'Managing VIP Edge Racing',
        spotifyData: { connected: false },
        socialAccounts: {},
        stats: {
          totalRaces: 50,
          bestLapTime: '1:23.456',
          rank: 2,
          wins: 25,
          podiums: 40
        },
        registrationSource: 'Direct Admin',
        ipAddress: '127.0.0.1',
        deviceInfo: 'Admin Dashboard'
      }
    ];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(sampleUsers));
  } else {
    // Check if Roel's account exists, if not add it
    const users = JSON.parse(existingUsers);
    const roelExists = users.find((u: User) => u.email === 'roel@vipsimracing.com');
    
    if (!roelExists) {
      const roelAccount: User = {
        fullName: "Roel Garza",
        dob: "1985-01-01",
        email: "roel@vipsimracing.com",
        password: hashPassword("Roelgarza1!"), // Hash the password
        phone: "(832) 490-4304",
        address: "VIP Edge Racing Facility",
        state: "TX",
        zipCode: "77001",
        emergencyName: "VIP Edge Emergency",
        emergencyPhone: "(832) 490-4304",
        registrationDate: new Date().toISOString(),
        racingCredits: 500,
        accountBalance: 1000,
        isAdmin: true,
        status: 'online',
        statusMessage: 'Owner & Founder of VIP Edge Racing',
        spotifyData: { connected: false },
        socialAccounts: {},
        bio: "Founder and owner of VIP Edge Racing. Passionate about motorsports and providing the ultimate racing simulation experience.",
        stats: {
          totalRaces: 100,
          bestLapTime: '1:18.234',
          rank: 1,
          wins: 75,
          podiums: 95
        },
        registrationSource: 'Owner Account',
        ipAddress: '127.0.0.1',
        deviceInfo: 'Admin Dashboard'
      };
      
      users.unshift(roelAccount); // Add at the beginning
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }
}

// Call initialization
initializeCentralDatabase();

export function getUsers(): User[] {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  // Initialize default stats and admin user if needed
  return users.map((user: User, index: number) => ({
    ...user,
    // Ensure address fields exist for existing users
    address: user.address || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    status: user.status || (Math.random() > 0.7 ? 'online' : Math.random() > 0.5 ? 'away' : 'offline'),
    statusMessage: user.statusMessage || getRandomStatusMessage(),
    spotifyData: user.spotifyData || generateRandomSpotifyData(),
    stats: user.stats || {
      totalRaces: Math.floor(Math.random() * 50),
      bestLapTime: `1:${30 + Math.floor(Math.random() * 30)}.${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`,
      rank: index + 1,
      wins: Math.floor(Math.random() * 15),
      podiums: Math.floor(Math.random() * 25)
    },
    isOnline: Math.random() > 0.7,
    lastActive: user.lastActive || new Date(Date.now() - Math.random() * 86400000).toISOString(),
    currentSimulator: Math.random() > 0.8 ? Math.floor(Math.random() * 8) + 1 : null,
    isStreaming: Math.random() > 0.9,
    currentGame: Math.random() > 0.7 ? getRandomGame() : undefined,
    socialAccounts: user.socialAccounts || {},
    registrationSource: user.registrationSource || 'Unknown',
    ipAddress: user.ipAddress || generateRandomIP(),
    deviceInfo: user.deviceInfo || getRandomDeviceInfo()
  }));
}

// Secure version of getUsers for public access
export function getPublicUsers(): Partial<User>[] {
  const users = getUsers();
  return users.map(user => sanitizeUserData(user, true));
}

function getRandomStatusMessage(): string {
  const messages = [
    'Racing at Silverstone 🏁',
    'Setting new lap records',
    'In the zone',
    'Practicing for the championship',
    'Tuning my setup',
    'Ready to race!',
    'Chasing the perfect lap',
    'Living life in the fast lane',
    'Born to race',
    'Speed is life'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateRandomSpotifyData() {
  const tracks = [
    { name: 'Thunder', artist: 'Imagine Dragons', album: 'Evolve', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Radioactive', artist: 'Imagine Dragons', album: 'Night Visions', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Warriors', artist: 'Imagine Dragons', album: 'Smoke + Mirrors', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Enemy', artist: 'Imagine Dragons', album: 'Mercury - Act 1', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Bones', artist: 'Imagine Dragons', album: 'Mercury - Acts 1 & 2', imageUrl: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const isConnected = Math.random() > 0.6;
  if (!isConnected) {
    return { connected: false };
  }

  const currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
  const isPlaying = Math.random() > 0.3;
  
  return {
    connected: true,
    currentTrack: {
      ...currentTrack,
      isPlaying,
      duration: 180000 + Math.floor(Math.random() * 120000), // 3-5 minutes
      progress: Math.floor(Math.random() * 120000) // Random progress
    },
    recentTracks: tracks.slice(0, 3).map(track => ({
      ...track,
      playedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
    })),
    topTracks: tracks.slice(0, 5).map(track => ({
      ...track,
      popularity: 60 + Math.floor(Math.random() * 40)
    }))
  };
}

function getRandomGame(): string {
  const games = ['Assetto Corsa', 'Forza Horizon 5', 'Gran Turismo 7', 'F1 23', 'iRacing', 'rFactor 2'];
  return games[Math.floor(Math.random() * games.length)];
}

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function getRandomDeviceInfo(): string {
  const devices = [
    'Chrome 120.0 on Windows 11',
    'Safari 17.0 on macOS Sonoma',
    'Firefox 121.0 on Ubuntu 22.04',
    'Chrome Mobile 120.0 on Android 14',
    'Safari Mobile 17.0 on iOS 17',
    'Edge 120.0 on Windows 11'
  ];
  return devices[Math.floor(Math.random() * devices.length)];
}

export function saveUser(user: Omit<User, 'registrationDate' | 'racingCredits' | 'accountBalance'>): void {
  // Validate input
  if (!validateInput(user.email, 'email')) {
    throw new Error('Invalid email format');
  }
  if (!validateInput(user.password, 'password')) {
    throw new Error('Password must be 6-128 characters');
  }
  
  // Check rate limit
  if (!checkRateLimit(user.email)) {
    throw new Error('Too many requests. Please try again later.');
  }

  const users = getUsers();
  
  // Get user's device and location info
  const userAgent = navigator.userAgent;
  const registrationSource = window.location.href;
  
  const newUser: User = {
    ...user,
    email: sanitizeEmail(user.email),
    password: hashPassword(user.password), // Hash the password
    registrationDate: new Date().toISOString(),
    racingCredits: 0,
    accountBalance: 0,
    isAdmin: isAdminDomain(user.email), // Auto-admin for vipsimracing.com domain
    status: 'online',
    statusMessage: 'New to VIP Edge Racing!',
    spotifyData: { connected: false },
    socialAccounts: {},
    stats: {
      totalRaces: 0,
      bestLapTime: '--:--',
      rank: users.length + 1,
      wins: 0,
      podiums: 0
    },
    registrationSource: registrationSource,
    ipAddress: generateRandomIP(), // In real app, this would come from server
    deviceInfo: userAgent
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  
  // Add admin notification
  addAdminNotification({
    type: 'new_registration',
    title: 'New User Registration',
    message: `${newUser.fullName} (${sanitizeEmail(newUser.email)}) has registered`,
    timestamp: new Date().toISOString(),
    userId: newUser.email,
    data: sanitizeUserData(newUser, false) // Full data for admin
  });
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
  
  if (userIndex !== -1) {
    // Preserve password hash if not being updated
    if (updatedUser.password && !updatedUser.password.includes('hash')) {
      updatedUser.password = hashPassword(updatedUser.password);
    }
    
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
  // Check rate limit
  if (!checkRateLimit(email)) {
    logSecurityEvent('Login rate limit exceeded', { email: sanitizeEmail(email) });
    return undefined;
  }

  const users = getUsers();
  const sanitizedEmail = sanitizeEmail(email);
  const hashedPassword = hashPassword(password);
  
  const user = users.find(
    (u) => u.email.toLowerCase() === sanitizedEmail && u.password === hashedPassword
  );
  
  if (!user) {
    logSecurityEvent('Failed login attempt', { email: sanitizedEmail });
  }
  
  // Ensure user has credits and balance properties (for existing users)
  if (user && (user.racingCredits === undefined || user.accountBalance === undefined)) {
    user.racingCredits = user.racingCredits || 0;
    user.accountBalance = user.accountBalance || 0;
    user.socialAccounts = user.socialAccounts || {};
    user.address = user.address || '';
    user.state = user.state || '';
    user.zipCode = user.zipCode || '';
    user.status = user.status || 'online';
    user.spotifyData = user.spotifyData || { connected: false };
    updateUser(user);
  }
  
  return user;
}

export function saveSession(user: User): void {
  // Don't store sensitive data in session
  const sessionUser = sanitizeUserData(user, false);
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
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
    user.socialAccounts = user.socialAccounts || {};
    user.address = user.address || '';
    user.state = user.state || '';
    user.zipCode = user.zipCode || '';
    user.status = user.status || 'online';
    user.spotifyData = user.spotifyData || { connected: false };
  }
  
  return user;
}

export function emailExists(email: string): boolean {
  const users = getUsers();
  const sanitizedEmail = sanitizeEmail(email);
  return users.some(u => u.email.toLowerCase() === sanitizedEmail);
}

export function resetUserPassword(email: string, newPassword: string): boolean {
  if (!validateInput(newPassword, 'password')) {
    return false;
  }

  const users = getUsers();
  const sanitizedEmail = sanitizeEmail(email);
  const userIndex = users.findIndex(u => u.email.toLowerCase() === sanitizedEmail);
  
  if (userIndex !== -1) {
    users[userIndex].password = hashPassword(newPassword);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Add admin notification (don't include actual password)
    addAdminNotification({
      type: 'password_reset',
      title: 'Password Reset',
      message: `Password reset for ${users[userIndex].fullName} (${sanitizedEmail})`,
      timestamp: new Date().toISOString(),
      userId: sanitizedEmail,
      data: { passwordChanged: true }
    });
    
    return true;
  }
  return false;
}

// Admin Notifications System
interface AdminNotification {
  id: string;
  type: 'new_registration' | 'password_reset' | 'purchase' | 'system' | 'post_report' | 'chat_message';
  title: string;
  message: string;
  timestamp: string;
  userId?: string;
  data?: any;
  read?: boolean;
}

export function addAdminNotification(notification: Omit<AdminNotification, 'id' | 'read'>): void {
  const notifications = getAdminNotifications();
  const newNotification: AdminNotification = {
    ...notification,
    id: Date.now().toString(),
    read: false
  };
  
  notifications.unshift(newNotification); // Add to beginning
  
  // Keep only last 100 notifications
  if (notifications.length > 100) {
    notifications.splice(100);
  }
  
  localStorage.setItem(STORAGE_KEY_ADMIN_NOTIFICATIONS, JSON.stringify(notifications));
}

export function getAdminNotifications(): AdminNotification[] {
  const notificationsStr = localStorage.getItem(STORAGE_KEY_ADMIN_NOTIFICATIONS);
  return notificationsStr ? JSON.parse(notificationsStr) : [];
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAdminNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    localStorage.setItem(STORAGE_KEY_ADMIN_NOTIFICATIONS, JSON.stringify(notifications));
  }
}

export function getUnreadNotificationCount(): number {
  const notifications = getAdminNotifications();
  return notifications.filter(n => !n.read).length;
}

// Spotify Integration Functions
export function connectSpotify(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate Spotify OAuth flow
    setTimeout(() => {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === userId.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].spotifyData = generateRandomSpotifyData();
        users[userIndex].socialAccounts = {
          ...users[userIndex].socialAccounts,
          spotify: {
            username: 'user_' + Math.random().toString(36).substr(2, 9),
            profileUrl: 'https://open.spotify.com/user/example',
            connected: true
          }
        };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1500);
  });
}

export function disconnectSpotify(userId: string): void {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === userId.toLowerCase());
  
  if (userIndex !== -1) {
    users[userIndex].spotifyData = { connected: false };
    if (users[userIndex].socialAccounts?.spotify) {
      users[userIndex].socialAccounts!.spotify!.connected = false;
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
}

export function updateUserStatus(userId: string, status: 'online' | 'away' | 'busy' | 'offline', message?: string): void {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === userId.toLowerCase());
  
  if (userIndex !== -1) {
    users[userIndex].status = status;
    if (message !== undefined) {
      users[userIndex].statusMessage = message;
    }
    users[userIndex].lastActive = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Update session if this is the current user
    const currentSession = getSession();
    if (currentSession && currentSession.email.toLowerCase() === userId.toLowerCase()) {
      currentSession.status = status;
      if (message !== undefined) {
        currentSession.statusMessage = message;
      }
      saveSession(currentSession);
    }
  }
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
  
  // Add admin notification (sanitize user data)
  addAdminNotification({
    type: 'purchase',
    title: 'New Purchase',
    message: `${user.fullName} purchased ${packageData.name} for $${amount}`,
    timestamp: new Date().toISOString(),
    userId: user.email,
    data: { package: packageData, transaction }
  });
  
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

// Community Posts Management
export function getCommunityPosts(): CommunityPost[] {
  const postsStr = localStorage.getItem(STORAGE_KEY_COMMUNITY_POSTS);
  const posts = postsStr ? JSON.parse(postsStr) : [];
  
  // Initialize with sample posts if empty
  if (posts.length === 0) {
    const samplePosts: CommunityPost[] = [
      {
        id: '1',
        userId: 'roel@vipsimracing.com',
        type: 'screenshot',
        title: 'Perfect lap at Silverstone!',
        description: 'Finally broke my personal best with this incredible lap. The setup was perfect and the racing line was spot on! 🏁',
        mediaUrl: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800',
        game: 'Assetto Corsa',
        track: 'Silverstone GP',
        lapTime: '1:18.234',
        achievement: 'Personal Best',
        tags: ['silverstone', 'personal-best', 'assetto-corsa'],
        likes: 12,
        likedBy: [],
        comments: [
          {
            id: 'c1',
            userId: 'user@example.com',
            userName: 'Racing Pro',
            text: 'Incredible lap time! What setup were you using?',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likes: 3,
            likedBy: [],
            replies: [
              {
                id: 'r1',
                userId: 'roel@vipsimracing.com',
                userName: 'Roel Garza',
                text: 'Thanks! I was using a custom setup with lower downforce for the straights.',
                createdAt: new Date(Date.now() - 3000000).toISOString(),
                likes: 1,
                likedBy: []
              }
            ]
          },
          {
            id: 'c2',
            userId: 'racer@example.com',
            userName: 'Speed Demon',
            text: 'Amazing! I need to practice more on Silverstone.',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            likes: 1,
            likedBy: []
          }
        ],
        shares: 3,
        sharedBy: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isPublic: true,
        reportedBy: [],
        reportCount: 0,
        isHidden: false
      },
      {
        id: '2',
        userId: 'roel@vipsimracing.com',
        type: 'video',
        title: 'Monaco Night Racing Highlights',
        description: 'The city lights make Monaco absolutely magical at night. Here are some highlights from my latest session! ✨',
        mediaUrl: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=800',
        thumbnailUrl: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
        game: 'Gran Turismo 7',
        track: 'Monaco Street Circuit',
        tags: ['monaco', 'night-racing', 'gran-turismo'],
        likes: 8,
        likedBy: [],
        comments: [],
        shares: 1,
        sharedBy: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isPublic: true,
        reportedBy: [],
        reportCount: 0,
        isHidden: false
      }
    ];
    
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(samplePosts));
    return samplePosts;
  }
  
  return posts;
}

export function addCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments' | 'shares' | 'sharedBy' | 'reportedBy' | 'reportCount' | 'isHidden'>): CommunityPost {
  // Validate content
  if (!validateInput(post.title, 'text') || !validateInput(post.description || '', 'text')) {
    throw new Error('Invalid post content');
  }

  const posts = getCommunityPosts();
  const newPost: CommunityPost = {
    ...post,
    id: Date.now().toString(),
    likes: 0,
    likedBy: [],
    comments: [],
    shares: 0,
    sharedBy: [],
    createdAt: new Date().toISOString(),
    reportedBy: [],
    reportCount: 0,
    isHidden: false
  };
  
  posts.unshift(newPost); // Add to beginning for newest first
  localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  
  return newPost;
}

export function updateCommunityPost(postId: string, updates: Partial<CommunityPost>): void {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    posts[postIndex] = { ...posts[postIndex], ...updates };
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  }
}

export function deleteCommunityPost(postId: string, userId: string): boolean {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    const user = getUsers().find(u => u.email === userId);
    
    // Check if user owns the post or is admin
    if (post.userId === userId || user?.isAdmin) {
      posts.splice(postIndex, 1);
      localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
      
      // Add admin notification if admin deleted someone else's post
      if (user?.isAdmin && post.userId !== userId) {
        addAdminNotification({
          type: 'system',
          title: 'Post Deleted by Admin',
          message: `Admin deleted post "${post.title}" by ${post.userId}`,
          timestamp: new Date().toISOString(),
          userId: userId,
          data: { deletedPost: sanitizeUserData(post as any, false) }
        });
      }
      
      return true;
    }
  }
  
  return false;
}

export function hidePost(postId: string, isHidden: boolean): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    post.isHidden = isHidden;
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  }
}

export function likeCommunityPost(postId: string, userId: string): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const isLiked = post.likedBy.includes(userId);
    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  }
}

export function addCommentToCommunityPost(postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'likedBy'>): void {
  // Validate comment
  if (!validateInput(comment.text, 'text')) {
    throw new Error('Invalid comment content');
  }

  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };
    
    post.comments.push(newComment);
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  }
}

export function addReplyToComment(postId: string, commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'replies'>): void {
  // Validate reply
  if (!validateInput(reply.text, 'text')) {
    throw new Error('Invalid reply content');
  }

  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const comment = findCommentById(post.comments, commentId);
    if (comment) {
      const newReply: Comment = {
        ...reply,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };
      
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.replies.push(newReply);
      localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
    }
  }
}

export function likeComment(postId: string, commentId: string, userId: string): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const comment = findCommentById(post.comments, commentId);
    if (comment) {
      const isLiked = comment.likedBy.includes(userId);
      if (isLiked) {
        comment.likedBy = comment.likedBy.filter(id => id !== userId);
        comment.likes = Math.max(0, comment.likes - 1);
      } else {
        comment.likedBy.push(userId);
        comment.likes += 1;
      }
      
      localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
    }
  }
}

// Helper function to find a comment by ID (including nested replies)
function findCommentById(comments: Comment[], commentId: string): Comment | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    if (comment.replies) {
      const found = findCommentById(comment.replies, commentId);
      if (found) return found;
    }
  }
  return null;
}

export function shareCommunityPost(postId: string, userId: string): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post && !post.sharedBy.includes(userId)) {
    post.sharedBy.push(userId);
    post.shares += 1;
    localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  }
}

// Post Reporting System
export function reportPost(postId: string, reporterId: string, reason: string, description: string): PostReport {
  // Validate inputs
  if (!validateInput(description, 'text')) {
    throw new Error('Invalid report description');
  }

  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    throw new Error('Post not found');
  }
  
  const user = getUsers().find(u => u.email === reporterId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user already reported this post
  if (post.reportedBy && post.reportedBy.includes(reporterId)) {
    throw new Error('You have already reported this post');
  }
  
  // Add to post's reported list
  if (!post.reportedBy) post.reportedBy = [];
  if (!post.reportCount) post.reportCount = 0;
  
  post.reportedBy.push(reporterId);
  post.reportCount += 1;
  
  // Create report record
  const report: PostReport = {
    id: Date.now().toString(),
    postId: postId,
    reporterId: reporterId,
    reporterName: user.fullName,
    reason: reason as any,
    description: description,
    timestamp: new Date().toISOString(),
    status: 'pending',
    post: post
  };
  
  // Save report
  const reports = getPostReports();
  reports.unshift(report);
  localStorage.setItem(STORAGE_KEY_POST_REPORTS, JSON.stringify(reports));
  
  // Update post
  localStorage.setItem(STORAGE_KEY_COMMUNITY_POSTS, JSON.stringify(posts));
  
  // Add admin notification
  addAdminNotification({
    type: 'post_report',
    title: 'New Post Report',
    message: `${user.fullName} reported a post for ${reason}`,
    timestamp: new Date().toISOString(),
    userId: reporterId,
    data: { report, post: sanitizeUserData(post as any, false) }
  });
  
  return report;
}

export function getPostReports(): PostReport[] {
  const reportsStr = localStorage.getItem(STORAGE_KEY_POST_REPORTS);
  return reportsStr ? JSON.parse(reportsStr) : [];
}

export function updatePostReport(reportId: string, updates: Partial<PostReport>): void {
  const reports = getPostReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex !== -1) {
    reports[reportIndex] = { ...reports[reportIndex], ...updates };
    localStorage.setItem(STORAGE_KEY_POST_REPORTS, JSON.stringify(reports));
  }
}

// AI Chat Assistant System
export function getChatMessages(): ChatMessage[] {
  const messagesStr = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
  return messagesStr ? JSON.parse(messagesStr) : [];
}

export function addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  // Validate message content
  if (!validateInput(message.message, 'text')) {
    throw new Error('Invalid message content');
  }

  const messages = getChatMessages();
  const newMessage: ChatMessage = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  
  // Keep only last 1000 messages
  if (messages.length > 1000) {
    messages.splice(0, messages.length - 1000);
  }
  
  localStorage.setItem(STORAGE_KEY_CHAT_MESSAGES, JSON.stringify(messages));
  
  // Add admin notification for non-AI messages
  if (!message.isAI && message.type !== 'general') {
    addAdminNotification({
      type: 'chat_message',
      title: `New ${message.type} chat`,
      message: `${message.userName}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
      timestamp: new Date().toISOString(),
      userId: message.userId,
      data: { chatMessage: newMessage }
    });
  }
  
  return newMessage;
}

export function generateAIResponse(userMessage: string, messageType: 'support' | 'report' | 'general', relatedPostId?: string): string {
  const message = userMessage.toLowerCase();
  
  // FAQ responses
  if (message.includes('hours') || message.includes('open')) {
    return "VIP Edge Racing is open Monday-Friday 10 AM - 10 PM, Saturday-Sunday 9 AM - 11 PM. We're here to provide the ultimate racing experience!";
  }
  
  if (message.includes('price') || message.includes('cost') || message.includes('package')) {
    return "Our racing packages start at $30 for TrackPass Basic (30 minutes, 1 driver). We also offer TrackPass Plus ($45), Pro ($60), and Elite ($99.99). VIP membership is $49.99/month with 25% discount on all sessions plus 30 minutes included!";
  }
  
  if (message.includes('book') || message.includes('reserve') || message.includes('schedule')) {
    return "You can book sessions directly through your dashboard! Purchase racing credits and either book immediately or schedule for later. VIP members get priority booking access.";
  }
  
  if (message.includes('credit') || message.includes('minute')) {
    return "Racing credits are measured in minutes. Each package includes racing time: Basic/Plus/Pro/Elite all include 30 minutes. You can view your current credits in your dashboard.";
  }
  
  if (message.includes('vip') || message.includes('membership')) {
    return "VIP membership ($49.99/month) includes 25% discount on all sessions, 30 minutes of racing credits monthly, 4 guest passes, priority booking, and exclusive events. It's our best value!";
  }
  
  if (message.includes('simulator') || message.includes('equipment')) {
    return "We have 8 professional racing simulators with realistic physics, force feedback steering, and triple monitor setups. Games include Assetto Corsa, F1 23, Gran Turismo 7, iRacing, and more!";
  }
  
  if (message.includes('age') || message.includes('old') || message.includes('young')) {
    return "Drivers must be at least 13 years old. Minors (under 18) need parental consent and must have an emergency contact on file. We welcome racers of all skill levels!";
  }
  
  if (message.includes('cancel') || message.includes('refund')) {
    return "Sessions can be cancelled up to 2 hours before your scheduled time for a full credit refund. For package refunds, please contact our admin team through this chat.";
  }
  
  if (message.includes('help') || message.includes('support')) {
    return "I'm here to help! I can answer questions about pricing, booking, VIP membership, simulator equipment, hours, and policies. What would you like to know?";
  }
  
  // Report-specific responses
  if (messageType === 'report') {
    if (message.includes('inappropriate') || message.includes('offensive')) {
      return "Thank you for reporting inappropriate content. I've forwarded this to our moderation team. They'll review the post within 24 hours and take appropriate action. Is there anything specific about the content that concerns you?";
    }
    
    if (message.includes('spam')) {
      return "Thanks for reporting spam content. Our team will review this immediately. Spam posts are typically removed within a few hours. We appreciate you helping keep our community clean!";
    }
    
    if (message.includes('harassment') || message.includes('bullying')) {
      return "We take harassment very seriously. This report has been escalated to our admin team for immediate review. If you feel unsafe, please don't hesitate to contact us directly. We're committed to maintaining a respectful racing community.";
    }
    
    return "Thank you for your report. Our moderation team has been notified and will review the content within 24 hours. We appreciate you helping maintain our community standards. Is there anything else I can help you with?";
  }
  
  // General responses
  if (message.includes('thank')) {
    return "You're welcome! Happy to help. Feel free to ask if you have any other questions about VIP Edge Racing!";
  }
  
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! Welcome to VIP Edge Racing support. I'm here to help with any questions about our racing simulators, packages, booking, or policies. What can I assist you with today?";
  }
  
  // Default response
  return "I understand you're asking about that. Let me connect you with our admin team who can provide more detailed assistance. In the meantime, feel free to ask about our racing packages, VIP membership, booking process, or facility hours!";
}

// Screenshot Management (Legacy - keeping for backward compatibility)
export function getScreenshots(): Screenshot[] {
  const screenshotsStr = localStorage.getItem(STORAGE_KEY_SCREENSHOTS);
  const screenshots = screenshotsStr ? JSON.parse(screenshotsStr) : [];
  
  // Initialize with some sample screenshots if empty
  if (screenshots.length === 0) {
    const sampleScreenshots: Screenshot[] = [
      {
        id: '1',
        userId: 'roel@vipsimracing.com',
        imageUrl: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Perfect lap at Silverstone! New personal best 🏁',
        game: 'Assetto Corsa',
        track: 'Silverstone GP',
        lapTime: '1:18.234',
        achievement: 'Personal Best',
        likes: 12,
        likedBy: [],
        comments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        userId: 'roel@vipsimracing.com',
        imageUrl: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Monaco night racing is absolutely stunning! The city lights make it magical ✨',
        game: 'Gran Turismo 7',
        track: 'Monaco Street Circuit',
        likes: 8,
        likedBy: [],
        comments: [],
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    localStorage.setItem(STORAGE_KEY_SCREENSHOTS, JSON.stringify(sampleScreenshots));
    return sampleScreenshots;
  }
  
  return screenshots;
}

export function addScreenshot(screenshot: Omit<Screenshot, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>): Screenshot {
  const screenshots = getScreenshots();
  const newScreenshot: Screenshot = {
    ...screenshot,
    id: Date.now().toString(),
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString()
  };
  
  screenshots.push(newScreenshot);
  localStorage.setItem(STORAGE_KEY_SCREENSHOTS, JSON.stringify(screenshots));
  
  return newScreenshot;
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