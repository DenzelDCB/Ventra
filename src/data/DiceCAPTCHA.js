import React, { useState, useEffect } from 'react';

function DiceCaptcha({ onVerify }) {
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [rolled, setRolled] = useState(false);

  // Roll dice once at component load
  useEffect(() => {
    const rollDice = () => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
    };
    rollDice();
  }, []);

  const handleCheck = () => {
    const correctAnswer = die1 + die2;
    if (parseInt(userInput) === correctAnswer) {
      setMessage('✅ Verified!');
      onVerify(true);
    } else {
      setMessage('❌ Incorrect. Try again.');
      onVerify(false);
    }
    setRolled(true);
  };

  const diceUnicode = (value) => {
    const diceMap = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    return diceMap[value - 1] || '?';
  };

  return (
    <div style={{ fontSize: '24px' }}>
      <div>
        Roll Result: <span>{diceUnicode(die1)}</span> + <span>{diceUnicode(die2)}</span>
      </div>
      <label>
        Add the dice and enter the total: 
        <input
          type="number"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </label>
      <button onClick={handleCheck} style={{ marginLeft: '10px' }}>
        Submit
      </button>
      {rolled && <p>{message}</p>}
    </div>
  );
}

export default DiceCaptcha;
