import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMessage } from "react-native-gifted-chat";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  doc,
  onSnapshot,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { useAuthStore } from './authStore';

interface ConversationMetadata {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  participants: string[];
  otherUserId?: string;
  otherUserName?: string;
  lastMessage?: {
    text: string;
    createdAt: Timestamp;
  };
  unreadCount?: {
    [userId: string]: number;
  };
}

interface ChatState {
  conversations: ConversationMetadata[];
  currentMessages: IMessage[];
  currentConversationId: string | null;
  isLoading: boolean;
  loadingConversations: boolean;
  loadingSend: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  
  // Fetch user's conversations
  fetchConversations: () => Promise<void>;
  
  // Start or fetch a conversation with a property owner
  startConversation: (propertyId: string, propertyOwnerId: string, propertyTitle: string, propertyImage?: string) => Promise<string>;
  
  // Set current conversation
  setCurrentConversation: (conversationId: string) => Promise<void>;
  
  // Clear current conversation
  clearCurrentConversation: () => void;
  
  // Send a message
  sendMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentMessages: [],
      currentConversationId: null,
      isLoading: false,
      loadingConversations: false,
      loadingSend: false,
      error: null,
      unsubscribe: null,

      fetchConversations: async () => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;

        set({ loadingConversations: true, error: null });
        try {
          const conversationsRef = collection(db, 'conversations');
          const q = query(
            conversationsRef,
            where('participants', 'array-contains', currentUser.uid),
            orderBy('updatedAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const conversationsData: ConversationMetadata[] = [];

          for (const conversationDoc of querySnapshot.docs) {
            const data = conversationDoc.data();
            const conversation: ConversationMetadata = {
              id: conversationDoc.id,
              propertyId: data.propertyId,
              propertyTitle: data.propertyTitle || 'Property',
              propertyImage: data.propertyImage,
              participants: data.participants,
              lastMessage: data.lastMessage ? {
                text: data.lastMessage,
                createdAt: data.updatedAt
              } : undefined,
              unreadCount: data.unreadCount || {}
            };

            // Find the other user's ID
            const otherUserId = conversation.participants.find(id => id !== currentUser.uid);
            if (otherUserId) {
              conversation.otherUserId = otherUserId;
              
              // Get the other user's display name
              try {
                console.log(`Fetching user details for userId: ${otherUserId}`);
                const userDocRef = doc(db, 'users', otherUserId);
                console.log(`User reference created: ${userDocRef.path}`);
                
                const userDocSnapshot = await getDoc(userDocRef);
                console.log(`User exists: ${userDocSnapshot.exists()}`);
                
                if (userDocSnapshot.exists()) {
                  const userData = userDocSnapshot.data();
                  console.log(`User data retrieved:`, Object.keys(userData));
                  conversation.otherUserName = userData.displayName || 'User';
                } else {
                  console.log(`User document does not exist for ID: ${otherUserId}`);
                  conversation.otherUserName = 'User';
                }
              } catch (error) {
                console.error(`Error fetching user data for ID ${otherUserId}:`, error);
                // Don't let this error prevent the conversation from loading
                conversation.otherUserName = 'User';
              }
            }

            // Get property details
            if (conversation.propertyId) {
              try {
                console.log(`Fetching property details for propertyId: ${conversation.propertyId}`);
                const propertyDocRef = doc(db, 'properties', conversation.propertyId);
                console.log(`Property reference created: ${propertyDocRef.path}`);
                
                const propertyDocSnapshot = await getDoc(propertyDocRef);
                console.log(`Property exists: ${propertyDocSnapshot.exists()}`);
                
                if (propertyDocSnapshot.exists()) {
                  const propertyData = propertyDocSnapshot.data();
                  console.log(`Property data retrieved:`, Object.keys(propertyData));
                  
                  // Safely set property title with fallback
                  conversation.propertyTitle = propertyData.title || 'Property';
                  
                  // Safely set property image with multiple fallbacks
                  if (propertyData.mainImageUrl) {
                    conversation.propertyImage = propertyData.mainImageUrl;
                  } else if (propertyData.imageUrl) {
                    conversation.propertyImage = propertyData.imageUrl;
                  } else if (propertyData.imageUrls && propertyData.imageUrls.length > 0) {
                    conversation.propertyImage = propertyData.imageUrls[0];
                  } else if (propertyData.images && propertyData.images.length > 0) {
                    conversation.propertyImage = propertyData.images[0];
                  } else {
                    conversation.propertyImage = null;
                  }
                }
              } catch (error) {
                console.error(`Error fetching property data for ID ${conversation.propertyId}:`, error);
                // Don't let this error prevent the conversation from loading
                // Just use default values
                conversation.propertyTitle = conversation.propertyTitle || 'Property';
                conversation.propertyImage = conversation.propertyImage || null;
              }
            }

            conversationsData.push(conversation);
          }

          set({ conversations: conversationsData, loadingConversations: false });
        } catch (error) {
          console.error('Error fetching conversations:', error);
          set({ error: 'Failed to load conversations', loadingConversations: false });
        }
      },

      startConversation: async (propertyId, propertyOwnerId, propertyTitle, propertyImage) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`Starting conversation for property: ${propertyId} with owner: ${propertyOwnerId}`);
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to send messages");
          }
          
          if (user.uid === propertyOwnerId) {
            throw new Error("You cannot message yourself");
          }
          
          // Check if conversation already exists
          const conversationsQuery = query(
            collection(db, "conversations"),
            where("propertyId", "==", propertyId),
            where("participants", "array-contains", user.uid)
          );
          
          const querySnapshot = await getDocs(conversationsQuery);
          
          let conversationId: string;
          
          // If conversation exists, use it
          if (!querySnapshot.empty) {
            console.log("Found existing conversation");
            conversationId = querySnapshot.docs[0].id;
          } else {
            console.log("Creating new conversation");
            // Ensure we have valid property data
            const validPropertyTitle = propertyTitle || "Property";
            
            // Create a new conversation
            const conversationData = {
              propertyId,
              propertyTitle: validPropertyTitle,
              propertyImage: propertyImage || null,
              participants: [user.uid, propertyOwnerId],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastMessage: "",
              unreadCount: {
                [propertyOwnerId]: 0,
                [user.uid]: 0
              }
            };
            
            console.log("Saving conversation data:", Object.keys(conversationData));
            const docRef = await addDoc(collection(db, "conversations"), conversationData);
            conversationId = docRef.id;
            console.log(`New conversation created with ID: ${conversationId}`);
            
            // Update local state
            await get().fetchConversations();
          }
          
          set({ isLoading: false });
          return conversationId;
        } catch (error: any) {
          console.error("Error starting conversation:", error);
          set({ error: error.message || "Failed to start conversation", isLoading: false });
          throw error;
        }
      },

      setCurrentConversation: async (conversationId) => {
        set({ isLoading: true, error: null, currentConversationId: conversationId });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to view messages");
          }
          
          // Unsubscribe from any existing listener
          if (get().unsubscribe) {
            get().unsubscribe();
          }
          
          // Create a query for messages in this conversation
          const messagesQuery = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "desc")
          );
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messages: IMessage[] = [];
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              
              // Convert Firestore Timestamp to Date
              const createdAt = data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate() 
                : new Date();
                
              messages.push({
                _id: doc.id,
                text: data.text,
                createdAt,
                user: {
                  _id: data.senderId,
                  name: data.senderName,
                  avatar: data.senderAvatar || undefined
                }
              });
            });
            
            set({ currentMessages: messages });
          });
          
          // Store the unsubscribe function
          set({ unsubscribe, isLoading: false });
        } catch (error: any) {
          console.error("Error setting current conversation:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      clearCurrentConversation: () => {
        // Unsubscribe from any existing listener
        if (get().unsubscribe) {
          get().unsubscribe();
        }
        
        set({ 
          currentMessages: [], 
          currentConversationId: null,
          unsubscribe: null 
        });
      },

      sendMessage: async (text) => {
        set({ loadingSend: true, error: null });
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to send messages");
          }
          
          const { currentConversationId } = get();
          if (!currentConversationId) {
            throw new Error("No active conversation");
          }
          
          // Create message data
          const messageData = {
            text,
            senderId: user.uid,
            senderName: user.displayName || "User",
            senderAvatar: user.photoURL,
            createdAt: serverTimestamp()
          };
          
          // Add message to the messages subcollection
          await addDoc(
            collection(db, "conversations", currentConversationId, "messages"), 
            messageData
          );
          
          // Update conversation metadata
          const conversationRef = doc(db, "conversations", currentConversationId);
          await updateDoc(conversationRef, {
            lastMessage: text,
            updatedAt: serverTimestamp(),
          });
          
          // Update local conversations list to reflect the new message
          await get().fetchConversations();
          set({ loadingSend: false });
        } catch (error: any) {
          console.error("Error sending message:", error);
          set({ error: error.message, loadingSend: false });
        }
      }
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);