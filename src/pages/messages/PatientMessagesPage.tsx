import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { messagesService, MessageThread, Message, Recipient } from '../../services/messagesService';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';

const PatientMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:3000/messages', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connected', (data) => {
      console.log('Connected to WebSocket:', data);
    });

    socket.on('new_message', (message: Message) => {
      // If message is in current thread, add it
      if (selectedThread && message.threadId === selectedThread) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh threads to update last message
      loadThreads();
    });

    socket.on('thread_updated', (thread: MessageThread) => {
      setThreads(prev => {
        const index = prev.findIndex(t => t.threadId === thread.threadId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = thread;
          return updated;
        }
        return [thread, ...prev];
      });
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error(error.message || 'Connection error');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [selectedThread]);

  // Load threads
  const loadThreads = async () => {
    try {
      setIsLoading(true);
      const data = await messagesService.getThreads('all');
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0].threadId);
      }
    } catch (error: any) {
      toast.error('Failed to load messages');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load recipients for new message
  const loadRecipients = async () => {
    try {
      const data = await messagesService.getRecipients();
      setRecipients(data);
    } catch (error: any) {
      toast.error('Failed to load recipients');
      console.error(error);
    }
  };

  // Load messages for selected thread
  const loadMessages = async (threadId: string) => {
    try {
      const data = await messagesService.getThreadMessages(threadId);
      setMessages(data);
      // Mark as read
      await messagesService.markThreadAsRead(threadId);
      // Refresh threads to update unread count
      loadThreads();
    } catch (error: any) {
      toast.error('Failed to load messages');
      console.error(error);
    }
  };

  useEffect(() => {
    loadThreads();
    loadRecipients();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThread) return;

    const thread = threads.find(t => t.threadId === selectedThread);
    if (!thread) return;

    const recipientId = thread.participant1Id === user?.id ? thread.participant2Id : thread.participant1Id;

    try {
      setIsSending(true);
      const newMessage = await messagesService.sendMessage({
        recipientId,
        content: messageText.trim(),
        channel: 'In-App',
      });

      setMessageText('');
      setMessages(prev => [...prev, newMessage]);

      // Send via WebSocket if connected
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          recipientId,
          content: newMessage.content,
          channel: 'In-App',
        });
      }

      // Refresh threads
      loadThreads();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewMessage = async () => {
    if (!selectedRecipient) {
      toast.error('Please select a recipient');
      return;
    }

    try {
      // Get or create thread
      const thread = await messagesService.getOrCreateThread(selectedRecipient.id);
      setSelectedThread(thread.threadId);
      setShowNewMessageModal(false);
      setSelectedRecipient(null);
      loadThreads();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create thread');
      console.error(error);
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    return thread.participant1Id === user?.id ? thread.participant2 : thread.participant1;
  };

  const getUnreadCount = (thread: MessageThread) => {
    return thread.participant1Id === user?.id ? thread.unreadCount1 : thread.unreadCount2;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 168) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredRecipients = recipients.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find(t => t.threadId === selectedThread);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full bg-background-light dark:bg-background-dark overflow-hidden -mx-5 -my-5 rounded-lg shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <p className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Secure Messages</p>
          <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
            Communicate securely with your doctor and clinic staff.
          </p>
        </div>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
          <span className="truncate">New Message</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 overflow-hidden">
        {/* Left Column: Message Threads List */}
        <div className="md:col-span-1 xl:col-span-1 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Search messages..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">chat</span>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No messages yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Start a new conversation</p>
              </div>
            ) : (
              threads.map((thread) => {
                const otherParticipant = getOtherParticipant(thread);
                const unreadCount = getUnreadCount(thread);
                const isActive = selectedThread === thread.threadId;

                return (
                  <div
                    key={thread.threadId}
                    onClick={() => setSelectedThread(thread.threadId)}
                    className={`flex flex-col gap-1.5 p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-primary/5 dark:bg-primary/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-200 dark:bg-gray-700"
                            style={{
                              backgroundImage: (otherParticipant as any).doctor?.profileImage
                                ? `url("${(otherParticipant as any).doctor.profileImage}")`
                                : undefined,
                            }}
                          />
                        </div>
                        <p className="text-gray-900 dark:text-white font-bold text-sm">
                          {otherParticipant.role.name === 'Doctor' ? 'Dr. ' : ''}
                          {otherParticipant.firstName} {otherParticipant.lastName}
                        </p>
                      </div>
                      {thread.lastMessageAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatMessageTime(thread.lastMessageAt)}
                        </p>
                      )}
                    </div>
                    <div className="pl-13">
                      {thread.lastMessage && (
                        <>
                          <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">
                            {thread.lastMessage}
                          </p>
                          {unreadCount > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="size-2 bg-primary rounded-full"></span>
                              <span className="text-xs text-primary font-medium">{unreadCount} unread</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Thread View */}
        <div className="md:col-span-2 xl:col-span-3 bg-background-light dark:bg-gray-900/50 flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {messages.map((message) => {
                    const isPatient = message.senderId === user?.id;
                    const sender = isPatient ? user : (message.sender || getOtherParticipant(activeThread));

                    return (
                      <div key={message.id} className={`flex gap-4 items-start ${isPatient ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                          style={{
                            backgroundImage: isPatient
                              ? undefined
                              : ((getOtherParticipant(activeThread) as any).doctor?.profileImage
                                  ? `url("${(getOtherParticipant(activeThread) as any).doctor.profileImage}")`
                                  : undefined),
                          }}
                        />
                        <div className={`flex flex-col gap-2 ${isPatient ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-baseline gap-2 ${isPatient ? 'flex-row-reverse' : ''}`}>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {isPatient ? `${user?.firstName} ${user?.lastName} (You)` : `${sender.firstName} ${sender.lastName}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                          <div
                            className={`p-4 rounded-lg shadow-sm ${
                              isPatient
                                ? 'rounded-tr-none bg-primary text-white'
                                : 'rounded-tl-none bg-white dark:bg-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                            }`}
                          >
                            <p className={isPatient ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary text-sm resize-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="Type your message here..."
                      rows={3}
                      disabled={isSending}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !messageText.trim()}
                      className="flex items-center justify-center size-11 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                    <button className="flex items-center justify-center size-11 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20">
                      <span className="material-symbols-outlined text-xl">attach_file</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">chat</span>
                <p className="text-gray-600 dark:text-gray-400">Select a message thread to start conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Message</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select a doctor, assistant, or admin to message</p>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-background-light dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No recipients found</p>
                </div>
              ) : (
                filteredRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    onClick={() => setSelectedRecipient(recipient)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors mb-2 ${
                      selectedRecipient?.id === recipient.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 bg-gray-200 dark:bg-gray-700"
                        style={{
                          backgroundImage: recipient.profileImage ? `url("${recipient.profileImage}")` : undefined,
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {recipient.role === 'Doctor' ? 'Dr. ' : ''}
                          {recipient.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.email}</p>
                        {recipient.specialization && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{recipient.specialization}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSelectedRecipient(null);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleNewMessage}
                disabled={!selectedRecipient}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMessagesPage;
