import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Home from './pages/Home';
import Account from './pages/Account';
import Chat from './pages/Chat';
import MentorProfile from './pages/MentorProfiles';
import MenteeDashboard from './pages/MenteeDashboard';
import userEmail from './pages/MenteeDashboard';
import SearchMentors from './pages/MentorSearch';
import { RoleProvider, useRole } from './pages/RoleContext';
import './App.css';

const logOutb = localStorage.getItem('logOutb');

const AppContent = ({ page, setPage }) => {
  const { role, setRole } = useRole();
  const user = auth.currentUser;
  const isVerified = user?.emailVerified;

  useEffect(() => {
    const fetchRoleIfNeeded = async () => {
      if (!role && user) {
        const uid = user.uid;
        const docRef = doc(db, 'users', uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role);
          sessionStorage['role'] = data.role;
        }
      }
    };
    fetchRoleIfNeeded();
  }, [role, setRole, user]);

  const showMentorButton = role === 'mentor' && sessionStorage['role'] === 'mentor' && isVerified && userEmail && userEmail !== 'Previewer';
  const showMenteeButton = role === 'mentee' && sessionStorage['role'] === 'mentee' && isVerified && userEmail && userEmail !== 'Previewer';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setPage('home1')} style={{border: '0px', backgroundColor: 'white', }}>Home</button>
        {showMentorButton && (
          <button onClick={() => setPage('mentor1')} style={{border: '0px', backgroundColor: 'white', }}>Mentor Profile</button>
        )}
        {showMenteeButton && logOutb !== 'true' && (
          <button onClick={() => setPage('mentee1')} style={{border: '0px', backgroundColor: 'white', }}>Mentee Dashboard</button>
        )}
        {role && userEmail && isVerified && (
          <button onClick={() => setPage('chat1')} style={{border: '0px', backgroundColor: 'white', }}>Chat</button>
        )}
        {role && userEmail && isVerified && (<button onClick={() => setPage('search1')} style={{border: '0px', backgroundColor: 'white', }}>Search Mentors</button>)}
        <button onClick={() => setPage('home2')} style={{background: "linear-gradient('lightblue', 'lightgrey')", border: '1px solid black';}}>Sign Up | Log in</button>
      </div>
      <hr />
      {page === 'home1' && <Home />}
      {page === 'home2' && <Account />}
      {page === 'mentor1' && showMentorButton && <MentorProfile />}
      {page === 'mentee1' && showMenteeButton && <MenteeDashboard />}
      {page === 'chat1' && <Chat />}
      {page === 'search1' && <SearchMentors />}
    </div>
  );
};

function App() {
  const [page, setPage] = useState('home1');

  return (
    <RoleProvider>
      <AppContent page={page} setPage={setPage} />
    </RoleProvider>
  );
}

export default App;
