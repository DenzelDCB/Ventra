// import Mentor from './mentor-dgrm.png'
import '../App.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="App" style={{ padding: '2rem' }}>
      {/* Optional: Uncomment if you want to use the image */}
      {/* <div style={{ textAlign: 'center' }}>
        <img src={Mentor} alt="Mentor helping Mentee(s)" style={{ width: '300px' }} />
      </div> */}

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Reach your goals with experienced mentors.
      </h1>

      <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
        Whether you're just getting started or looking to grow, our platform connects you with mentors who can help guide your journey.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/signup">
          <button style={buttonStyle}>Get Started</button>
        </Link>
        <Link to="/mentors">
          <button style={{ ...buttonStyle, backgroundColor: '#ddd', color: '#333' }}>
            Browse Mentors
          </button>
        </Link>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#000',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background 0.3s ease',
};

export default Home;
