import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/Colors';

// Define a primary color to use as fallback if Colors.primary is undefined
const PRIMARY_COLOR = '#0a7ea4';

const ConversationScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { 
    currentMessages, 
    currentConversationId,
    isLoading, 
    loadingSend,
    error, 
    setCurrentConversation, 
    clearCurrentConversation,
    sendMessage,
  } = useChatStore();

  // Get conversation details
  const [conversationTitle, setConversationTitle] = useState('Conversation');
  
  useEffect(() => {
    if (currentUser && id) {
      setCurrentConversation(id);
      
      // Find conversation in store to set the title
      const conversation = useChatStore.getState().conversations.find(c => c.id === id);
      if (conversation) {
        setConversationTitle(conversation.propertyTitle || 'Conversation');
      }
    }
    
    return () => {
      clearCurrentConversation();
    };
  }, [currentUser, id]);

  const onSend = useCallback((messages = []) => {
    if (messages.length > 0) {
      sendMessage(messages[0].text);
    }
  }, [sendMessage]);

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: PRIMARY_COLOR,
          },
          left: {
            backgroundColor: '#f0f0f0',
          },
        }}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: '#333',
          },
        }}
      />
    );
  };

  const renderSend = props => {
    return (
      <Send
        {...props}
        disabled={loadingSend}
        containerStyle={styles.sendContainer}
      >
        {loadingSend ? (
          <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        ) : (
          <Ionicons name="send" size={24} color={PRIMARY_COLOR} />
        )}
      </Send>
    );
  };

  const renderInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text>Please log in to view this conversation</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.actionButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => id && setCurrentConversation(id)}
        >
          <Text style={styles.actionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: conversationTitle,
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : (
          <GiftedChat
            messages={currentMessages}
            onSend={messages => onSend(messages)}
            user={{
              _id: currentUser?.uid || 'unknown',
            }}
            renderBubble={renderBubble}
            renderSend={renderSend}
            renderInputToolbar={renderInputToolbar}
            alwaysShowSend
            scrollToBottom
            renderLoading={() => (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#fff',
  },
  inputPrimary: {
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 15,
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ConversationScreen; 