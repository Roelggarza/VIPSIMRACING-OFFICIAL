import React, { useState } from 'react';
import { Edit, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { editPostWithValidation } from '../../utils/postManagement';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import ImageDropZone from './ImageDropZone';

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  userEmail: string;
  onPostUpdated: (updatedPost: any) => void;
}

export default function PostEditModal({ 
  isOpen, 
  onClose, 
  post, 
  userEmail, 
  onPostUpdated 
}: PostEditModalProps) {
  const [editData, setEditData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    mediaUrl: post?.mediaUrl || '',
    game: post?.game || '',
    track: post?.track || '',
    lapTime: post?.lapTime || '',
    achievement: post?.achievement || '',
    tags: post?.tags?.join(', ') || ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleImageSelect = (imageData: string) => {
    setEditData(prev => ({ ...prev, mediaUrl: imageData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editData.title.trim()) {
      setErrors(['Title is required']);
      return;
    }
    
    setIsLoading(true);
    setErrors([]);
    
    try {
      const updates = {
        ...editData,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      
      const result = editPostWithValidation(post.id, updates, userEmail);
      
      if (!result.success) {
        setErrors(result.errors || ['Failed to update post']);
        setIsLoading(false);
        return;
      }
      
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onPostUpdated({ ...post, ...updates });
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (error) {
      setErrors(['An error occurred while updating the post']);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Post Updated">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Post Updated Successfully!</h3>
            <p className="text-slate-300">Your changes have been saved and are now visible to the community.</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="title"
          label="Title"
          placeholder="Update your post title..."
          value={editData.title}
          onChange={handleChange}
          maxLength={100}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            placeholder="Update your post description..."
            value={editData.description}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <p className="text-xs text-slate-500">{editData.description.length}/500 characters</p>
        </div>

        {/* Media Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Media (Optional)</label>
          <ImageDropZone onImageSelect={handleImageSelect} />
          {editData.mediaUrl && (
            <div className="mt-2">
              <img 
                src={editData.mediaUrl} 
                alt="Current media"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="game"
            label="Game"
            placeholder="e.g., Assetto Corsa"
            value={editData.game}
            onChange={handleChange}
          />
          <Input
            name="track"
            label="Track"
            placeholder="e.g., Silverstone"
            value={editData.track}
            onChange={handleChange}
          />
        </div>

        {post?.type === 'lap_record' && (
          <Input
            name="lapTime"
            label="Lap Time"
            placeholder="e.g., 1:23.456"
            value={editData.lapTime}
            onChange={handleChange}
          />
        )}

        <Input
          name="tags"
          label="Tags (comma-separated)"
          placeholder="e.g., racing, silverstone, personal-best"
          value={editData.tags}
          onChange={handleChange}
        />

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Please fix the following issues:</span>
            </div>
            <ul className="text-red-300 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            type="submit"
            disabled={isLoading || !editData.title.trim()}
            className="flex-1"
            icon={Save}
          >
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}