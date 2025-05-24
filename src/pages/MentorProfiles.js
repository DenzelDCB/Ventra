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

  const [menteeRequests, setMenteeRequests] = useState([]);
  const [mentorCollabRequests, setMentorCollabRequests] = useState([]);
  const [acceptedMentees, setAcceptedMentees] = useState([]);
  const [acceptedMentors, setAcceptedMentors] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      } else {
        setUserEmail('Previewer');
        setUserId(null);
        setMenteeRequests([]);
        setMentorCollabRequests([]);
        setAcceptedMentees([]);
        setAcceptedMentors([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'menteeRequests'),
      where('mentorId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenteeRequests(requests);

      const accepted = await Promise.all(
        requests
          .filter(req => req.status === 'accepted')
          .map(async req => {
            const menteeDoc = await getDoc(doc(db, 'users', req.menteeId));
            return {
              id: req.id,
              menteeEmail: menteeDoc.exists() ? menteeDoc.data().email : 'Unknown Mentee',
            };
          })
      );
      setAcceptedMentees(accepted);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'mentorRequests'),
      where('mentorId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const requests = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          const requesterDoc = await getDoc(doc(db, 'users', data.requesterId));
          return {
            id: docSnap.id,
            ...data,
            requesterEmail: requesterDoc.exists() ? requesterDoc.data().email : 'Unknown Mentor',
          };
        })
      );
      setMentorCollabRequests(requests);

      const accepted = requests
        .filter(req => req.status === 'accepted')
        .map(req => ({
          chatId: req.id,
          mentorEmail: req.requesterEmail,
        }));

      setAcceptedMentors(accepted);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAccept = async (collectionName, requestId) => {
    const requestRef = doc(db, collectionName, requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
      respondedAt: serverTimestamp()
    });
  };

  const handleReject = async (collectionName, requestId) => {
    const requestRef = doc(db, collectionName, requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      respondedAt: serverTimestamp()
    });
  };

  return (
    <div className="App">
      <h2>Mentor Profile</h2>
      <p>Hello <i><b>{userEmail}</b></i></p>

      {/* Mentee Requests */}
      {menteeRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentee Requests</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menteeRequests.map(req => (
              <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
                <p><b>Mentee ID:</b> {req.menteeId}</p>
                <p><b>Status:</b> {req.status}</p>
                {req.status === 'pending' && (
                  <>
                    <button
                      style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleAccept('menteeRequests', req.id)}
                    >
                      Accept
                    </button>
                    <button
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleReject('menteeRequests', req.id)}
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

      {/* Mentor Collaboration Requests */}
      {mentorCollabRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentor Collaboration Requests</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mentorCollabRequests.map(req => (
              <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
                <p><b>From Mentor:</b> {req.requesterEmail}</p>
                <p><b>Status:</b> {req.status}</p>
                {req.status === 'pending' && (
                  <>
                    <button
                      style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleAccept('mentorRequests', req.id)}
                    >
                      Accept
                    </button>
                    <button
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleReject('mentorRequests', req.id)}
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

      {/* Accepted Mentees */}
      {acceptedMentees.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Accepted Mentees</h3>
          <ul>
            {acceptedMentees.map(m => (
              <li key={m.id}>{m.menteeEmail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Accepted Mentor Collaborators */}
      {acceptedMentors.length > 0 ? (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentors You're Collaborating With</h3>
          <ul>
            {acceptedMentors.map(m => (
              <li key={m.chatId}>
                Mentor: <b>{m.mentorEmail}</b> (Chat ID: {m.chatId.slice(0, 6)})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No mentors you're collaborating with yet.</p>
      )}
    </div>
  );
}

export default MentorProfile;
