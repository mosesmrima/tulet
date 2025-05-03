import { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useChatStore } from "../../stores/chatStore";
import { router } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../../stores/authStore";

export default function ChatScreen() {
  const { conversations, fetchConversations, loadingConversations } = useChatStore();
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, fetchConversations]);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const renderConversation = ({ item }: { item: any }) => {
    const lastMessage = item.lastMessage || {};
    const formattedTime = lastMessage.createdAt && lastMessage.createdAt.toDate
    ? formatDistanceToNow(lastMessage.createdAt.toDate(), { addSuffix: true })
    : 'No date available'; // Default message if createdAt is missing or invalid

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id)}
      >
        <Image
          source={{ uri: item.propertyImage || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {item.propertyTitle || 'Property'}
            </Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {lastMessage.text || 'No messages yet'}
          </Text>
          <Text style={styles.senderName} numberOfLines={1}>
            {item.otherUserName || 'User'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loadingConversations) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              When you start chatting with property owners or interested renters, your conversations will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  messagePreview: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 2,
  },
  senderName: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 20,
  },
}); 