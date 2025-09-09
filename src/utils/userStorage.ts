import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSecurePassword } from './passwordSecurity';

export interface User {
  fullName: string;
  dob: string;
  email: string;
  passwordHash: string; // Changed from 'password' to 'passwordHash'
  phone: string;
  address?: string;
  state?: string;
  zipCode?: string;
  emergencyName: string;
  emergencyPhone: string;
  registrationDate: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  racingCredits?: number;
  accountBalance?: number;
  isAdmin?: boolean;
  isOnline?: boolean;
  lastActive?: string;
  currentSimulator?: number | null;
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
  };
  socialAccounts?: {
    [key: string]: {
      username?: string;
      profileUrl?: string;
      connected: boolean;
      [key: string]: any;
    };
  };
  vipMembership?: {
    active: boolean;
    expiryDate: string;
    discount: number;
  };
  stats?: {
    totalRaces: number;
    bestLapTime: string;
    rank: number;
    wins: number;
    podiums: number;
  };
  registrationSource?: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund';
  packageName: string;
  description: string;
  amount: number;
  credits: number;
  date: string;
}

export interface Simulator {
  id: number;
  name: string;
  isActive: boolean;
  currentUser?: User;
  currentGame?: string;
  screens?: string[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  type: 'screenshot' | 'video' | 'lap_record' | 'highlight';
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  game?: string;
  track?: string;
  lapTime?: string;
  achievement?: string;
  tags?: string[];
  likes: number;
  likedBy: string[];
  shares: number;
  sharedBy: string[];
  comments?: Comment[];
  createdAt: string;
  isPublic: boolean;
  isHidden?: boolean;
  reportedBy?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
  createdAt: string;
  read?: boolean;
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
  post?: CommunityPost;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isAI: boolean;
  type: 'support' | 'report' | 'general';
  relatedPostId?: string;
}

export interface GameFile {
  id: string;
  gameId: string;
  name: string;
  description: string;
  fileUrl: string;
  fileType: 'setup' | 'mod' | 'update' | 'config' | 'server';
  version?: string;
  uploadDate: string;
  isActive: boolean;
}

export const RACING_GAMES = [
  {
    id: 'assetto-corsa-competizione',
    name: 'Assetto Corsa Competizione',
    description: 'Official GT World Challenge game with authentic GT3 and GT4 racing',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
    launchUrl: null
  },
  {
    id: 'iracing',
    name: 'iRacing',
    description: 'The world\'s premier online racing simulation platform',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
    launchUrl: null
  },
  {
    id: 'f1-24',
    name: 'F1 24',
    description: 'Official Formula 1 racing game with all 2024 teams and circuits',
    image: 'https://images.pexels.com/photos/1007456/pexels-photo-1007456.jpeg',
    launchUrl: null
  },
  {
    id: 'gran-turismo-7',
    name: 'Gran Turismo 7',
    description: 'The ultimate driving simulator with over 400 cars and legendary tracks',
    image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg',
    launchUrl: null
  },
  {
    id: 'dirt-rally-2',
    name: 'DiRT Rally 2.0',
    description: 'Challenging rally racing through diverse terrains and weather conditions',
    image: 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
    launchUrl: null
  },
  {
    id: 'forza-motorsport',
    name: 'Forza Motorsport',
    description: 'Turn 10\'s flagship racing simulation with dynamic time of day and weather',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
    launchUrl: null
  },
  {
    id: 'rfactor-2',
    name: 'rFactor 2',
    description: 'Professional-grade racing simulation used by real racing teams',
    image: 'https://images.pexels.com/photos/1007456/pexels-photo-1007456.jpeg',
    launchUrl: null
  },
  {
    id: 'automobilista-2',
    name: 'Automobilista 2',
    description: 'Brazilian racing simulation featuring diverse motorsport disciplines',
    image: 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
    launchUrl: null
  },
  {
    id: 'project-cars-3',
    name: 'Project CARS 3',
    description: 'Dynamic racing with career progression and authentic motorsport experience',
    image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg',
    launchUrl: null
  },
  {
    id: 'acc-british-gt',
    name: 'ACC - British GT Pack',
    description: 'British GT Championship expansion with iconic UK circuits',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
    launchUrl: null
  },
  {
    id: 'beamng-drive',
    name: 'BeamNG.drive',
    description: 'Advanced vehicle simulation with realistic physics and damage modeling',
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
    launchUrl: null
  },
  {
    id: 'wreckfest',
    name: 'Wreckfest',
    description: 'Demolition derby and banger racing with realistic damage physics',
    image: 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
    launchUrl: null
  },
  {
    id: 'drift-game',
    name: 'Drift',
    description: 'Master the art of drifting with realistic physics and challenging courses',
    image: 'https://images.pexels.com/photos/1007456/pexels-photo-1007456.jpeg',
    launchUrl: 'https://fups.itch.io/drift'
  }
];

// Define getUsers first
export const getUsers = (): User[] => {
  const users = localStorage.getItem('vip_users');
  if (!users) return [];
  
  try {
    return JSON.parse(users);
  } catch (error) {
    // If parsing fails (corrupted/encrypted data), clear the storage and return empty array
    console.warn('Corrupted user data detected, clearing localStorage and reinitializing...');
    localStorage.removeItem('vip_users');
    localStorage.removeItem('vip_session');
    localStorage.removeItem('vip_simulators');
    localStorage.removeItem('vip_transactions');
    localStorage.removeItem('vip_community_posts');
    localStorage.removeItem('vip_admin_notifications');
    localStorage.removeItem('vip_post_reports');
    localStorage.removeItem('vip_chat_messages');
    localStorage.removeItem('vip_game_files');
    return [];
  }
};

// Admin Notifications functions (needed by initializeStorage)
export const addAdminNotification = (notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) => {
  const notifications = getAdminNotifications();
  const newNotification = {
    id: Date.now().toString(),
    ...notification,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  notifications.unshift(newNotification); // Add to beginning
  localStorage.setItem('vip_admin_notifications', JSON.stringify(notifications));
};

export const getAdminNotifications = () => {
  const notifications = localStorage.getItem('vip_admin_notifications');
  return notifications ? JSON.parse(notifications) : [];
};

// Game Files Management
export const getGameFiles = (): GameFile[] => {
  const files = localStorage.getItem('vip_game_files');
  return files ? JSON.parse(files) : [];
};

export const addGameFile = (fileData: Omit<GameFile, 'id' | 'uploadDate'>): GameFile => {
  const files = getGameFiles();
  const newFile: GameFile = {
    ...fileData,
    id: Date.now().toString(),
    uploadDate: new Date().toISOString()
  };
  
  files.push(newFile);
  localStorage.setItem('vip_game_files', JSON.stringify(files));
  
  // Add admin notification
  addAdminNotification({
    type: 'game_file_upload',
    title: 'New Game File Added',
    message: `${fileData.name} has been added to ${RACING_GAMES.find(g => g.id === fileData.gameId)?.name || 'Unknown Game'}`,
    data: {
      fileName: fileData.name,
      gameId: fileData.gameId,
      fileType: fileData.fileType
    }
  });
  
  return newFile;
};

export const updateGameFile = (fileId: string, updates: Partial<GameFile>) => {
  const files = getGameFiles();
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex !== -1) {
    files[fileIndex] = { ...files[fileIndex], ...updates };
    localStorage.setItem('vip_game_files', JSON.stringify(files));
  }
};

export const deleteGameFile = (fileId: string) => {
  const files = getGameFiles();
  const filteredFiles = files.filter(f => f.id !== fileId);
  localStorage.setItem('vip_game_files', JSON.stringify(filteredFiles));
};

export const getGameFilesByGameId = (gameId: string): GameFile[] => {
  const files = getGameFiles();
  return files.filter(f => f.gameId === gameId && f.isActive);
};

// Migration function to hash existing plain-text passwords
const migratePasswordsToHashed = async () => {
  const users = getUsers();
  let needsUpdate = false;
  
  for (const user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
      // This is a plain-text password that needs to be hashed
      try {
        user.passwordHash = await hashPassword(user.passwordHash);
        needsUpdate = true;
        console.log(`Migrated password for user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to migrate password for user: ${user.email}`, error);
      }
    }
    // Handle legacy 'password' field
    else if ('password' in user && typeof (user as any).password === 'string') {
      try {
        user.passwordHash = await hashPassword((user as any).password);
        delete (user as any).password; // Remove the old field
        needsUpdate = true;
        console.log(`Migrated legacy password for user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to migrate legacy password for user: ${user.email}`, error);
      }
    }
  }
  
  if (needsUpdate) {
    localStorage.setItem('vip_users', JSON.stringify(users));
    console.log('Password migration completed');
  }
};

// Initialize with admin user and sample data
const initializeStorage = async () => {
  if (!localStorage.getItem('vip_users')) {
    const adminPasswordHash = await hashPassword(generateSecurePassword(16));
    
    const adminUser: User = {
      fullName: 'VIP SIM RACING Admin',
      dob: '1985-01-01',
      email: 'admin@vipsimracing.com',
      passwordHash: adminPasswordHash,
      phone: '(800) 897-5419',
      address: '',
      state: 'Texas',
      zipCode: '',
      emergencyName: '',
      emergencyPhone: '',
      registrationDate: new Date().toISOString(),
      profilePicture: '',
      bannerImage: '',
      bio: 'VIP SIM RACING Administrator',
      racingCredits: 0,
      accountBalance: 0,
      isAdmin: true,
      isOnline: false,
      lastActive: new Date().toISOString(),
      currentSimulator: null,
      isStreaming: false,
      currentGame: '',
      status: 'offline',
      statusMessage: '',
      spotifyData: {
        connected: false
      },
      socialAccounts: {},
      vipMembership: undefined,
      stats: {
        totalRaces: 0,
        bestLapTime: '--:--',
        rank: 1,
        wins: 0,
        podiums: 0
      },
      registrationSource: 'System',
      deviceInfo: 'Server',
      ipAddress: 'localhost'
    };

    // Roel's admin account
    const roelAdmin: User = {
      fullName: 'Roel Garza',
      dob: '1985-01-01',
      email: 'roel@vipsimracing.com',
      passwordHash: await hashPassword(generateSecurePassword(16)),
      phone: '(800) 897-5419',
      address: '',
      state: 'Texas',
      zipCode: '',
      emergencyName: '',
      emergencyPhone: '',
      registrationDate: new Date().toISOString(),
      profilePicture: '',
      bannerImage: '',
      bio: 'Owner and founder of VIP SIM RACING.',
      racingCredits: 0,
      accountBalance: 0,
      isAdmin: true,
      isOnline: false,
      lastActive: new Date().toISOString(),
      currentSimulator: null,
      isStreaming: false,
      currentGame: '',
      status: 'offline',
      statusMessage: '',
      spotifyData: {
        connected: false
      },
      socialAccounts: {},
      vipMembership: undefined,
      stats: {
        totalRaces: 0,
        bestLapTime: '--:--',
        rank: 2,
        wins: 0,
        podiums: 0
      },
      registrationSource: 'System',
      deviceInfo: 'Server',
      ipAddress: 'localhost'
    };

    // Additional admin account for roelggarza@gmail.com
    const roelGmailAdmin: User = {
      fullName: 'Roel Garza',
      dob: '1985-01-01',
      email: 'roelggarza@gmail.com',
      passwordHash: await hashPassword(generateSecurePassword(16)),
      phone: '(800) 897-5419',
      address: '',
      state: 'Texas',
      zipCode: '',
      emergencyName: '',
      emergencyPhone: '',
      registrationDate: new Date().toISOString(),
      profilePicture: '',
      bannerImage: '',
      bio: 'Owner and founder of VIP SIM RACING.',
      racingCredits: 0,
      accountBalance: 0,
      isAdmin: true,
      isOnline: false,
      lastActive: new Date().toISOString(),
      currentSimulator: null,
      isStreaming: false,
      currentGame: '',
      status: 'offline',
      statusMessage: '',
      spotifyData: {
        connected: false
      },
      socialAccounts: {},
      vipMembership: undefined,
      stats: {
        totalRaces: 0,
        bestLapTime: '--:--',
        rank: 3,
        wins: 0,
        podiums: 0
      },
      registrationSource: 'System',
      deviceInfo: 'Server',
      ipAddress: 'localhost'
    };

    localStorage.setItem('vip_users', JSON.stringify([adminUser, roelAdmin, roelGmailAdmin]));
    
    // Initialize simulators
    const simulators: Simulator[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Racing Simulator ${i + 1}`,
      isActive: false,
      currentUser: undefined,
      currentGame: '',
      screens: []
    }));
    
    localStorage.setItem('vip_simulators', JSON.stringify(simulators));
    localStorage.setItem('vip_transactions', JSON.stringify([]));
    localStorage.setItem('vip_community_posts', JSON.stringify([]));
    localStorage.setItem('vip_admin_notifications', JSON.stringify([]));
    localStorage.setItem('vip_post_reports', JSON.stringify([]));
    localStorage.setItem('vip_chat_messages', JSON.stringify([]));
    localStorage.setItem('vip_game_files', JSON.stringify([]));
  } else {
    // Migrate existing passwords to hashed versions
    await migratePasswordsToHashed();
    
    // Check if the new admin user already exists, if not add them
    const users = getUsers();
    const existingAdmin = users.find(u => u.email === 'admin@vipsimracing.com');
    const existingRoel = users.find(u => u.email === 'roel@vipsimracing.com');
    const existingRoelGmail = users.find(u => u.email === 'roelggarza@gmail.com');
    
    if (!existingAdmin) {
      const adminPasswordHash = await hashPassword(generateSecurePassword(16));
      
      const newAdmin: User = {
        fullName: 'VIP SIM RACING Admin',
        dob: '1985-01-01',
        email: 'admin@vipsimracing.com',
        passwordHash: adminPasswordHash,
        phone: '(800) 897-5419',
        address: '',
        state: 'Texas',
        zipCode: '',
        emergencyName: '',
        emergencyPhone: '',
        registrationDate: new Date().toISOString(),
        profilePicture: '',
        bannerImage: '',
        bio: 'VIP SIM RACING Administrator',
        racingCredits: 0,
        accountBalance: 0,
        isAdmin: true,
        isOnline: false,
        lastActive: new Date().toISOString(),
        currentSimulator: null,
        isStreaming: false,
        currentGame: '',
        status: 'offline',
        statusMessage: '',
        spotifyData: {
          connected: false
        },
        socialAccounts: {},
        vipMembership: undefined,
        stats: {
          totalRaces: 0,
          bestLapTime: '--:--',
          rank: 1,
          wins: 0,
          podiums: 0
        },
        registrationSource: 'System',
        deviceInfo: 'Server',
        ipAddress: 'localhost'
      };
      
      users.push(newAdmin);
      localStorage.setItem('vip_users', JSON.stringify(users));
    } else if (!existingAdmin.isAdmin) {
      // Make sure the existing user is an admin
      existingAdmin.isAdmin = true;
      localStorage.setItem('vip_users', JSON.stringify(users));
    }
    
    // Add roel@vipsimracing.com admin if not exists
    if (!existingRoel) {
      const roelPasswordHash = await hashPassword(generateSecurePassword(16));
      
      const roelAdmin: User = {
        fullName: 'Roel Garza',
        dob: '1985-01-01',
        email: 'roel@vipsimracing.com',
        passwordHash: roelPasswordHash,
        phone: '(800) 897-5419',
        address: '',
        state: 'Texas',
        zipCode: '',
        emergencyName: '',
        emergencyPhone: '',
        registrationDate: new Date().toISOString(),
        profilePicture: '',
        bannerImage: '',
        bio: 'Owner and founder of VIP SIM RACING.',
        racingCredits: 0,
        accountBalance: 0,
        isAdmin: true,
        isOnline: false,
        lastActive: new Date().toISOString(),
        currentSimulator: null,
        isStreaming: false,
        currentGame: '',
        status: 'offline',
        statusMessage: '',
        spotifyData: {
          connected: false
        },
        socialAccounts: {},
        vipMembership: undefined,
        stats: {
          totalRaces: 0,
          bestLapTime: '--:--',
          rank: users.length + 1,
          wins: 0,
          podiums: 0
        },
        registrationSource: 'System',
        deviceInfo: 'Server',
        ipAddress: 'localhost'
      };
      
      users.push(roelAdmin);
      localStorage.setItem('vip_users', JSON.stringify(users));
    } else if (!existingRoel.isAdmin) {
      // Make sure the existing user is an admin
      existingRoel.isAdmin = true;
      localStorage.setItem('vip_users', JSON.stringify(users));
    }
    
    // Add roelggarza@gmail.com admin if not exists
    if (!existingRoelGmail) {
      const roelGmailPasswordHash = await hashPassword(generateSecurePassword(16));
      
      const roelGmailAdmin: User = {
        fullName: 'Roel Garza',
        dob: '1985-01-01',
        email: 'roelggarza@gmail.com',
        passwordHash: roelGmailPasswordHash,
        phone: '(800) 897-5419',
        address: '',
        state: 'Texas',
        zipCode: '',
        emergencyName: '',
        emergencyPhone: '',
        registrationDate: new Date().toISOString(),
        profilePicture: '',
        bannerImage: '',
        bio: 'Owner and founder of VIP SIM RACING.',
        racingCredits: 0,
        accountBalance: 0,
        isAdmin: true,
        isOnline: false,
        lastActive: new Date().toISOString(),
        currentSimulator: null,
        isStreaming: false,
        currentGame: '',
        status: 'offline',
        statusMessage: '',
        spotifyData: {
          connected: false
        },
        socialAccounts: {},
        vipMembership: undefined,
        stats: {
          totalRaces: 0,
          bestLapTime: '--:--',
          rank: users.length + 1,
          wins: 0,
          podiums: 0
        },
        registrationSource: 'System',
        deviceInfo: 'Server',
        ipAddress: 'localhost'
      };
      
      users.push(roelGmailAdmin);
      localStorage.setItem('vip_users', JSON.stringify(users));
    } else if (!existingRoelGmail.isAdmin) {
      // Make sure the existing user is an admin
      existingRoelGmail.isAdmin = true;
      localStorage.setItem('vip_users', JSON.stringify(users));
    }
    
    // Initialize game files if not exists
    if (!localStorage.getItem('vip_game_files')) {
      localStorage.setItem('vip_game_files', JSON.stringify([]));
    }
  }
};

export const saveUser = async (userData: Omit<User, 'registrationDate' | 'racingCredits' | 'accountBalance' | 'isAdmin' | 'stats' | 'passwordHash'> & { password: string }) => {
  const users = getUsers();
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }
  
  // Hash the password
  const passwordHash = await hashPassword(userData.password);
  
  // Get device and location info
  const deviceInfo = `${navigator.platform} ${navigator.userAgent.split(' ')[0]}`;
  const registrationSource = window.location.href;
  
  const newUser: User = {
    ...userData,
    passwordHash, // Store hashed password
    registrationDate: new Date().toISOString(),
    racingCredits: 0,
    accountBalance: 0,
    isAdmin: false,
    isOnline: false,
    lastActive: new Date().toISOString(),
    currentSimulator: null,
    isStreaming: false,
    currentGame: '',
    status: 'offline',
    statusMessage: '',
    spotifyData: {
      connected: false
    },
    socialAccounts: {},
    stats: {
      totalRaces: 0,
      bestLapTime: '--:--',
      rank: users.length + 1,
      wins: 0,
      podiums: 0
    },
    registrationSource,
    deviceInfo,
    ipAddress: 'Unknown' // In a real app, this would be determined server-side
  };
  
  users.push(newUser);
  localStorage.setItem('vip_users', JSON.stringify(users));
  
  // Add admin notification
  addAdminNotification({
    type: 'new_registration',
    title: 'New User Registration',
    message: `${newUser.fullName} has registered for VIP Edge Racing`,
    data: {
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      state: newUser.state,
      registrationSource: newUser.registrationSource,
      deviceInfo: newUser.deviceInfo
    }
  });
};

export const findUser = async (email: string, password: string): Promise<User | null> => {
  const users = getUsers();
  const user = users.find(user => user.email === email);
  
  if (!user) {
    return null;
  }
  
  // Verify password against hash
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  
  return isValidPassword ? user : null;
};

export const emailExists = (email: string): boolean => {
  const users = getUsers();
  return users.some(user => user.email === email);
};

export const saveSession = (user: User) => {
  // Update user's online status
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === user.email);
  if (userIndex !== -1) {
    users[userIndex].isOnline = true;
    users[userIndex].lastActive = new Date().toISOString();
    localStorage.setItem('vip_users', JSON.stringify(users));
  }
  
  localStorage.setItem('vip_session', JSON.stringify(user));
};

export const getSession = (): User | null => {
  const session = localStorage.getItem('vip_session');
  if (!session) return null;
  
  // Get the latest user data
  const user = JSON.parse(session);
  const users = getUsers();
  const currentUser = users.find(u => u.email === user.email);
  
  return currentUser || null;
};

export const clearSession = () => {
  const session = getSession();
  if (session) {
    // Update user's offline status
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === session.email);
    if (userIndex !== -1) {
      users[userIndex].isOnline = false;
      users[userIndex].lastActive = new Date().toISOString();
      localStorage.setItem('vip_users', JSON.stringify(users));
    }
  }
  
  localStorage.removeItem('vip_session');
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === updatedUser.email);
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem('vip_users', JSON.stringify(users));
    
    // Update session if it's the current user
    const session = getSession();
    if (session && session.email === updatedUser.email) {
      localStorage.setItem('vip_session', JSON.stringify(updatedUser));
    }
  }
};

export const resetUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex !== -1) {
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }
    
    // Hash the new password
    users[userIndex].passwordHash = await hashPassword(newPassword);
    localStorage.setItem('vip_users', JSON.stringify(users));
    
    // Add admin notification
    addAdminNotification({
      type: 'password_reset',
      title: 'Password Reset',
      message: `Password reset for ${email}`,
      data: {
        email: email,
        resetTime: new Date().toISOString()
      }
    });
    
    return true;
  }
  
  return false;
};

export const formatCreditsDisplay = (credits: number): string => {
  if (credits >= 60) {
    const hours = Math.floor(credits / 60);
    const minutes = credits % 60;
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }
  return `${credits}m`;
};

export const addCreditsAndBalance = (userEmail: string, packageData: any): Transaction => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === userEmail);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const user = users[userIndex];
  const credits = packageData.credits || 0;
  const amount = packageData.price || 0;
  
  // Update user credits and balance
  user.racingCredits = (user.racingCredits || 0) + credits;
  user.accountBalance = (user.accountBalance || 0) + amount;
  
  // Handle VIP membership
  if (packageData.id === 'vip') {
    user.vipMembership = {
      active: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      discount: 25
    };
  }
  
  // Save updated user
  users[userIndex] = user;
  localStorage.setItem('vip_users', JSON.stringify(users));
  
  // Create transaction record
  const transaction: Transaction = {
    id: Date.now().toString(),
    userId: userEmail,
    type: 'purchase',
    packageName: packageData.name,
    description: `Purchased ${packageData.name} - ${packageData.description}`,
    amount: amount,
    credits: credits,
    date: new Date().toISOString()
  };
  
  // Save transaction
  const transactions = getUserTransactions(userEmail);
  transactions.push(transaction);
  localStorage.setItem(`vip_transactions_${userEmail}`, JSON.stringify(transactions));
  
  // Add admin notification
  addAdminNotification({
    type: 'purchase',
    title: 'New Package Purchase',
    message: `${user.fullName} purchased ${packageData.name}`,
    data: {
      email: userEmail,
      package: packageData,
      amount: amount,
      credits: credits
    }
  });
  
  return transaction;
};

export const getUserTransactions = (userEmail: string): Transaction[] => {
  const transactions = localStorage.getItem(`vip_transactions_${userEmail}`);
  return transactions ? JSON.parse(transactions) : [];
};

export const getSimulators = (): Simulator[] => {
  const simulators = localStorage.getItem('vip_simulators');
  return simulators ? JSON.parse(simulators) : [];
};

export const updateUserStatus = (email: string, status: 'online' | 'away' | 'busy' | 'offline', statusMessage?: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex].status = status;
    users[userIndex].statusMessage = statusMessage || '';
    users[userIndex].lastActive = new Date().toISOString();
    localStorage.setItem('vip_users', JSON.stringify(users));
  }
};

export const connectSpotify = async (email: string): Promise<boolean> => {
  // Simulate Spotify OAuth flow
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        users[userIndex].spotifyData = {
          connected: true,
          currentTrack: {
            name: "Racing Heartbeat",
            artist: "Electronic Motorsport",
            album: "Speed & Sound",
            imageUrl: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
            isPlaying: true,
            duration: 180000, // 3 minutes
            progress: 45000   // 45 seconds
          }
        };
        localStorage.setItem('vip_users', JSON.stringify(users));
        resolve(true);
      } else {
        resolve(false);
      }
    }, 1000);
  });
};

export const disconnectSpotify = (email: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex].spotifyData = {
      connected: false
    };
    localStorage.setItem('vip_users', JSON.stringify(users));
  }
};

// Community Posts
export const getCommunityPosts = (): CommunityPost[] => {
  const posts = localStorage.getItem('vip_community_posts');
  return posts ? JSON.parse(posts) : [];
};

export const addCommunityPost = (postData: Omit<CommunityPost, 'id' | 'likes' | 'likedBy' | 'shares' | 'sharedBy' | 'comments' | 'createdAt'>) => {
  const posts = getCommunityPosts();
  const newPost: CommunityPost = {
    ...postData,
    id: Date.now().toString(),
    likes: 0,
    likedBy: [],
    shares: 0,
    sharedBy: [],
    comments: [],
    createdAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  localStorage.setItem('vip_community_posts', JSON.stringify(posts));
  return newPost;
};

export const likeCommunityPost = (postId: string, userId: string) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    const isLiked = post.likedBy.includes(userId);
    
    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
  }
};

export const shareCommunityPost = (postId: string, userId: string) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    if (!post.sharedBy.includes(userId)) {
      post.sharedBy.push(userId);
      post.shares += 1;
      localStorage.setItem('vip_community_posts', JSON.stringify(posts));
    }
  }
};

export const addCommentToCommunityPost = (postId: string, commentData: Omit<Comment, 'id' | 'likes' | 'likedBy' | 'replies' | 'createdAt'>) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    if (!post.comments) post.comments = [];
    
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
  }
};

export const addReplyToComment = (postId: string, commentId: string, replyData: Omit<Comment, 'id' | 'likes' | 'likedBy' | 'replies' | 'createdAt'>) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    if (post.comments) {
      const commentIndex = post.comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = post.comments[commentIndex];
        if (!comment.replies) comment.replies = [];
        
        const newReply: Comment = {
          ...replyData,
          id: Date.now().toString(),
          likes: 0,
          likedBy: [],
          replies: [],
          createdAt: new Date().toISOString()
        };
        
        comment.replies.push(newReply);
        localStorage.setItem('vip_community_posts', JSON.stringify(posts));
      }
    }
  }
};

export const likeComment = (postId: string, commentId: string, userId: string) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    const post = posts[postIndex];
    if (post.comments) {
      const findAndLikeComment = (comments: Comment[]): boolean => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            const isLiked = comment.likedBy.includes(userId);
            if (isLiked) {
              comment.likedBy = comment.likedBy.filter(id => id !== userId);
              comment.likes = Math.max(0, comment.likes - 1);
            } else {
              comment.likedBy.push(userId);
              comment.likes += 1;
            }
            return true;
          }
          if (comment.replies && findAndLikeComment(comment.replies)) {
            return true;
          }
        }
        return false;
      };
      
      if (findAndLikeComment(post.comments)) {
        localStorage.setItem('vip_community_posts', JSON.stringify(posts));
      }
    }
  }
};

export const markNotificationAsRead = (notificationId: string) => {
  const notifications = getAdminNotifications();
  const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    localStorage.setItem('vip_admin_notifications', JSON.stringify(notifications));
  }
};

export const getUnreadNotificationCount = (): number => {
  const notifications = getAdminNotifications();
  return notifications.filter((n: any) => !n.read).length;
};

// Post Reports
export const reportPost = (postId: string, reporterId: string, reason: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other', description: string) => {
  const reports = getPostReports();
  const posts = getCommunityPosts();
  const users = getUsers();
  
  const post = posts.find(p => p.id === postId);
  const reporter = users.find(u => u.email === reporterId);
  
  if (!post || !reporter) {
    throw new Error('Post or reporter not found');
  }
  
  // Check if user already reported this post
  const existingReport = reports.find(r => r.postId === postId && r.reporterId === reporterId);
  if (existingReport) {
    throw new Error('You have already reported this post');
  }
  
  const newReport: PostReport = {
    id: Date.now().toString(),
    postId,
    reporterId,
    reporterName: reporter.fullName,
    reason,
    description,
    timestamp: new Date().toISOString(),
    status: 'pending',
    post
  };
  
  reports.push(newReport);
  localStorage.setItem('vip_post_reports', JSON.stringify(reports));
  
  // Add to post's reported list
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    if (!posts[postIndex].reportedBy) posts[postIndex].reportedBy = [];
    posts[postIndex].reportedBy!.push(reporterId);
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
  }
  
  // Add admin notification
  addAdminNotification({
    type: 'post_report',
    title: 'New Content Report',
    message: `${reporter.fullName} reported a post for ${reason}`,
    data: {
      postId,
      reporterId,
      reason,
      description
    }
  });
};

export const getPostReports = (): PostReport[] => {
  const reports = localStorage.getItem('vip_post_reports');
  return reports ? JSON.parse(reports) : [];
};

export const updatePostReport = (reportId: string, updates: Partial<PostReport>) => {
  const reports = getPostReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex !== -1) {
    reports[reportIndex] = { ...reports[reportIndex], ...updates };
    localStorage.setItem('vip_post_reports', JSON.stringify(reports));
  }
};

export const hidePost = (postId: string, hidden: boolean) => {
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    posts[postIndex].isHidden = hidden;
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
  }
};

export const deleteCommunityPost = (postId: string, adminEmail: string): boolean => {
  const users = getUsers();
  const admin = users.find(u => u.email === adminEmail && u.isAdmin);
  
  if (!admin) {
    return false; // Only admins can delete posts
  }
  
  const posts = getCommunityPosts();
  const filteredPosts = posts.filter(p => p.id !== postId);
  
  if (filteredPosts.length !== posts.length) {
    localStorage.setItem('vip_community_posts', JSON.stringify(filteredPosts));
    return true;
  }
  
  return false;
};

// Chat Messages
export const getChatMessages = (): ChatMessage[] => {
  const messages = localStorage.getItem('vip_chat_messages');
  return messages ? JSON.parse(messages) : [];
};

export const addChatMessage = (messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
  const messages = getChatMessages();
  const newMessage: ChatMessage = {
    ...messageData,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  localStorage.setItem('vip_chat_messages', JSON.stringify(messages));
  
  // Add admin notification for non-AI messages
  if (!newMessage.isAI) {
    addAdminNotification({
      type: 'chat_message',
      title: `New ${newMessage.type} chat message`,
      message: `${newMessage.userName}: ${newMessage.message.substring(0, 50)}${newMessage.message.length > 50 ? '...' : ''}`,
      data: {
        messageId: newMessage.id,
        type: newMessage.type,
        userId: newMessage.userId
      }
    });
  }
  
  return newMessage;
};

export const generateAIResponse = (userMessage: string, chatType: 'support' | 'report' | 'general', relatedPostId?: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Support responses
  if (chatType === 'support') {
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('package')) {
      return "Our racing packages start at $30 for TrackPass Basic (30 minutes, 1 driver) and go up to $99.99 for TrackPass Elite (30 minutes, 4 drivers with premium features). We also offer VIP Membership at $49.99/month which includes 25% discount on all sessions plus 30 minutes of racing credits. Would you like more details about any specific package?";
    }
    
    if (lowerMessage.includes('hour') || lowerMessage.includes('time') || lowerMessage.includes('open')) {
      return "VIP SIM RACING is open Monday-Thursday 4PM-10PM, Friday-Saturday 12PM-12AM, and Sunday 12PM-10PM. We recommend booking in advance, especially for weekends. VIP members get priority booking access. Would you like help making a reservation?";
    }
    
    if (lowerMessage.includes('vip') || lowerMessage.includes('membership')) {
      return "VIP Membership ($49.99/month) includes: 25% discount on all sessions, 30 minutes of racing credits included monthly, 4 guest passes per month, 2 free entries to exclusive events, exclusive merch drops, priority booking, and VIP leaderboard recognition. It's our best value for regular racers! Would you like to sign up?";
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('appointment')) {
      return "You can book sessions directly through your dashboard after purchasing racing credits. We have 8 state-of-the-art simulators available. For immediate booking, call us at (832) 490-4304 or email roel@vipsimracing.com. What time works best for you?";
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
      return "VIP SIM RACING is located in the Houston, Texas area. For the exact address and directions, please contact us at (832) 490-4304 or roel@vipsimracing.com. We're easily accessible and have parking available for all guests.";
    }
    
    if (lowerMessage.includes('game') || lowerMessage.includes('simulator') || lowerMessage.includes('software')) {
      return "We feature professional racing simulators with games including Assetto Corsa Competizione, iRacing, F1 24, Gran Turismo 7, DiRT Rally 2.0, Forza Motorsport, rFactor 2, Automobilista 2, Project CARS 3, BeamNG.drive, Wreckfest, and our new Drift game. All simulators have force feedback steering wheels, professional pedals, and triple monitor setups for maximum immersion. Which racing game interests you most?";
    }
    
    return "I'm here to help with any questions about VIP SIM RACING! I can assist with information about our packages, pricing, hours, VIP membership, booking, location, and our racing simulators. You can also contact us directly at (832) 490-4304 or roel@vipsimracing.com. What would you like to know?";
  }
  
  // Report responses
  if (chatType === 'report') {
    if (lowerMessage.includes('spam')) {
      return "Thank you for reporting spam content. Our moderation team takes spam seriously as it disrupts the community experience. Your report has been forwarded to our moderators who will review the content within 24 hours. We appreciate you helping keep VIP Edge Racing a quality community space.";
    }
    
    if (lowerMessage.includes('inappropriate') || lowerMessage.includes('offensive')) {
      return "Thank you for reporting inappropriate content. We have strict community guidelines to ensure VIP SIM RACING remains welcoming for all members. Your report is being reviewed by our moderation team and appropriate action will be taken if the content violates our policies. We appreciate your vigilance in maintaining our community standards.";
    }
    
    if (lowerMessage.includes('harassment') || lowerMessage.includes('bullying')) {
      return "Thank you for reporting harassment. We have zero tolerance for harassment or bullying in our community. Your report has been escalated to our senior moderation team for immediate review. If you feel unsafe or need immediate assistance, please also contact us directly at (832) 490-4304. We're committed to maintaining a safe environment for all members.";
    }
    
    return "Thank you for your report. Our moderation team will review the content you've reported and take appropriate action according to our community guidelines. All reports are taken seriously and reviewed within 24 hours. Is there anything specific about this content that you'd like to highlight for our moderators?";
  }
  
  // General responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! Welcome to VIP SIM RACING! I'm here to help you with any questions about our racing simulators, packages, or services. Whether you're new to sim racing or a seasoned pro, we have something for everyone. What can I help you with today?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I'm here to help! I can assist you with information about our racing packages, VIP membership, facility hours, booking sessions, our racing simulators and games, pricing, and general questions about VIP SIM RACING. I can also help you report content or get support. What do you need help with?";
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're very welcome! It's my pleasure to help. If you have any other questions about VIP Edge Racing, feel free to ask anytime. We're here to make your racing experience amazing! 🏁";
  }
  
  return "Thanks for reaching out! I can help you with questions about VIP SIM RACING including our packages, pricing, hours, VIP membership, booking, and our racing simulators. For immediate assistance, you can also call us at (832) 490-4304 or email roel@vipsimracing.com. What would you like to know?";
};

// Call initialization at the end of the file
initializeStorage();