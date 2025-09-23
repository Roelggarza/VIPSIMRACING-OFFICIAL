export interface LoginAttempt {
  email: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  location?: string;
  deviceFingerprint: string;
}

export interface AnomalyFlags {
  newDevice: boolean;
  suspiciousIP: boolean;
  multipleFailedAttempts: boolean;
  unusualLocation: boolean;
  rapidAttempts: boolean;
}

/**
 * Generate device fingerprint based on browser characteristics
 * @returns string - Device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Get approximate location from IP (simulation)
 * @param ipAddress - IP address
 * @returns Promise<string> - Location string
 */
export const getLocationFromIP = async (ipAddress: string): Promise<string> => {
  // In a real application, you would use a service like MaxMind GeoIP
  // For demo purposes, we'll simulate different locations
  const locations = [
    'Houston, TX, US',
    'Dallas, TX, US',
    'Austin, TX, US',
    'San Antonio, TX, US',
    'Unknown Location'
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a consistent location for the same IP
  const hash = ipAddress.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
  return locations[hash % locations.length];
};

/**
 * Record login attempt
 * @param email - User email
 * @param success - Whether login was successful
 * @param ipAddress - IP address (simulated)
 */
export const recordLoginAttempt = async (email: string, success: boolean, ipAddress: string = 'unknown') => {
  const attempt: LoginAttempt = {
    email,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent: navigator.userAgent,
    success,
    location: await getLocationFromIP(ipAddress),
    deviceFingerprint: generateDeviceFingerprint()
  };
  
  const attempts = getLoginAttempts(email);
  attempts.push(attempt);
  
  // Keep only last 50 attempts
  if (attempts.length > 50) {
    attempts.splice(0, attempts.length - 50);
  }
  
  localStorage.setItem(`login_attempts_${email}`, JSON.stringify(attempts));
};

/**
 * Get login attempts for user
 * @param email - User email
 * @returns LoginAttempt[] - Array of login attempts
 */
export const getLoginAttempts = (email: string): LoginAttempt[] => {
  const attempts = localStorage.getItem(`login_attempts_${email}`);
  return attempts ? JSON.parse(attempts) : [];
};

/**
 * Detect anomalies in login attempt
 * @param email - User email
 * @param currentIP - Current IP address
 * @param currentDevice - Current device fingerprint
 * @returns AnomalyFlags - Detected anomalies
 */
export const detectAnomalies = (email: string, currentIP: string, currentDevice: string): AnomalyFlags => {
  const attempts = getLoginAttempts(email);
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Check for new device
  const knownDevices = [...new Set(attempts.map(a => a.deviceFingerprint))];
  const newDevice = !knownDevices.includes(currentDevice);
  
  // Check for suspicious IP
  const knownIPs = [...new Set(attempts.filter(a => a.success).map(a => a.ipAddress))];
  const suspiciousIP = !knownIPs.includes(currentIP) && knownIPs.length > 0;
  
  // Check for multiple failed attempts in the last hour
  const recentFailedAttempts = attempts.filter(a => 
    !a.success && new Date(a.timestamp) > oneHourAgo
  );
  const multipleFailedAttempts = recentFailedAttempts.length >= 3;
  
  // Check for unusual location (simplified)
  const recentSuccessfulAttempts = attempts.filter(a => 
    a.success && new Date(a.timestamp) > oneDayAgo
  );
  const knownLocations = [...new Set(recentSuccessfulAttempts.map(a => a.location))];
  const unusualLocation = knownLocations.length > 0 && !knownLocations.some(loc => 
    loc?.includes('TX') // Assuming user is normally in Texas
  );
  
  // Check for rapid attempts (more than 5 in 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const rapidAttempts = attempts.filter(a => 
    new Date(a.timestamp) > fiveMinutesAgo
  ).length > 5;
  
  return {
    newDevice,
    suspiciousIP,
    multipleFailedAttempts,
    unusualLocation,
    rapidAttempts
  };
};

/**
 * Check if additional verification is required
 * @param anomalies - Detected anomalies
 * @returns boolean - True if additional verification needed
 */
export const requiresAdditionalVerification = (anomalies: AnomalyFlags): boolean => {
  // Require additional verification if any significant anomaly is detected
  return anomalies.suspiciousIP || 
         anomalies.multipleFailedAttempts || 
         anomalies.unusualLocation || 
         anomalies.rapidAttempts ||
         (anomalies.newDevice && Object.values(anomalies).filter(Boolean).length > 1);
};

/**
 * Generate simulated IP address for demo
 * @returns string - IP address
 */
export const getSimulatedIP = (): string => {
  // Generate a consistent IP based on session
  const sessionId = sessionStorage.getItem('demo_ip') || Math.random().toString();
  sessionStorage.setItem('demo_ip', sessionId);
  
  const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ip = [
    192,
    168,
    (hash % 255) + 1,
    ((hash * 7) % 255) + 1
  ].join('.');
  
  return ip;
};