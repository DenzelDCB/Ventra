import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; 

function NotAllowed() {
    const [userEmail, setUserEmail] = useState('Anonymous');
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUserEmail(user.email);
          } else {
            setUserEmail('Preview');
          }
        });
    
        return () => unsubscribe(); 
      }, []);

  return (
    <div className="App">
      <h2>Please ask a mentor in the mentor page, and then you will be able to meet them.</h2>
      <p>Your <i><b>{userEmail}</b> email does not have a current mentor.</i></p>
    </div>
  );
}

export default NotAllowed;
