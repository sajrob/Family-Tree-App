import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import FamilyTree from './components/FamilyTree';
import MemberProfile from './components/MemberProfile';
import SiteButton from './components/SiteButton';
import FamilyMemberForm from './components/FamilyMemberForm';
import { getFamilyMembers } from './api';

// This component will handle both adding and editing
function FamilyMemberFormWrapper({ members, setMembers }) {
  const { id } = useParams();
  const memberToEdit = id ? members.find(m => m.id === id) : null;

  return (
    <FamilyMemberForm 
      members={members} 
      setMembers={setMembers} 
      isEditing={!!memberToEdit}
      memberToEdit={memberToEdit}
    />
  );
}

function App() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const fetchedMembers = await getFamilyMembers();
        setMembers(Array.isArray(fetchedMembers) ? fetchedMembers : []);
      } catch (error) {
        console.error('Error fetching family members:', error);
        setMembers([]);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="App min-h-screen bg-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to Family Tree</h1>
              <p className="text-xl">Start building your family history today!</p>
            </div>
            <div className="flex space-x-4">
              <SiteButton to="/form" color="green">Add Family Member</SiteButton>
              <SiteButton to="/tree" color="blue">View Family Tree</SiteButton>
            </div>
          </div>
        } />
        <Route path="/form" element={<FamilyMemberFormWrapper members={members} setMembers={setMembers} />} />
        <Route path="/edit/:id" element={<FamilyMemberFormWrapper members={members} setMembers={setMembers} />} />
        <Route path="/tree" element={<FamilyTree members={members} setMembers={setMembers} />} />
        <Route path="/profile/:id" element={<MemberProfile members={members} setMembers={setMembers} />} />
      </Routes>
    </div>
  );
}

export default App;
