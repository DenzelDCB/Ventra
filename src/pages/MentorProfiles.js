// import React, { useState, useEffect } from 'react';
// import { auth, db } from '../firebase';
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   doc,
//   getDoc,
//   updateDoc,
//   serverTimestamp
// } from 'firebase/firestore';

// function MentorProfile() {
//   const [userEmail, setUserEmail] = useState('Previewer');
//   const [userId, setUserId] = useState(null);

//   // Requests from mentees (menteeId requests mentorship from this mentor)
//   const [menteeRequests, setMenteeRequests] = useState([]);

//   // Requests from other mentors for collaboration
//   const [mentorCollabRequests, setMentorCollabRequests] = useState([]);

//   // Accepted mentees
//   const [acceptedMentees, setAcceptedMentees] = useState([]);

//   // Accepted mentor collaborators
//   const [acceptedMentors, setAcceptedMentors] = useState([]);

//   // Listen for auth changes
//   useEffect(() => {
//     const unsubscribeAuth = auth.onAuthStateChanged(user => {
//       if (user) {
//         setUserEmail(user.email);
//         setUserId(user.uid);
//       } else {
//         setUserEmail('Previewer');
//         setUserId(null);
//         setMenteeRequests([]);
//         setMentorCollabRequests([]);
//         setAcceptedMentees([]);
//         setAcceptedMentors([]);
//       }
//     });
//     return () => unsubscribeAuth();
//   }, []);

//   // Listen for mentee mentorship requests
//   useEffect(() => {
//     if (!userId) return;

//     const q = query(
//       collection(db, 'menteeRequests'),
//       where('mentorId', '==', userId)
//     );

//     const unsubscribe = onSnapshot(q, async snapshot => {
//       const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setMenteeRequests(requests);

//       const accepted = await Promise.all(
//         requests
//           .filter(req => req.status === 'accepted')
//           .map(async req => {
//             const menteeDoc = await getDoc(doc(db, 'users', req.menteeId));
//             return {
//               id: req.id,
//               menteeEmail: menteeDoc.exists() ? menteeDoc.data().email : 'Unknown Mentee',
//             };
//           })
//       );
//       setAcceptedMentees(accepted);
//     });

//     return () => unsubscribe();
//   }, [userId]);

//   // Listen for mentor collaboration requests
//   useEffect(() => {
//     if (!userId) return;

//     const q = query(
//       collection(db, 'mentorRequests'),
//       where('mentorId', '==', userId)
//     );

//     const unsubscribe = onSnapshot(q, async snapshot => {
//       const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setMentorCollabRequests(requests);

//       const accepted = await Promise.all(
//         requests
//           .filter(req => req.status === 'accepted')
//           .map(async req => {
//             const mentorDoc = await getDoc(doc(db, 'users', req.requesterId));
//             return {
//               chatId: req.id,
//               mentorEmail: mentorDoc.exists() ? mentorDoc.data().email : 'Unknown Mentor',
//             };
//           })
//       );
//       setAcceptedMentors(accepted);
//     });

//     return () => unsubscribe();
//   }, [userId]);

//   // Accept request (shared for mentee or mentor request)
//   const handleAccept = async (collectionName, requestId) => {
//     const requestRef = doc(db, collectionName, requestId);
//     await updateDoc(requestRef, {
//       status: 'accepted',
//       respondedAt: serverTimestamp()
//     });
//   };

//   // Reject request (shared for mentee or mentor request)
//   const handleReject = async (collectionName, requestId) => {
//     const requestRef = doc(db, collectionName, requestId);
//     await updateDoc(requestRef, {
//       status: 'rejected',
//       respondedAt: serverTimestamp()
//     });
//   };

//   return (
//     <div className="App">
//       <h2>Mentor Profile</h2>
//       <p>Hello <i><b>{userEmail}</b></i></p>

//       {/* Mentee Requests */}
//       {menteeRequests.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>Mentee Requests</h3>
//           <ul style={{ listStyle: 'none', padding: 0 }}>
//             {menteeRequests.map(req => (
//               <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
//                 <p><b>Mentee ID:</b> {req.menteeId}</p>
//                 <p><b>Status:</b> {req.status}</p>
//                 {req.status === 'pending' && (
//                   <>
//                     <button
//                       style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
//                       onClick={() => handleAccept('menteeRequests', req.id)}
//                     >
//                       Accept
//                     </button>
//                     <button
//                       style={{ padding: '6px 12px', cursor: 'pointer' }}
//                       onClick={() => handleReject('menteeRequests', req.id)}
//                     >
//                       Reject
//                     </button>
//                   </>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Mentor Collaboration Requests */}
//       {mentorCollabRequests.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>Mentor Collaboration Requests</h3>
//           <ul style={{ listStyle: 'none', padding: 0 }}>
//             {mentorCollabRequests.map(req => (
//               <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
//                 <p><b>From Mentor ID:</b> {req.requesterId}</p>
//                 <p><b>Status:</b> {req.status}</p>
//                 {req.status === 'pending' && (
//                   <>
//                     <button
//                       style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
//                       onClick={() => handleAccept('mentorRequests', req.id)}
//                     >
//                       Accept
//                     </button>
//                     <button
//                       style={{ padding: '6px 12px', cursor: 'pointer' }}
//                       onClick={() => handleReject('mentorRequests', req.id)}
//                     >
//                       Reject
//                     </button>
//                   </>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Accepted Mentees */}
//       {acceptedMentees.length > 0 && (
//         <div style={{ marginTop: '30px' }}>
//           <h3>Accepted Mentees</h3>
//           <ul>
//             {acceptedMentees.map(m => (
//               <li key={m.id}>{m.menteeEmail}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Accepted Mentor Collaborators */}
//       {acceptedMentors.length > 0 ? (
//         <div style={{ marginTop: '30px' }}>
//           <h3>Mentors You're Collaborating With</h3>
//           <ul>
//             {acceptedMentors.map(m => (
//               <li key={m.chatId}>
//                 Mentor: <b>{m.mentorEmail}</b> (Chat ID: {m.chatId.slice(0, 6)})
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <p>No mentors you're collaborating with yet.</p>
//       )}
//     </div>
//   );
// }

// export default MentorProfile;
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
  const [myAcceptedMentorRequests, setMyAcceptedMentorRequests] = useState([]); // NEW

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
        setMyAcceptedMentorRequests([]);
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
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMentorCollabRequests(requests);

      const accepted = await Promise.all(
        requests
          .filter(req => req.status === 'accepted')
          .map(async req => {
            const mentorDoc = await getDoc(doc(db, 'users', req.requesterId));
            return {
              chatId: req.id,
              mentorEmail: mentorDoc.exists() ? mentorDoc.data().email : 'Unknown Mentor',
            };
          })
      );
      setAcceptedMentors(accepted);
    });

    return () => unsubscribe();
  }, [userId]);

  // 🔥 NEW: Get mentors this user requested and was accepted
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'mentorRequests'),
      where('requesterId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, async snapshot => {
      const accepted = await Promise.all(
        snapshot.docs
          .filter(doc => doc.data().status === 'accepted')
          .map(async docSnap => {
            const data = docSnap.data();
            const mentorDoc = await getDoc(doc(db, 'users', data.mentorId));
            return {
              chatId: docSnap.id,
              mentorEmail: mentorDoc.exists() ? mentorDoc.data().email : 'Unknown Mentor',
            };
          })
      );
      setMyAcceptedMentorRequests(accepted);
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

      {mentorCollabRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentor Collaboration Requests (Incoming)</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mentorCollabRequests.map(req => (
              <li key={req.id} style={{ border: '1px solid #ccc', marginBottom: '12px', padding: '10px', borderRadius: '6px' }}>
                <p><b>From Mentor ID:</b> {req.requesterId}</p>
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

      {acceptedMentors.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentors Who Requested You</h3>
          <ul>
            {acceptedMentors.map(m => (
              <li key={m.chatId}>
                Mentor: <b>{m.mentorEmail}</b> (Chat ID: {m.chatId.slice(0, 6)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {myAcceptedMentorRequests.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Mentors You're Collaborating With</h3>
          <ul>
            {myAcceptedMentorRequests.map(m => (
              <li key={m.chatId}>
                Mentor: <b>{m.mentorEmail}</b> (Chat ID: {m.chatId.slice(0, 6)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MentorProfile;
