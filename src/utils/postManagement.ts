export interface PostAuditLog {
  id: string;
  postId: string;
  action: 'created' | 'edited' | 'deleted' | 'flagged' | 'approved' | 'hidden';
  performedBy: string;
  performerName: string;
  timestamp: string;
  reason?: string;
  previousData?: any;
  newData?: any;
  ipAddress?: string;
}

/**
 * Log post management actions for audit trail
 * @param logData - Audit log data
 */
export const addPostAuditLog = (logData: Omit<PostAuditLog, 'id' | 'timestamp'>): PostAuditLog => {
  const logs = getPostAuditLogs();
  const newLog: PostAuditLog = {
    ...logData,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  logs.push(newLog);
  
  // Keep only last 1000 logs to prevent storage bloat
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('post_audit_logs', JSON.stringify(logs));
  return newLog;
};

/**
 * Get all post audit logs
 * @returns PostAuditLog[] - Array of audit logs
 */
export const getPostAuditLogs = (): PostAuditLog[] => {
  const logs = localStorage.getItem('post_audit_logs');
  return logs ? JSON.parse(logs) : [];
};

/**
 * Get audit logs for specific post
 * @param postId - Post ID to get logs for
 * @returns PostAuditLog[] - Array of audit logs for the post
 */
export const getPostAuditLogsById = (postId: string): PostAuditLog[] => {
  const logs = getPostAuditLogs();
  return logs.filter(log => log.postId === postId);
};

/**
 * Get audit logs by user
 * @param userEmail - User email to get logs for
 * @returns PostAuditLog[] - Array of audit logs by the user
 */
export const getPostAuditLogsByUser = (userEmail: string): PostAuditLog[] => {
  const logs = getPostAuditLogs();
  return logs.filter(log => log.performedBy === userEmail);
};

/**
 * Enhanced post validation with content filtering
 * @param postData - Post data to validate
 * @returns object with validation result and issues
 */
export const validatePostContent = (postData: any): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Title validation
  if (!postData.title || postData.title.trim().length < 3) {
    issues.push('Title must be at least 3 characters long');
  }
  
  if (postData.title && postData.title.length > 100) {
    issues.push('Title must be less than 100 characters');
  }
  
  // Description validation
  if (postData.description && postData.description.length > 500) {
    issues.push('Description must be less than 500 characters');
  }
  
  // Enhanced content filtering
  const inappropriateWords = [
    'spam', 'scam', 'fake', 'cheat', 'hack', 'bot', 'exploit', 
    'glitch', 'bug abuse', 'unfair', 'rigged'
  ];
  const content = `${postData.title} ${postData.description}`.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (content.includes(word)) {
      issues.push(`Content contains potentially inappropriate language: "${word}"`);
      break;
    }
  }
  
  // Media validation
  if (postData.mediaUrl) {
    try {
      new URL(postData.mediaUrl);
      
      // Check if it's a data URL (base64 image)
      if (postData.mediaUrl.startsWith('data:image/')) {
        // Validate image size (rough estimate)
        const sizeInBytes = (postData.mediaUrl.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 10) {
          issues.push('Image size must be less than 10MB');
        }
      }
    } catch {
      issues.push('Invalid media URL provided');
    }
  }
  
  // Lap time validation for lap records
  if (postData.type === 'lap_record' && postData.lapTime) {
    const lapTimeRegex = /^\d{1,2}:\d{2}\.\d{3}$/;
    if (!lapTimeRegex.test(postData.lapTime)) {
      issues.push('Lap time must be in format MM:SS.mmm (e.g., 1:23.456)');
    }
  }
  
  // Game validation
  if (postData.game && postData.game.length > 50) {
    issues.push('Game name must be less than 50 characters');
  }
  
  // Track validation
  if (postData.track && postData.track.length > 50) {
    issues.push('Track name must be less than 50 characters');
  }
  
  // Tags validation
  if (postData.tags && Array.isArray(postData.tags)) {
    if (postData.tags.length > 10) {
      issues.push('Maximum 10 tags allowed');
    }
    
    for (const tag of postData.tags) {
      if (tag.length > 20) {
        issues.push('Each tag must be less than 20 characters');
        break;
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Enhanced post creation with validation and audit logging
 * @param postData - Post data
 * @param userEmail - User creating the post
 * @returns object with success status and post data or errors
 */
export const createPostWithValidation = (postData: any, userEmail: string): { success: boolean; post?: any; errors?: string[] } => {
  const validation = validatePostContent(postData);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.issues
    };
  }
  
  // Import required functions (these would normally be imported at the top)
  const { addCommunityPost } = require('../../utils/userStorage');
  
  try {
    const post = addCommunityPost(postData);
    
    // Log the creation
    addPostAuditLog({
      postId: post.id,
      action: 'created',
      performedBy: userEmail,
      performerName: postData.userName || 'Unknown User',
      newData: post
    });
    
    return {
      success: true,
      post
    };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to create post. Please try again.']
    };
  }
};

/**
 * Edit post with validation and audit logging
 * @param postId - ID of post to edit
 * @param updates - Updates to apply
 * @param userEmail - User performing the edit
 * @returns boolean - Success status
 */
export const editPostWithValidation = (postId: string, updates: any, userEmail: string): { success: boolean; errors?: string[] } => {
  const validation = validatePostContent(updates);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.issues
    };
  }
  
  try {
    // Get current posts
    const { getCommunityPosts } = require('../../utils/userStorage');
    const posts = getCommunityPosts();
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    
    if (postIndex === -1) {
      return {
        success: false,
        errors: ['Post not found']
      };
    }
    
    const originalPost = { ...posts[postIndex] };
    
    // Check if user owns the post or is admin
    const { getUsers } = require('../../utils/userStorage');
    const users = getUsers();
    const user = users.find((u: any) => u.email === userEmail);
    
    if (originalPost.userId !== userEmail && !user?.isAdmin) {
      return {
        success: false,
        errors: ['You can only edit your own posts']
      };
    }
    
    // Apply updates
    posts[postIndex] = { ...originalPost, ...updates, editedAt: new Date().toISOString() };
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
    
    // Log the edit
    addPostAuditLog({
      postId,
      action: 'edited',
      performedBy: userEmail,
      performerName: user?.fullName || 'Unknown User',
      previousData: originalPost,
      newData: posts[postIndex]
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to edit post. Please try again.']
    };
  }
};

/**
 * Delete post with audit logging
 * @param postId - ID of post to delete
 * @param userEmail - User performing the deletion
 * @param reason - Reason for deletion
 * @returns boolean - Success status
 */
export const deletePostWithAudit = (postId: string, userEmail: string, reason?: string): { success: boolean; errors?: string[] } => {
  try {
    const { getCommunityPosts, getUsers } = require('../../utils/userStorage');
    const posts = getCommunityPosts();
    const users = getUsers();
    
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return {
        success: false,
        errors: ['Post not found']
      };
    }
    
    const post = posts[postIndex];
    const user = users.find((u: any) => u.email === userEmail);
    
    // Check permissions
    if (post.userId !== userEmail && !user?.isAdmin) {
      return {
        success: false,
        errors: ['You can only delete your own posts']
      };
    }
    
    // Remove post
    const deletedPost = posts.splice(postIndex, 1)[0];
    localStorage.setItem('vip_community_posts', JSON.stringify(posts));
    
    // Log the deletion
    addPostAuditLog({
      postId,
      action: 'deleted',
      performedBy: userEmail,
      performerName: user?.fullName || 'Unknown User',
      reason: reason || (user?.isAdmin ? 'Admin deletion' : 'User deletion'),
      previousData: deletedPost
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to delete post. Please try again.']
    };
  }
};

/**
 * Flag post for moderation
 * @param postId - ID of post to flag
 * @param userEmail - User flagging the post
 * @param reason - Reason for flagging
 * @returns boolean - Success status
 */
export const flagPostForModeration = (postId: string, userEmail: string, reason: string): boolean => {
  try {
    const { getCommunityPosts, getUsers } = require('../../utils/userStorage');
    const posts = getCommunityPosts();
    const users = getUsers();
    
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) return false;
    
    const user = users.find((u: any) => u.email === userEmail);
    
    // Add to flagged posts
    const flaggedPosts = JSON.parse(localStorage.getItem('flagged_posts') || '[]');
    const flagData = {
      postId,
      flaggedBy: userEmail,
      flaggedByName: user?.fullName || 'Unknown User',
      reason,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    flaggedPosts.push(flagData);
    localStorage.setItem('flagged_posts', JSON.stringify(flaggedPosts));
    
    // Log the flag action
    addPostAuditLog({
      postId,
      action: 'flagged',
      performedBy: userEmail,
      performerName: user?.fullName || 'Unknown User',
      reason
    });
    
    return true;
  } catch (error) {
    console.error('Failed to flag post:', error);
    return false;
  }
};

/**
 * Get flagged posts for admin review
 * @returns array of flagged posts
 */
export const getFlaggedPosts = () => {
  const flaggedPosts = localStorage.getItem('flagged_posts');
  return flaggedPosts ? JSON.parse(flaggedPosts) : [];
};

/**
 * Resolve flagged post (admin action)
 * @param flagId - ID of the flag to resolve
 * @param adminEmail - Admin resolving the flag
 * @param action - Action taken ('approved' | 'deleted' | 'hidden')
 * @param notes - Admin notes
 * @returns boolean - Success status
 */
export const resolveFlaggedPost = (flagId: string, adminEmail: string, action: 'approved' | 'deleted' | 'hidden', notes?: string): boolean => {
  try {
    const flaggedPosts = getFlaggedPosts();
    const flagIndex = flaggedPosts.findIndex((f: any) => f.id === flagId);
    
    if (flagIndex === -1) return false;
    
    const flag = flaggedPosts[flagIndex];
    flag.status = 'resolved';
    flag.resolvedBy = adminEmail;
    flag.resolvedAt = new Date().toISOString();
    flag.action = action;
    flag.adminNotes = notes;
    
    localStorage.setItem('flagged_posts', JSON.stringify(flaggedPosts));
    
    // Log the resolution
    addPostAuditLog({
      postId: flag.postId,
      action: action as any,
      performedBy: adminEmail,
      performerName: 'Admin',
      reason: `Flag resolved: ${action}`,
      newData: { adminNotes: notes }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to resolve flagged post:', error);
    return false;
  }
};