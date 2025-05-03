import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { format } from 'date-fns';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/Colors';

// Define a primary color to use as fallback if Colors.primary is undefined
const PRIMARY_COLOR = '#0a7ea4';

const ChatsScreen = () => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { 
    conversations, 
    loadingConversations, 
    error, 
    fetchConversations 
  } = useChatStore();

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  const navigateToConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const renderConversationItem = ({ item }) => {
    const lastMessageTime = item.lastMessage?.createdAt 
      ? format(item.lastMessage.createdAt.toDate(), 'MMM d')
      : '';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigateToConversation(item.id)}
      >
        {item.propertyImage ? (
          <Image source={{ uri: item.propertyImage }} style={styles.propertyImage} />
        ) : (
          <View style={styles.propertyImagePlaceholder} />
        )}
        
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {item.propertyTitle || 'Property'}
            </Text>
            {lastMessageTime ? (
              <Text style={styles.timeText}>{lastMessageTime}</Text>
            ) : null}
          </View>
          
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUserName || 'User'}
          </Text>
          
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text>Please log in to view your messages</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Messages',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <View style={styles.container}>
        {loadingConversations ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchConversations()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noConversationsText}>No conversations yet</Text>
            <Text style={styles.noConversationsSubtext}>
              Start messaging property owners or interested tenants
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  propertyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  propertyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  conversationDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  userName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#444',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noConversationsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noConversationsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatsScreen; 