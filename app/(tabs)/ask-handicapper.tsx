import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  limit
} from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any;
  isHandicapper: boolean;
}

interface ChatSession {
  id: string;
  handicapperId: string;
  handicapperName: string;
  handicapperAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
}

export default function AskHandicapperScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedHandicapper, setSelectedHandicapper] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock handicappers for selection
  const availableHandicappers = [
    {
      id: 'handicapper_1',
      name: 'Pro Picks Master',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      specialties: ['NFL', 'NBA'],
      winRate: 78,
    },
    {
      id: 'handicapper_2',
      name: 'Sports Analyst',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      specialties: ['NBA', 'MLB'],
      winRate: 72,
    },
    {
      id: 'handicapper_3',
      name: 'Gridiron Guru',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      specialties: ['NFL'],
      winRate: 75,
    },
  ];

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const openAccount = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const openChatHistory = () => {
    setShowChatHistory(!showChatHistory);
  };

  const selectHandicapper = (handicapper: any) => {
    setSelectedHandicapper(handicapper);
    setShowChatHistory(false);
    loadMessages(handicapper.id);
  };

  const loadMessages = async (handicapperId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const chatRef = collection(db, 'chats', user.uid, handicapperId);
      const q = query(chatRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            timestamp: data.timestamp,
            isHandicapper: data.senderId === handicapperId,
          });
        });
        setMessages(messagesData);
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedHandicapper || !newMessage.trim()) return;

    try {
      setLoading(true);
      const chatRef = collection(db, 'chats', user.uid, selectedHandicapper.id);
      
      await addDoc(chatRef, {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || 'You',
        senderAvatar: user.photoURL,
        timestamp: serverTimestamp(),
        isHandicapper: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const loadChatSessions = async () => {
    if (!user) return;

    try {
      // This would typically query a separate collection for chat sessions
      // For now, we'll create mock chat sessions
      const mockSessions: ChatSession[] = [
        {
          id: 'session_1',
          handicapperId: 'handicapper_1',
          handicapperName: 'Pro Picks Master',
          handicapperAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          lastMessage: 'Thanks for the question! I think the over is the play here.',
          lastMessageTime: new Date(),
          unreadCount: 0,
        },
        {
          id: 'session_2',
          handicapperId: 'handicapper_2',
          handicapperName: 'Sports Analyst',
          handicapperAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          lastMessage: 'Based on the analytics, I recommend the spread.',
          lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          unreadCount: 1,
        },
      ];
      setChatSessions(mockSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  useEffect(() => {
    loadChatSessions();
  }, [user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      className={`flex-row mb-4 ${
        message.isHandicapper ? 'justify-start' : 'justify-end'
      }`}
    >
      <View className={`max-w-[80%] ${message.isHandicapper ? 'flex-row' : 'flex-row-reverse'}`}>
        {message.isHandicapper && (
          <Image
            source={{ uri: message.senderAvatar || 'https://via.placeholder.com/40' }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        <View
          className={`rounded-lg px-4 py-3 ${
            message.isHandicapper
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'bg-blue-600'
          }`}
        >
          <Text
            className={`text-sm ${
              message.isHandicapper
                ? 'text-gray-900 dark:text-white'
                : 'text-white'
            }`}
          >
            {message.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              message.isHandicapper
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-blue-100'
            }`}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHandicapperSelection = () => (
    <View className="flex-1 px-4 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Choose a Handicapper
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-6">
        Select a handicapper to start a conversation
      </Text>

      <ScrollView className="flex-1">
        {availableHandicappers.map((handicapper) => (
          <TouchableOpacity
            key={handicapper.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700"
            onPress={() => selectHandicapper(handicapper)}
          >
            <View className="flex-row items-center">
              <Image
                source={{ uri: handicapper.avatar }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {handicapper.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {handicapper.specialties.join(', ')} • {handicapper.winRate}% win rate
                </Text>
                <Text className="text-xs text-blue-600 dark:text-blue-400">
                  Tap to start conversation
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChatHistory = () => (
    <View className="flex-1 px-4 py-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Chat History
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-6">
        Your previous conversations
      </Text>

      <ScrollView className="flex-1">
        {chatSessions.length > 0 ? (
          chatSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700"
              onPress={() => selectHandicapper({
                id: session.handicapperId,
                name: session.handicapperName,
                avatar: session.handicapperAvatar,
              })}
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: session.handicapperAvatar || 'https://via.placeholder.com/50' }}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {session.handicapperName}
                    </Text>
                    {session.unreadCount > 0 && (
                      <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {session.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600 dark:text-gray-400" numberOfLines={1}>
                    {session.lastMessage}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatTime(session.lastMessageTime)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No chat history
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center px-8">
              Start a conversation with a handicapper to see your chat history here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderChatInterface = () => (
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => setSelectedHandicapper(null)}>
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Image
            source={{ uri: selectedHandicapper?.avatar || 'https://via.placeholder.com/30' }}
            className="w-8 h-8 rounded-full mr-2"
          />
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedHandicapper?.name}
          </Text>
        </View>
        <View className="w-16" />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              Start the conversation
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center px-8">
              Send a message to {selectedHandicapper?.name} to begin your chat
            </Text>
          </View>
        )}
        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View className="flex-row items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mr-3 text-gray-900 dark:text-white"
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          className={`rounded-lg px-4 py-3 ${
            newMessage.trim() ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          onPress={sendMessage}
          disabled={!newMessage.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={openAccount}>
          <Text className="text-2xl">👤</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">
          Ask Handicapper
        </Text>
        <TouchableOpacity onPress={openChatHistory}>
          <Text className="text-2xl">💬</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {showChatHistory ? (
        renderChatHistory()
      ) : selectedHandicapper ? (
        renderChatInterface()
      ) : (
        renderHandicapperSelection()
      )}
    </View>
  );
}