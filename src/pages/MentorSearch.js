import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import defaultUser from './user-default.png';
import { useRole } from './RoleContext';

function MentorSearch() {
  const { role } = useRole();
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'mentor'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email,
          skills: Array.isArray(data.skills)
            ? data.skills
            : typeof data.skills === 'string'
              ? data.skills.split(',').map(s => s.trim())
              : []
        };
      });
      setMentors(list);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);


  const filtered = searchTerm
    ? mentors.filter(m =>
        m.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : mentors;

    const requestMentor = async mentor => {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to request a mentor.');
        return;
      }
      const requestId = `${mentor.id}__${user.uid}`;
      try {
        await setDoc(doc(db, 'mentorRequests', requestId), {
          mentorId: mentor.id, 
          menteeId: user.uid,  
          status: 'pending',
          createdAt: serverTimestamp()
        });
        alert(`Requested mentor ${mentor.email}.`);
      } catch (err) {
        console.error('Error requesting mentor:', err);
        alert('Failed to send request.');
      }
    };


  return (
    <div className="App">
      <h2>Mentors</h2>
      {loading && <p>Loading mentors...</p>}
      <input
        type="search"
        placeholder="Search by skill 🔍"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ margin: '10px', padding: '5px', width: '300px' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
        {filtered.length > 0 ? (
          filtered.map(m => (
            <div key={m.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px', height: '450px' }}>
              <img src={defaultUser} alt="Profile" />
              <p><strong>Email:</strong> <em>{m.email}</em></p>
              <ul style={{ textAlign: 'left' }}>
                {m.skills.length > 0
                  ? m.skills.map((sk, i) => (
                      <li key={i} style={{ marginBottom: '8px', margin: '10px', }}>
                        <span style={{ backgroundColor: '#D5D5D5FF', borderRadius: '16px', padding: '5px', margin: '10px',}}>
                          <small>{sk}</small>
                        </span>
                        <br />
                        <hr />
                      </li>
                    ))
                  : <li>No skills listed.</li>
                }
              </ul>
              {(
                <button
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', border: '1px solid black', }}
                  onClick={() => requestMentor(m)}
                >
                    {role === 'mentee' && 'Request Mentor'}{role === 'mentor' && 'Connect with Mentor'}
                </button>
              )}
            </div>
          ))
        ) : (
          !loading && <p>No mentors found. Create an account to view all mentors.</p>
        )}
      </div>
    </div>
  );
}

export default MentorSearch;
