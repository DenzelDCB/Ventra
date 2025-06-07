import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

function App() {
  const [userEmail, setUserEmail] = useState('Preview');
  const [userId, setUserId] = useState(null);
  const [acceptedMentors, setAcceptedMentors] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      } else {
        setUserEmail('Preview');
        setUserId(null);
        setAcceptedMentors([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'mentorRequests'),
      where('menteeId', '==', userId),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const mentorsWithDetails = await Promise.all(
        requests.map(async req => {
          const mentorDoc = await getDoc(doc(db, 'users', req.mentorId));
          const mentorEmail = mentorDoc.exists() ? mentorDoc.data().email : 'Unknown Mentor';
          return {
            chatId: req.id,
            mentorId: req.mentorId,
            mentorEmail,
            requesterId: req.requesterId || 'Unknown',
          };
        })
      );

      setAcceptedMentors(mentorsWithDetails);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="App">
      <h2>Mentee Dashboard</h2>
      <p>Hello <i><b>{userEmail}</b></i></p>

      {acceptedMentors.length > 0 ? (
        <div>
          <h3>Your Accepted Mentors:</h3>
          <ul>
            {acceptedMentors.map(m => (
              <li key={m.chatId}>
                Mentor: <b>{m.mentorEmail}</b> <br />
                Chat ID: {m.chatId.slice(0, 6)} <br />
                Requester ID: <i>{m.requesterId}</i>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No accepted mentors yet.</p>
      )}
    </div>
  );
}

export default App;
