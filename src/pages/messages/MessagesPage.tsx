import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Conversation {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientDob: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
}

interface Message {
  id: string;
  sender: 'patient' | 'doctor' | 'system';
  content: string;
  timestamp: string;
  channel: 'SMS' | 'Email' | 'In-App';
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Unread' | 'Flagged'>('Unread');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: '1',
      patientName: 'Olivia Chen',
      patientPhone: '(555) 123-4567',
      patientEmail: 'olivia.chen@example.com',
      patientDob: '05/12/1988',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_zdnXmiaJoLQMdhhDqziBwUjlz2BtljGpYwCdWHnSBGWBp0vQ_ApTbyu3qEDV6gIIyNq2ItEStgHmPoNI02y2xRk6Y7sPtE2mqj85U-J9ITXXhYOy946aZwkkOkea0W9wnjXcj3kLwDODvC-z0LArO7ppam4M2Zh2G3wkp2eU04G8iwHJTn6tSOJAw5tnToFrbdLDys5io4Sb1KjY7CK7kYHWFOKw3iQePAuWZ2PiDC25zXQkH6yOpE8j8E3c4a2pDsRw6HDgEkw',
      lastMessage: 'SMS: Ok, thank you for the reminder!',
      lastMessageTime: '10:42 AM',
      unreadCount: 1,
      isActive: true,
    },
    {
      id: '2',
      patientName: 'Benjamin Carter',
      patientPhone: '(555) 234-5678',
      patientEmail: 'benjamin.carter@example.com',
      patientDob: '03/15/1990',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDypXqXXjbEvMnTX2wsx20S69x9V2VxJK4HsehVxPB_kfZIAU4Cnecb6g-leoB7XqFtxRTp6SB1gtY0-IMZ51buUbLW8HLAk8OIeqTaUGtRUVwlbUg1SI6rzHZ54w0Qa6LQvGsJp2sgSJmVYIMpz_0vRg32UDZ_hMjbydCUthDOpQBCcDXUFPbZlS8CGbkYszG2mECA0USsr4EWoEww2Jp-2_nkzK0PdmNbWvLiwyENW3AodetZFYRtxi_YK0q83dWEH3Rh4LG0V_w',
      lastMessage: 'Email: Appointment Reminder: Your...',
      lastMessageTime: 'Yesterday',
      unreadCount: 1,
      isActive: false,
    },
    {
      id: '3',
      patientName: 'Sophia Rodriguez',
      patientPhone: '(555) 345-6789',
      patientEmail: 'sophia.rodriguez@example.com',
      patientDob: '08/22/1985',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_cvDOOxvgeQ74oMR1WiR6DnRU4U4rBGnbXEmqmKNHFx8BiUv90UupCbmEIMlVojFpuqq7D3by05buolzuxsu-rw-xt1arjZRKjw-uBMg8WsnZK1hMawPWj03Usyh4NevKym4tqq_WNedH1uhTxesBhzz1ipSNQ6fQlUHQhiI1_lKVy8gPJcTvD42OEDft83niCtvShF3ngEE6Jlp6k6NKZ975hzB1s0aAmjFabOJRehkNaz_BJ108W4gErY6B7RRrL_G3mn3XnGg',
      lastMessage: 'You: Hi Sophia, just a reminder...',
      lastMessageTime: 'Mon',
      unreadCount: 0,
      isActive: false,
    },
    {
      id: '4',
      patientName: 'Liam Goldberg',
      patientPhone: '(555) 456-7890',
      patientEmail: 'liam.goldberg@example.com',
      patientDob: '11/30/1992',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArjmB9poU4jKIus46OMrS-M3mVZmqh4hSdnl_T0TacgIQdi4WrPrxrOvcVe23aZR8_VZlu5j6f3Vg67rZ1SYl7pVMliTAxjTeWw1SkrUJ1-KMxrlOj5VquRqyG32mj17SLdYZmczSrlBe4Yp1r1LQsL219XIfRQMwPP5BHPk-kQr5ocYhDIEH4MTE2ZW4JYnufjtrQlNtFqt22Pc3wUpvR0SFrPvCTy6waq0A9UNeFiIKzD8JIbzZgIC9pWHv84Gbd49hwbECglds',
      lastMessage: 'System: Appointment Confirmed.',
      lastMessageTime: 'Oct 24',
      unreadCount: 0,
      isActive: false,
    },
  ];

  // Mock messages data
  const messages: Message[] = [
    {
      id: '1',
      sender: 'patient',
      content: 'Ok, thank you for the reminder!',
      timestamp: '10:42 AM',
      channel: 'SMS',
    },
    {
      id: '2',
      sender: 'doctor',
      content: "You're welcome, Olivia. We look forward to seeing you.",
      timestamp: '10:45 AM',
      channel: 'SMS',
    },
    {
      id: '3',
      sender: 'system',
      content: 'Automated Reminder Sent Yesterday at 3:00 PM',
      timestamp: '',
      channel: 'In-App',
    },
  ];

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conv => {
    if (selectedFilter === 'Unread') return conv.unreadCount > 0;
    if (selectedFilter === 'Flagged') return false; // Add flagged logic later
    return true;
  });

  const handleSendMessage = (channel: 'SMS' | 'Email') => {
    if (!messageText.trim()) return;
    // TODO: Implement send message logic
    console.log(`Sending ${channel}:`, messageText);
    setMessageText('');
  };

  return (
    <div className="flex h-[calc(100vh-120px)] w-full bg-background-light dark:bg-background-dark overflow-hidden -mx-5 -my-5 rounded-lg shadow-sm">
      {/* Left Column: Conversation List */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conversations</h2>
          
          {/* SearchBar */}
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-gray-100 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-2 text-sm font-normal leading-normal"
                placeholder="Search patients..."
              />
            </div>
          </label>
        </div>

        {/* SegmentedButtons */}
        <div className="p-4">
          <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-gray-700 has-[:checked]:shadow-sm has-[:checked]:text-gray-900 dark:has-[:checked]:text-white text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
              <span className="truncate">All</span>
              <input
                className="invisible w-0"
                name="filters"
                type="radio"
                value="All"
                checked={selectedFilter === 'All'}
                onChange={() => setSelectedFilter('All')}
              />
            </label>
            <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-gray-700 has-[:checked]:shadow-sm has-[:checked]:text-gray-900 dark:has-[:checked]:text-white text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal relative">
              <span className="truncate">Unread</span>
              {filteredConversations.filter(c => c.unreadCount > 0).length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 text-xs flex items-center justify-center bg-orange-500 text-white rounded-full">
                  {filteredConversations.filter(c => c.unreadCount > 0).length}
                </span>
              )}
              <input
                className="invisible w-0"
                name="filters"
                type="radio"
                value="Unread"
                checked={selectedFilter === 'Unread'}
                onChange={() => setSelectedFilter('Unread')}
              />
            </label>
            <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-gray-700 has-[:checked]:shadow-sm has-[:checked]:text-gray-900 dark:has-[:checked]:text-white text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
              <span className="truncate">Flagged</span>
              <input
                className="invisible w-0"
                name="filters"
                type="radio"
                value="Flagged"
                checked={selectedFilter === 'Flagged'}
                onChange={() => setSelectedFilter('Flagged')}
              />
            </label>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`flex gap-4 px-4 py-3 justify-between border-l-4 cursor-pointer transition-colors ${
                conversation.isActive && selectedConversation === conversation.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-white dark:bg-gray-900 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shrink-0"
                  style={{ backgroundImage: `url("${conversation.avatar}")` }}
                />
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <p className="text-gray-900 dark:text-white text-sm font-semibold leading-normal truncate">
                    {conversation.patientName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-normal leading-normal truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-normal leading-normal">
                  {conversation.lastMessageTime}
                </p>
                {conversation.unreadCount > 0 && (
                  <div className="size-5 flex items-center justify-center text-xs bg-orange-500 text-white rounded-full">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Column: Chat Interface */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                  style={{ backgroundImage: `url("${activeConversation.avatar}")` }}
                />
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">{activeConversation.patientName}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{activeConversation.patientPhone}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Date Separator */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">Today</div>

              {/* Messages */}
              {messages.map((message) => {
                if (message.sender === 'system') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                const isDoctor = message.sender === 'doctor';
                return (
                  <div key={message.id} className={`flex gap-3 ${isDoctor ? 'flex-row-reverse' : ''}`}>
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0"
                      style={{
                        backgroundImage: `url("${isDoctor ? user?.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeegf_xYNida_8B9kYtHzvHOyyyDandiCE4zNCkfQGKdbt9e2Qokptcq7jiPZU64reWm5FG24-R5O1JRVVShbsromeXhVN8Z78fN88D7AnBtYLlYZQd2VJ8K06A1bgk5OyV1JZAWKPM7mc2IYHEfM10oBBojlW8QUDbMchzPkUUd_cbb-1BW2bOyM8HPtSYn3Nhc9YXxSseXa2DrUgv8KJQIhzD1UzE5kcaa1bPVOHUpvGuzE-MTKL3CP4LHK9OWyLBIU0LTlWEJw' : activeConversation.avatar}")`,
                      }}
                    />
                    <div className={`flex flex-col gap-1 ${isDoctor ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-lg max-w-md ${
                          isDoctor
                            ? 'bg-primary/20 rounded-tr-none'
                            : 'bg-white dark:bg-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p className="text-gray-900 dark:text-white text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {message.timestamp} · {message.channel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="form-textarea w-full p-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Type your message..."
                  rows={3}
                />
                <button className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-primary">
                  <span className="material-symbols-outlined text-2xl">mood</span>
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div>
                  <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-md">
                    <span className="material-symbols-outlined text-base">integration_instructions</span>
                    Use Template
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendMessage('Email')}
                    className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold leading-normal hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <span className="material-symbols-outlined text-base">email</span>
                    <span className="truncate">Send Email</span>
                  </button>
                  <button
                    onClick={() => handleSendMessage('SMS')}
                    className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-base">sms</span>
                    <span className="truncate">Send SMS</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">chat</span>
              <p className="text-gray-600 dark:text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Contextual Panel */}
      {activeConversation && (
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col p-6 space-y-8 shrink-0">
          {/* Patient Profile Card */}
          <div className="flex flex-col items-center text-center">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 mb-4"
              style={{ backgroundImage: `url("${activeConversation.avatar}")` }}
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeConversation.patientName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">DOB: {activeConversation.patientDob}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{activeConversation.patientPhone}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{activeConversation.patientEmail}</p>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Upcoming Appointments */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Follow-up Visit</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Nov 15, 2023 at 2:30 PM</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Annual Check-up</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Jan 22, 2024 at 11:00 AM</p>
                </div>
              </li>
            </ul>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Quick Actions */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h4>
            <div className="flex flex-col space-y-2">
              <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined text-xl">add_circle</span>
                Schedule New Appointment
              </button>
              <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined text-xl">send</span>
                Send Appointment Reminder
              </button>
              <button className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined text-xl">person</span>
                View Full Patient Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

