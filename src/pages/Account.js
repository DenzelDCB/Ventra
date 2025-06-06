import React, { useState } from 'react';
import { auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRole } from './RoleContext';
import { mentorSkills } from '../data/mentorSkills';

export let logOutb = false;

sessionStorage.setItem('user', auth.currentUser?.email || 'Previewer');

function Home() {
  const [lignip, setLignip] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const { setRole } = useRole();

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      if (selectedSkills.length < 3) {
        setSelectedSkills([...selectedSkills, value]);
      }
    } else {
      setSelectedSkills(selectedSkills.filter((skill) => skill !== value));
    }
  };

  const handleSignUp = async () => {
    const numericAge = parseInt(age);

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (isNaN(numericAge) || numericAge < 0) {
      alert("Please enter a valid age.");
      return;
    }

    if (numericAge < 11) {
      alert("Sorry, you must be at least 11 years old to sign up.");
      return;
    }

    sessionStorage.setItem('age', numericAge);

    if (numericAge <= 25) {
      setRole('mentee');
      proceedToSignUp('mentee');
    } else if (numericAge <= 90) {
      setShowRoleChoice(true);
    } else {
      alert("Please enter an age between 11 and 90.");
    }
  };

  const proceedToSignUp = async (finalRole) => {
    try {
      const ageStr = sessionStorage.getItem('age');
      const age = Number(ageStr);

      if (!age || age > 90) {
        alert("Please provide a valid age (1–90).");
        return;
      }

      if (age > 25 && finalRole !== 'mentee') {
        if (selectedSkills.length < 1 || selectedSkills.length > 3) {
          alert('You need to choose between 1 and 3 areas of expertise.');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          email,
          role: finalRole,
          skills: selectedSkills,
        });

        setRole(finalRole);
        alert(`Signed up as a ${finalRole}. Please reload page.`);
      } else if (age >= 11 && age <= 25) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          email,
          role: finalRole,
        });

        setRole(finalRole);
        alert(`Signed up as a ${finalRole}. Please reload page.`);
      } else if (finalRole === 'mentee') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          email,
          role: 'mentee',
          skills: selectedSkills,
        });

        setRole(finalRole);
        alert(`Signed up as a ${finalRole}`);
      } else {
        alert("Sorry, you must be at least 11 years old to sign up.");
      }
    } catch (error) {
      alert(error.message + ' 🔒');
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRole(userData.role);
        alert('You have been logged in. 🔓');
        logOutb = false;
        localStorage['logOutb'] = logOutb;
        window.location.reload();
        return logOutb;
      } else {
        alert("No user data found.");
      }
    } catch (error) {
      alert(error.message + '🔒');
    }
  };

  const logOut = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
        logOutb = true;
        localStorage['logOutb'] = logOutb;
        window.location.reload();
        return logOutb;
      }
    } catch (error) {
      alert(error.message + '🔒');
    }
  };

  return (
    <div>
      <h1>Welcome to Ventra</h1>
      <h3>Create an account or log in to continue.</h3>

      <div style={{
          margin: '15px 5px',
          padding: '5px',
          display: 'flex',
          gap: '15px',
          alignItems: 'left',
          justifyContent: 'left'
        }}>
        <button onClick={() => setLignip(0)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Log in</button>
        <button onClick={() => setLignip(1)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Sign up</button>
      </div>

      <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '5px',
          margin: '5px'
        }}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', borderRadius: '8px', border: '1px solid black', width: '350px' }}
        />
        <input
          type="password"
          placeholder="Password: *********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '8px', borderRadius: '8px', border: '1px solid black', width: '350px' }}
        />
        {lignip === 1 && (
          <input
            type="number"
            placeholder="Your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ width: '100%', maxWidth: '210px', padding: '8px', borderRadius: '8px', border: '1px solid black' }}
          />
        )}
      </div>
      <br />
      {lignip === 1 && (
        <button onClick={handleSignUp} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>Sign Up</button>
      )}
      {lignip === 0 && (
        <button onClick={handleSignIn} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>Log In</button>
      )}
      <br /><br />
      {auth.currentUser && <button onClick={logOut} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>Log Out</button>}
      <br />
      {showRoleChoice && (
        <div>
          <p>You are eligible to be a mentor or a mentee. Choose your role:</p>
          <button onClick={() => { setRole('mentor'); proceedToSignUp('mentor'); }} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentor</button>
          <button onClick={() => proceedToSignUp('mentee')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentee</button>
          <br /><br />
          <div style={{width: '500px', border: '1px solid black', margin: '5px', padding: '5px', borderRadius: '4px',}}>
            <label>Please choose between 1 and 3 areas of expertise.</label>
            <hr />

            {Array.from(new Set(mentorSkills.map(skill => skill.category))).map(category => (
              <div key={category}>
                <h3>{category}</h3>
                <hr />
                {mentorSkills.filter(skill => skill.category === category).map(skill => (
                  <div key={skill.value}>
                    <label>{skill.label}: </label>
                    <input
                      type="checkbox"
                      name="skills"
                      value={skill.value}
                      onChange={handleSkillChange}
                      checked={selectedSkills.includes(skill.value)}
                      disabled={!selectedSkills.includes(skill.value) && selectedSkills.length >= 3}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
