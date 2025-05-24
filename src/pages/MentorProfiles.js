import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

function App() {
  const [userEmail, setUserEmail] = useState('Previewer');
  const [userId, setUserId] = useState(null);
  const [mentorRequests, setMentorRequests] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      } else {
        setUserEmail('Previewer');
        setUserId(null);
        setMentorRequests([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setMentorRequests([]);
      return;
    }
    const q = query(collection(db, 'mentorRequests'), where('mentorId', '==', userId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMentorRequests(requests);
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
      <h2>Mentor Profile</h2>
      <p>Hello <i><b>{userEmail}</b></i></p>

      {mentorRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentor Requests</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mentorRequests.map(req => (
              <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
                <p><b>Mentee ID:</b> {req.menteeId}</p>
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
    </div>
  );
}

export default App;
