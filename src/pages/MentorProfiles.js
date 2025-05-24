import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

function MentorProfile() {
  const [userEmail, setUserEmail] = useState('Previewer');
  const [userId, setUserId] = useState(null);
  const [collabRequests, setCollabRequests] = useState([]);
  const [collaboratingMentors, setCollaboratingMentors] = useState([]);

  // Listen for auth state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      } else {
        setUserEmail('Previewer');
        setUserId(null);
        setCollabRequests([]);
        setCollaboratingMentors([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen for incoming collaboration requests
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'mentorRequests'),
      where('mentorId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCollabRequests(requests);

      const accepted = await Promise.all(
        requests
          .filter(req => req.status === 'accepted')
          .map(async req => {
            const otherMentorId = req.requesterId;
            const mentorDoc = await getDoc(doc(db, 'users', otherMentorId));
            return {
              chatId: req.id,
              mentorEmail: mentorDoc.exists() ? mentorDoc.data().email : 'Unknown'
            };
          })
      );
      setCollaboratingMentors(accepted);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAccept = async (requestId) => {
    const requestRef = doc(db, 'mentorRequests', requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
      respondedAt: serverTimestamp()
    });
  };

  const handleReject = async (requestId) => {
    const requestRef = doc(db, 'mentorRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      respondedAt: serverTimestamp()
    });
  };

  return (
    <div className="App">
      <h2>Mentor Collaboration Profile</h2>
      <p>Hello <i><b>{userEmail}</b></i></p>

      {collabRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentor Collaboration Requests</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {collabRequests.map(req => (
              <li
                key={req.id}
                style={{
                  border: '1px solid #ccc',
                  marginBottom: '12px',
                  padding: '10px',
                  borderRadius: '6px'
                }}
              >
                <p><b>From Mentor ID:</b> {req.requesterId}</p>
                <p><b>Status:</b> {req.status}</p>
                {req.status === 'pending' && (
                  <>
                    <button
                      style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {collaboratingMentors.length > 0 ? (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentors You're Collaborating With:</h3>
          <ul>
            {collaboratingMentors.map(m => (
              <li key={m.chatId}>
                Mentor: <b>{m.mentorEmail}</b> (Chat ID: {m.chatId.slice(0, 6)})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No collaborating mentors yet.</p>
      )}
    </div>
  );
}

export default MentorProfile;
