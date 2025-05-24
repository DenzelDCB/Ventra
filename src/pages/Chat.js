import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs
} from 'firebase/firestore';

function Chat() {
  const [userId, setUserId] = useState(null);
  const [acceptedChats, setAcceptedChats] = useState([]); // array of { chatId, mentorId, menteeId }
  const [currentChatID, setCurrentChatID] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [canChat, setCanChat] = useState(false);

  // Get current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setAcceptedChats([]);
        setCurrentChatID(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch accepted mentor requests for this user as mentor or mentee
  useEffect(() => {
    if (!userId) return;

    async function fetchAcceptedChats() {
      try {
        const mentorQuery = query(
          collection(db, 'mentorRequests'),
          where('mentorId', '==', userId),
          where('status', '==', 'accepted')
        );

        const menteeQuery = query(
          collection(db, 'mentorRequests'),
          where('menteeId', '==', userId),
          where('status', '==', 'accepted')
        );

        const [mentorSnap, menteeSnap] = await Promise.all([
          getDocs(mentorQuery),
          getDocs(menteeQuery)
        ]);

        const mentorChats = mentorSnap.docs.map(doc => ({ chatId: doc.id, ...doc.data() }));
        const menteeChats = menteeSnap.docs.map(doc => ({ chatId: doc.id, ...doc.data() }));

        const allChats = [...mentorChats, ...menteeChats];
        setAcceptedChats(allChats);

        if (allChats.length > 0) {
          if (!currentChatID || !allChats.find(c => c.chatId === currentChatID)) {
            setCurrentChatID(allChats[0].chatId);
          }
        } else {
          setCurrentChatID(null);
        }
      } catch (error) {
        console.error('Error fetching accepted chats:', error);
      }
    }

    fetchAcceptedChats();
  }, [userId, currentChatID]);

  useEffect(() => {
    if (!currentChatID) {
      setMessages([]);
      setCanChat(false);
      return;
    }

    const isAccepted = acceptedChats.some(c => c.chatId === currentChatID);
    setCanChat(isAccepted);

    if (!isAccepted) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chats', currentChatID, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => {
      console.error('Error listening to messages:', error);
      setMessages([]);
    });

    return () => unsubscribe();
  }, [currentChatID, acceptedChats]);

  const handleSendMessage = async () => {
    if (!canChat) {
      alert('You cannot send messages in this chat until your request is accepted.');
      return;
    }
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chats', currentChatID, 'messages'), {
        text: newMessage.trim(),
        sender: auth.currentUser?.email || 'Anonymous',
        timestamp: new Date()
      });
      setNewMessage('');
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Chat Rooms</h2>

      {acceptedChats.length === 0 && <p>You have no accepted mentor chats to participate in. If you do, wait a while as Chat might take a while to connect to the internet.</p>}

      {acceptedChats.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {acceptedChats.map(({ chatId, mentorId, menteeId }) => (
            <button
              key={chatId}
              onClick={() => setCurrentChatID(chatId)}
              style={{
                marginRight: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                backgroundColor: currentChatID === chatId ? '#4caf50' : '#ddd',
                color: currentChatID === chatId ? 'white' : 'black',
                borderRadius: 4,
                border: 'none'
              }}
            >
              Chat: {chatId.slice(0, 6)}
            </button>
          ))}
        </div>
      )}

      {currentChatID && !canChat && (
        <p>Your request for this chat has not been accepted, so you cannot send messages.</p>
      )}

      {currentChatID && (
        <>
          <div style={{ border: '1px solid #ccc', padding: 16, maxHeight: 300, overflowY: 'auto', }}>
            {messages.length === 0 && <p>No messages yet. Some might take time to load.</p>}
            {messages.map(msg => (
              <p key={msg.id}><strong style={{backgroundColor: 'lightgrey', border: '0px', borderRadius: '5px', padding: '5px', width: '50%', borderBottomRightRadius: '0px', borderTopRightRadius: '5px',}}>{msg.sender}:</strong><small><span style={{backgroundColor: '#eeeeee', border: '0px', borderRadius: '5px', padding: '5px', width: '50%', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px',}}>{msg.text}</span></small></p>
            ))}
          </div>

          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={canChat ? 'Type a message...' : 'You cannot send messages in this chat.'}
            disabled={!canChat}
            style={{ width: '80%', padding: 8, marginTop: 8 }}
          />
          <button onClick={handleSendMessage} disabled={!canChat} style={{ padding: '8px 16px', marginLeft: 8 }}>
            Send
          </button>
        </>
      )}
    </div>
  );
}

export default Chat;
