import React, { useState, useEffect } from 'react';
import { Globe, Plus, Heart, Share2, MessageCircle, Flag, Camera, Video, Eye, EyeOff, Trash2, Monitor, CheckCircle, XCircle, Clock } from 'lucide-react';
import { 
  getCommunityPosts, 
  addCommunityPost, 
  likeCommunityPost, 
  shareCommunityPost, 
  addCommentToCommunityPost,
  reportPost,
  getUsers,
  User as UserType,
  CommunityPost 
} from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ImageDropZone from '../ui/ImageDropZone';

interface CommunityHubProps {
  currentUser: UserType;
}

interface ScreenShareRequest {
  id: string;
  userId: string;
  userName: string;
  simulatorId: number;
  game: string;
  status: 'pending' | 'approved' | 'denied';
  requestTime: string;
  adminNotes?: string;
}

export default function CommunityHub({ currentUser }: CommunityHubProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'share' | 'live'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newPost, setNewPost] = useState({
    type: 'screenshot' as 'screenshot' | 'video' | 'lap_record' | 'highlight',
    title: '',
    description: '',
    mediaUrl: '',
    game: '',
    track: '',
    lapTime: '',
    achievement: '',
    tags: [] as string[],
    isPublic: true
  });
  const [reportData, setReportData] = useState({
    reason: 'spam' as 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other',
    description: ''
  });
  const [screenShareRequests, setScreenShareRequests] = useState<ScreenShareRequest[]>([]);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [screenShareData, setScreenShareData] = useState({
    simulatorId: 1,
    game: ''
  });

  useEffect(() => {
    setPosts(getCommunityPosts().filter(p => !p.isHidden));
    setUsers(getUsers());
    loadScreenShareRequests();
  }, []);

  const loadScreenShareRequests = () => {
    const requests = localStorage.getItem('screen_share_requests');
    setScreenShareRequests(requests ? JSON.parse(requests) : []);
  };

  const saveScreenShareRequests = (requests: ScreenShareRequest[]) => {
    localStorage.setItem('screen_share_requests', JSON.stringify(requests));
    setScreenShareRequests(requests);
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim()) return;

    const post = addCommunityPost({
      userId: currentUser.email,
      type: newPost.type,
      title: newPost.title,
      description: newPost.description,
      mediaUrl: newPost.mediaUrl,
      game: newPost.game,
      track: newPost.track,
      lapTime: newPost.lapTime,
      achievement: newPost.achievement,
      tags: newPost.tags,
      isPublic: newPost.isPublic
    });

    setPosts([post, ...posts]);
    setShowCreatePost(false);
    setNewPost({
      type: 'screenshot',
      title: '',
      description: '',
      mediaUrl: '',
      game: '',
      track: '',
      lapTime: '',
      achievement: '',
      tags: [],
      isPublic: true
    });
  };

  const handleLike = (postId: string) => {
    likeCommunityPost(postId, currentUser.email);
    setPosts(getCommunityPosts().filter(p => !p.isHidden));
  };

  const handleShare = (postId: string) => {
    shareCommunityPost(postId, currentUser.email);
    setPosts(getCommunityPosts().filter(p => !p.isHidden));
  };

  const handleReport = () => {
    if (!selectedPost || !reportData.description.trim()) return;

    try {
      reportPost(selectedPost.id, currentUser.email, reportData.reason, reportData.description);
      setShowReportModal(false);
      setSelectedPost(null);
      setReportData({ reason: 'spam', description: '' });
      alert('Report submitted successfully. Our moderation team will review it shortly.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleScreenShareRequest = () => {
    if (!screenShareData.game.trim()) return;

    const requests = screenShareRequests;
    const newRequest: ScreenShareRequest = {
      id: Date.now().toString(),
      userId: currentUser.email,
      userName: currentUser.fullName,
      simulatorId: screenShareData.simulatorId,
      game: screenShareData.game,
      status: 'pending',
      requestTime: new Date().toISOString()
    };

    requests.push(newRequest);
    saveScreenShareRequests(requests);
    setShowScreenShareModal(false);
    setScreenShareData({ simulatorId: 1, game: '' });
    alert('Screen share request submitted! Admins will review your request shortly.');
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.email === userId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const approvedScreenShares = screenShareRequests.filter(r => r.status === 'approved');
  const userPendingRequest = screenShareRequests.find(r => r.userId === currentUser.email && r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Community Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Community Hub</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'feed' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('feed')}
              >
                Community Feed
              </Button>
              <Button
                variant={activeTab === 'share' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('share')}
              >
                Share Content
              </Button>
              <Button
                variant={activeTab === 'live' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('live')}
                className="relative"
              >
                Live Streams
                {approvedScreenShares.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {approvedScreenShares.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post Button */}
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={() => setShowCreatePost(true)}
                icon={Plus}
                className="w-full"
              >
                Share Your Racing Experience
              </Button>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Welcome to the Community!</h3>
                  <p className="text-slate-400 mb-6">
                    Be the first to share your racing screenshots, videos, and achievements.
                  </p>
                  <Button onClick={() => setShowCreatePost(true)} icon={Plus}>
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => {
                const author = getUserById(post.userId);
                const isLiked = post.likedBy.includes(currentUser.email);
                const isShared = post.sharedBy.includes(currentUser.email);

                return (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600">
                            {author?.profilePicture ? (
                              <img src={author.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Globe className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{author?.fullName || 'Unknown User'}</p>
                            <p className="text-sm text-slate-400">{formatTimeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setShowReportModal(true);
                          }}
                          icon={Flag}
                        >
                          Report
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">{post.title}</h3>
                        {post.description && (
                          <p className="text-slate-300">{post.description}</p>
                        )}

                        {/* Media */}
                        {post.mediaUrl && (
                          <div className="rounded-lg overflow-hidden">
                            {post.type === 'video' ? (
                              <video 
                                src={post.mediaUrl} 
                                controls 
                                className="w-full h-auto max-h-96"
                              />
                            ) : (
                              <img 
                                src={post.mediaUrl} 
                                alt={post.title}
                                className="w-full h-auto max-h-96 object-cover"
                              />
                            )}
                          </div>
                        )}

                        {/* Post Details */}
                        <div className="flex flex-wrap gap-2 text-sm">
                          {post.game && (
                            <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">
                              🎮 {post.game}
                            </span>
                          )}
                          {post.track && (
                            <span className="bg-green-500/20 px-2 py-1 rounded text-green-300">
                              🏁 {post.track}
                            </span>
                          )}
                          {post.lapTime && (
                            <span className="bg-yellow-500/20 px-2 py-1 rounded text-yellow-300">
                              ⏱️ {post.lapTime}
                            </span>
                          )}
                          {post.achievement && (
                            <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">
                              🏆 {post.achievement}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={isLiked ? 'text-red-400' : 'text-slate-400'}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(post.id)}
                            className={isShared ? 'text-blue-400' : 'text-slate-400'}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments?.length || 0}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Share Your Racing Content</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'screenshot', label: 'Screenshot', icon: Camera },
                  { type: 'video', label: 'Video', icon: Video },
                  { type: 'lap_record', label: 'Lap Record', icon: Clock },
                  { type: 'highlight', label: 'Highlight', icon: Eye }
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={newPost.type === type ? 'primary' : 'outline'}
                    onClick={() => setNewPost(prev => ({ ...prev, type: type as any }))}
                    className="h-20 flex-col space-y-2"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>

              <Input
                label="Title"
                placeholder="Give your post a catchy title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  placeholder="Tell us about your racing experience..."
                  value={newPost.description}
                  onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <ImageDropZone
                onImageSelect={(imageData) => setNewPost(prev => ({ ...prev, mediaUrl: imageData }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Game"
                  placeholder="e.g., Assetto Corsa"
                  value={newPost.game}
                  onChange={(e) => setNewPost(prev => ({ ...prev, game: e.target.value }))}
                />
                <Input
                  label="Track"
                  placeholder="e.g., Silverstone"
                  value={newPost.track}
                  onChange={(e) => setNewPost(prev => ({ ...prev, track: e.target.value }))}
                />
              </div>

              {newPost.type === 'lap_record' && (
                <Input
                  label="Lap Time"
                  placeholder="e.g., 1:23.456"
                  value={newPost.lapTime}
                  onChange={(e) => setNewPost(prev => ({ ...prev, lapTime: e.target.value }))}
                />
              )}

              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.title.trim()}
                className="w-full"
                icon={Plus}
              >
                Share Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Screen Share Request */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Share Your Racing Screen</h3>
                {!userPendingRequest && (
                  <Button
                    onClick={() => setShowScreenShareModal(true)}
                    icon={Monitor}
                    size="sm"
                  >
                    Request Screen Share
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userPendingRequest ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Screen Share Request Pending</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    Your request to share Simulator {userPendingRequest.simulatorId} while playing {userPendingRequest.game} is being reviewed by admins.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Share Your Racing Action</h4>
                  <p className="text-slate-400 mb-4">
                    Request to share your racing simulator screen with the community. 
                    Admins will review and approve your request.
                  </p>
                  <Button
                    onClick={() => setShowScreenShareModal(true)}
                    icon={Monitor}
                  >
                    Request Screen Share
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Streams */}
          {approvedScreenShares.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedScreenShares.map((stream) => (
                <Card key={stream.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600">
                          <div className="w-full h-full flex items-center justify-center">
                            <Globe className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{stream.userName}</p>
                          <p className="text-sm text-slate-400">Simulator {stream.simulatorId}</p>
                        </div>
                      </div>
                      <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 font-bold">
                        🔴 LIVE
                      </div>
                    </div>

                    <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Live Stream</p>
                        <p className="text-white font-semibold">{stream.game}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      Watch Stream
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Live Streams</h3>
                <p className="text-slate-400">
                  No one is currently streaming their racing session. 
                  Be the first to share your racing action!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        title="Share Your Racing Content"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'screenshot', label: 'Screenshot', icon: Camera },
              { type: 'video', label: 'Video', icon: Video },
              { type: 'lap_record', label: 'Lap Record', icon: Clock },
              { type: 'highlight', label: 'Highlight', icon: Eye }
            ].map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant={newPost.type === type ? 'primary' : 'outline'}
                onClick={() => setNewPost(prev => ({ ...prev, type: type as any }))}
                className="h-20 flex-col space-y-2"
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>

          <Input
            label="Title"
            placeholder="Give your post a catchy title..."
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              placeholder="Tell us about your racing experience..."
              value={newPost.description}
              onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <ImageDropZone
            onImageSelect={(imageData) => setNewPost(prev => ({ ...prev, mediaUrl: imageData }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Game"
              placeholder="e.g., Assetto Corsa"
              value={newPost.game}
              onChange={(e) => setNewPost(prev => ({ ...prev, game: e.target.value }))}
            />
            <Input
              label="Track"
              placeholder="e.g., Silverstone"
              value={newPost.track}
              onChange={(e) => setNewPost(prev => ({ ...prev, track: e.target.value }))}
            />
          </div>

          {newPost.type === 'lap_record' && (
            <Input
              label="Lap Time"
              placeholder="e.g., 1:23.456"
              value={newPost.lapTime}
              onChange={(e) => setNewPost(prev => ({ ...prev, lapTime: e.target.value }))}
            />
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.title.trim()}
              className="flex-1"
              icon={Plus}
            >
              Share Post
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCreatePost(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Screen Share Request Modal */}
      <Modal
        isOpen={showScreenShareModal}
        onClose={() => setShowScreenShareModal(false)}
        title="Request Screen Share"
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Screen Share Guidelines</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Keep content family-friendly and appropriate</li>
              <li>• No offensive language or behavior</li>
              <li>• Focus on racing content and gameplay</li>
              <li>• Admins may end streams that violate guidelines</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Simulator</label>
            <select
              value={screenShareData.simulatorId}
              onChange={(e) => setScreenShareData(prev => ({ ...prev, simulatorId: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Simulator {i + 1}</option>
              ))}
            </select>
          </div>

          <Input
            label="Game"
            placeholder="What game will you be playing?"
            value={screenShareData.game}
            onChange={(e) => setScreenShareData(prev => ({ ...prev, game: e.target.value }))}
          />

          <div className="flex space-x-3">
            <Button 
              onClick={handleScreenShareRequest}
              disabled={!screenShareData.game.trim()}
              className="flex-1"
              icon={Monitor}
            >
              Submit Request
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowScreenShareModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedPost(null);
          setReportData({ reason: 'spam', description: '' });
        }}
        title="Report Content"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Reason for Report</label>
            <select
              value={reportData.reason}
              onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value as any }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment</option>
              <option value="copyright">Copyright Violation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              placeholder="Please provide details about why you're reporting this content..."
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleReport}
              disabled={!reportData.description.trim()}
              className="flex-1"
              icon={Flag}
            >
              Submit Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowReportModal(false);
                setSelectedPost(null);
                setReportData({ reason: 'spam', description: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}