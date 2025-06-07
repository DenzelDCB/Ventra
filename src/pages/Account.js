import React, { useState } from 'react';
import { auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DiceCaptcha from '../data/DiceCAPTCHA'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
  const [captchaValid, setCaptchaValid] = useState(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [error, setError] = useState('');
  const [verify, verifyNote] = useState('')
  const { setRole } = useRole();
  
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      if (selectedSkills.length < 3) {
        setSelectedSkills([...selectedSkills, value]);
      }
    } else {
      setSelectedSkills(selectedSkills.filter(skill => skill !== value));
    }
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };
  const showVerify = (msg) => {
    verifyNote(msg);
    setTimeout(() => verifyNote(''),5000)
  };

  
  const handleSubmit = e => {
    e.preventDefault();
    if (!captchaValid) {
      showError('Please complete the CAPTCHA correctly.');
      return;
    }
    showVerify('Sign up successful! (replace with your logic)');
  };
  
  const handleSignUp = async () => {
    const numericAge = parseInt(age);
    if (!email) return showError("Please enter your email.");
    if (!password || password.length < 6) return showError("Password must be at least 6 characters long.");
    if (isNaN(numericAge)) return showError("Please enter a valid age.");
    if (numericAge < 11 || numericAge > 90) return showError("Age must be between 11 and 90.");

    sessionStorage.setItem('age', numericAge);
    if (numericAge <= 25) {
      setRole('mentee');
      proceedToSignUp('mentee');
    } else {
      setShowRoleChoice(true);
    }
  };

  const proceedToSignUp = async (finalRole) => {
    try {
      const age = Number(sessionStorage.getItem('age'));
      if (!age || age > 90) return showError("Please provide a valid age (11–90).");

      if (age > 25 && finalRole !== 'mentee') {
        if (selectedSkills.length < 1 || selectedSkills.length > 3) {
          return showError('Choose between 1 and 3 skills.');
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role: finalRole,
        ...(finalRole === 'mentor' && { skills: selectedSkills })
      });

      setRole(finalRole);
      showVerify(`Verification email sent. Please check your inbox.`);
    } catch (error) {
      showError(error.message + ' 🔒');
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        showError("Email must be verified before logging in.");
        return;
      }

      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRole(userData.role);
        logOutb = false;
        localStorage['logOutb'] = logOutb;
        window.location.reload();
      } else {
        showError("No user data found.");
      }
    } catch (error) {
      showError(error.message + ' 🔒');
    }
  };

  const logOut = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
        logOutb = true;
        localStorage['logOutb'] = logOutb;
        window.location.reload();
      }
    } catch (error) {
      showError(error.message + ' 🔒');
    }
  };

  const skillsByCategory = mentorSkills.reduce((acc, skill) => {
    (acc[skill.category] = acc[skill.category] || []).push(skill);
    return acc;
  }, {});

  return (
    <div>
      <h1>Welcome to Ventra</h1>
      <h3>Create an account or log in to continue.</h3>

      <div style={{ margin: '15px 5px', padding: '5px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => setLignip(0)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            border: '0px',
            backgroundColor: lignip === 0 ? 'lightgreen' : 'lightgray',
            color: 'black',
          }}
        >
          Log in
        </button>
        <button
          onClick={() => setLignip(1)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            border: '0px',
            backgroundColor: lignip === 1 ? 'lightgreen' : 'lightgray',
            color: 'black',
          }}
        >
          Sign up
        </button>
      </div>

      {error && (
        <div style={{
          color: 'white',
          backgroundColor: 'darkred',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '400px',
          margin: '10px 0'
        }}>{error}</div>
      )}
      {verify && (
        <div style={{
          color: 'black',
          backgroundColor: 'lightgreen',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '400px',
          margin: '10px 0'
        }}>{verify}</div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '8px',
        margin: '5px',
        border: '1px solid black',
        borderRadius: '8px',
        width: '400px',
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
            min="11"
            max="90"
            onChange={(e) => setAge(e.target.value)}
            style={{ width: '100%', maxWidth: '210px', padding: '8px', borderRadius: '8px', border: '1px solid black' }}
          />
        )}
        {lignip === 1 && (<DiceCaptcha onVerify={setCaptchaValid} />)}
      </div>

      <br />
      {lignip === 1 && (
        <button onClick={handleSignUp} disabled={!captchaValid} style={{ padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>
          Sign Up
        </button>
      )}
      {lignip === 0 && (
        <button onClick={handleSignIn} style={{ padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>
          Log In
        </button>
      )}

      <br /><br />
      {auth.currentUser && <button onClick={logOut} style={{ padding: '8px', borderRadius: '8px', border: '1px solid black', margin: '5px' }}>Log Out</button>}

      <br />
      {showRoleChoice && (
        <div>
          <p>You are eligible to be a mentor or a mentee. Choose your role:</p>
          <button onClick={() => { setRole('mentor'); proceedToSignUp('mentor'); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentor</button>
          <button onClick={() => proceedToSignUp('mentee')} style={{ padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentee</button>

          <div style={{ width: 'auto', border: '1px solid black', margin: '10px 0', padding: '10px', borderRadius: '4px' }}>
            <label>Please choose between 1 and 3 areas of expertise.</label>
            <hr />
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <h3>{category}</h3>
                <hr />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                  {skills.map(skill => (
                    <div key={skill.value} style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        name="skills"
                        value={skill.value}
                        onChange={handleSkillChange}
                        checked={selectedSkills.includes(skill.value)}
                        disabled={!selectedSkills.includes(skill.value) && selectedSkills.length >= 3}
                        style={{ marginRight: '5px' }}
                      />
                      <label>{skill.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
