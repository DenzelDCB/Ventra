import React, { useState } from 'react';
import { auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRole } from './RoleContext';

export let logOutb = false;

sessionStorage.setItem('user', auth.currentUser?.email || 'Previewer');

function Home() {
  let [selectedSkills, setSelectedSkills] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const { setRole } = useRole(); 

const handleSignUp = async () => {
  const numericAge = parseInt(age);

  // Validate email
  if (!email) {
    alert("Please enter your email.");
    return;
  }

  // Validate password
  if (!password || password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Validate age
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
      if (!selectedSkills || selectedSkills.length === 0) {
        alert('You need at least 1 area of expertise.');
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
    }

    else if (age >= 11 && age <= 25) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role: finalRole,
      });

      setRole(finalRole);
      alert(`Signed up as a ${finalRole}. Please reload page.`);
    }

    else if (finalRole === 'mentee') {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role: 'mentee',
        skills: selectedSkills,
      });

      setRole(finalRole);
      alert(`Signed up as a ${finalRole}`);
    }

    else {
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
      <h1>Welcome to Vetra</h1>
      <p>Create an account or log in to continue.</p>

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <s>- </s>
      <input
        type="password"
        placeholder="Password: *********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <s>- </s>
      <input
        type="number"
        placeholder="Your age (Not needed for Log in)"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={{ width: 210 }}
      />
      <br /><br />
      <button onClick={handleSignUp} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Sign Up</button> <b> or </b> <button onClick={handleSignIn} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Log In</button> 
      <br /><br />
      {auth.currentUser && <button onClick={logOut} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Log Out</button>}
      <br />
      {showRoleChoice && (
        <div>
          <p>You are eligible to be a mentor or a mentee. Choose your role:</p>
          <button onClick={() => { setRole('mentor'); proceedToSignUp('mentor'); }} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentor</button>
          <button onClick={() => proceedToSignUp('mentee')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid black' }}>Mentee</button>
      <br /><br />
      <div style={{width: '500px', border: '1px solid black', margin: '5px', padding: '5px', borderRadius: '4px',}}> 
          <label>Please choose your best area of expertise. Max 5. Min 1</label>
          <hr />
          <h3>Programming</h3>
        <hr />
        <div><label>Software Engineer (Back-End): </label>
        <input
        type="checkbox"
        name="skills"
        value="Software Engineer (Backend Developer)"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Software Engineer (Backend Developer)")}
        disabled={!selectedSkills.includes("Software Engineer (Backend Developer)") && selectedSkills.length >= 5}
        />
        </div>
        <div><label>Software Engineer (Front-End): </label>
        <input
        type="checkbox"
        name="skills"
        value="Software Engineer (Frontend Developer)"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Software Engineer (Frontend Developer)")}
        disabled={!selectedSkills.includes("Software Engineer (Frontend Developer)") && selectedSkills.length >= 5}
        />
        </div>
        <div><label>Software Engineer (Full-Stack): </label>
        <input
        type="checkbox"
        name="skills"
        value="Software Engineer (Full Stack Developer)"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Software Engineer (Full Stack Developer)")}
        disabled={!selectedSkills.includes("Software Engineer (Full Stack Developer)") && selectedSkills.length >= 5}
        />
        </div>      
        <div><label>DevOps: </label>
        <input
        type="checkbox"
        name="skills"
        value="DevOps"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("DevOps")}
        disabled={!selectedSkills.includes("DevOps") && selectedSkills.length >= 5}
        />
        </div>   
        <div><label>Java Developer: </label>
        <input
        type="checkbox"
        name="skills"
        value="Java Developer"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Java Developer")}
        disabled={!selectedSkills.includes("Java Developer") && selectedSkills.length >= 5}
        />
        
        </div>   
        <div><label>JavaScript Developer: </label>
        <input
        type="checkbox"
        name="skills"
        value="JavaScript Developer"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("JavaScript Developer")}
        disabled={!selectedSkills.includes("JavaScript Developer") && selectedSkills.length >= 5}
        />
        
        </div>  
        <div><label>Python Developer: </label>
        <input
        type="checkbox"
        name="skills"
        value="Python Developer"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Python Developer")}
        disabled={!selectedSkills.includes("Python Developer") && selectedSkills.length >= 5}
        />
        </div>  
        <h3>ML & AI</h3>
        <hr />
        <div><label>Machine Learning Analyst: </label>
        <input
        type="checkbox"
        name="skills"
        value="Machine Learning Analyst"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Machine Learning Analyst")}
        disabled={!selectedSkills.includes("Machine Learning Analyst") && selectedSkills.length >= 5}
        />
        </div>  
        <div><label>Deep Learning Analyst: </label>
        <input
        type="checkbox"
        name="skills"
        value="Deep Learning Analyst"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Deep Learning Analyst")}
        disabled={!selectedSkills.includes("Deep Learning Analyst") && selectedSkills.length >= 5}
        />
        </div> 
        <div><label>Data Science Analyst: </label>
        <input
        type="checkbox"
        name="skills"
        value="Data Science Analyst"
        onChange={handleSkillChange}
        checked={selectedSkills.includes("Data Science Analyst")}
        disabled={!selectedSkills.includes("Data Science Analyst") && selectedSkills.length >= 5}
        />
        </div>
        </div>
        </div>
      )}
      <p>Logging in might take a while, as well as signing up.</p>
    </div>
  );
}

// export { logOut };
export default Home;
