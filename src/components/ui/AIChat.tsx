import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, AlertTriangle, HelpCircle, Minimize2, Maximize2 } from 'lucide-react';
import { getChatMessages, addChatMessage, generateAIResponse, ChatMessage } from '../../utils/userStorage';
import Button from './Button';
import Input from './Input';

interface AIChatProps {
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'support' | 'report' | 'general';
  relatedPostId?: string;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export default function AIChat({ 
  currentUser, 
  isOpen, 
  onClose, 
  initialType = 'general',
  relatedPostId,
  onMinimize,
  isMinimized = false
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatType, setChatType] = useState<'support' | 'report' | 'general'>(initialType);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Load existing messages for this user
      const allMessages = getChatMessages();
      const userMessages = allMessages.filter(m => m.userId === currentUser.email);
      setMessages(userMessages);
      
      // Add welcome message if no previous messages
      if (userMessages.length === 0) {
        const welcomeMessage = getWelcomeMessage();
        const aiMessage = addChatMessage({
          userId: currentUser.email,
          userName: 'VIP Edge AI Assistant',
          message: welcomeMessage,
          isAI: true,
          type: chatType,
          relatedPostId
        });
        setMessages([aiMessage]);
      }
      
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, currentUser.email, chatType, relatedPostId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = () => {
    switch (chatType) {
      case 'report':
        return "Hi! I'm here to help you report content that violates our community guidelines. Please describe what you'd like to report and I'll make sure it gets to our moderation team immediately.";
      case 'support':
        return "Hello! I'm the VIP Edge AI Assistant. I can help you with questions about our racing packages, booking, VIP membership, facility hours, and policies. How can I assist you today?";
      default:
        return "Hi there! I'm your VIP Edge AI Assistant. I'm here to help with any questions about our racing simulators, packages, or services. What would you like to know?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = addChatMessage({
      userId: currentUser.email,
      userName: currentUser.fullName,
      message: inputMessage,
      isAI: false,
      type: chatType,
      relatedPostId
    });

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, chatType, relatedPostId);
      const aiMessage = addChatMessage({
        userId: currentUser.email,
        userName: 'VIP Edge AI Assistant',
        message: aiResponse,
        isAI: true,
        type: chatType,
        relatedPostId
      });

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Simulate thinking time
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatIcon = () => {
    switch (chatType) {
      case 'report':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'support':
        return <HelpCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getChatTitle = () => {
    switch (chatType) {
      case 'report':
        return 'Report Content';
      case 'support':
        return 'Support Chat';
      default:
        return 'AI Assistant';
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMinimize}
          className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 shadow-lg"
        >
          <div className="flex items-center space-x-1">
            {getChatIcon()}
            <span className="text-xs">Chat</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700/50 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          {getChatIcon()}
          <h3 className="font-semibold text-white">{getChatTitle()}</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          {onMinimize && (
            <Button variant="ghost" size="sm" onClick={onMinimize} className="p-1">
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Type Selector */}
      <div className="flex p-2 space-x-1 border-b border-slate-700/50">
        <button
          onClick={() => setChatType('general')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            chatType === 'general'
              ? 'bg-green-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setChatType('support')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            chatType === 'support'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Support
        </button>
        <button
          onClick={() => setChatType('report')}
          className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
            chatType === 'report'
              ? 'bg-red-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Report
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isAI
                  ? 'bg-slate-700/50 text-slate-200'
                  : 'bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {message.isAI ? (
                  <Bot className="w-4 h-4 text-green-400" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {message.isAI ? 'AI Assistant' : 'You'}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{message.message}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-slate-200">AI Assistant</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${chatType === 'report' ? 'reporting content' : chatType === 'support' ? 'our services' : 'anything'}...`}
            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {chatType === 'report' && (
          <p className="text-xs text-slate-500 mt-2">
            Reports are sent directly to our moderation team for review.
          </p>
        )}
      </div>
    </div>
  );
}