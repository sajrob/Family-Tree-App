import React, { useState } from 'react';
import { Route, Link, Routes, useLocation } from 'react-router-dom';
import Form from './Form';
import FamilyTree from './FamilyTree';
import EditProfile from './EditProfile';
import MemberProfile from './MemberProfile'; // Import the new component
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const location = useLocation();

  const handleFormSubmit = (member) => {
    setFamilyMembers((prevMembers) => [...prevMembers, { ...member, id: uuidv4() }]);
  };

  const handleUpdateMember = (updatedMember) => {
    setFamilyMembers((prevMembers) => {
      const updatedMembers = prevMembers.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      );

      // Update the related member's relationship if applicable
      updatedMember.relationships.forEach(relationship => {
        if (relationship.memberId) {
          const relatedMemberIndex = updatedMembers.findIndex(member => member.id === relationship.memberId);
          if (relatedMemberIndex !== -1) {
            const relatedMember = updatedMembers[relatedMemberIndex];
            
            // Ensure relationships is initialized
            if (!relatedMember.relationships) {
              relatedMember.relationships = []; // Initialize if undefined
            }

            // Determine the inverse relationship type
            let inverseType;
            switch (relationship.type) {
              case 'Parent':
                inverseType = 'Child';
                break;
              case 'Child':
                inverseType = 'Parent';
                break;
              case 'Sibling':
                inverseType = 'Sibling'; // Sibling remains the same
                break;
              case 'Spouse':
                inverseType = 'Spouse'; // Spouse remains the same
                break;
              case 'Grandparent':
                inverseType = 'Grandchild';
                break;
              case 'Grandchild':
                inverseType = 'Grandparent';
                break;
              case 'Aunt/Uncle':
                inverseType = 'Niece/Nephew'; // Assuming a simple relationship
                break;
              case 'Cousin':
                inverseType = 'Cousin'; // Cousin remains the same
                break;
              case 'Other':
                inverseType = 'Other'; // Other remains the same
                break;
              default:
                inverseType = 'Other'; // Default case
            }

            // Update the relationship in the related member's profile
            const existingRelationship = relatedMember.relationships.find(r => r.memberId === updatedMember.id);
            if (existingRelationship) {
              existingRelationship.type = inverseType; // Update to the inverse relationship type
            } else {
              // If no existing relationship, add it
              relatedMember.relationships.push({ type: inverseType, memberId: updatedMember.id });
            }
          }
        }
      });

      return updatedMembers;
    });
  };

  const handleDelete = (memberId) => {
    setFamilyMembers((prevMembers) => prevMembers.filter(member => member.id !== memberId)); // Logic to delete the member by memberId
    console.log(`Deleting member with ID: ${memberId}`);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 text-gray-800">
      {location.pathname === '/' && (
        <h1 className="text-6xl font-bold mb-6">Family Tree App</h1>
      )}
      {location.pathname === '/tree' && (
        <h1 className="text-6xl font-bold mb-6">The Family</h1>
      )}
      <div className="flex space-x-4 mb-6">
        <Link to="/form">
          <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
            Add Family Member
          </button>
        </Link>
        <Link to="/tree">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
            View Family Tree
          </button>
        </Link>
      </div>
      <Routes>
        <Route path="/form" element={<Form onSubmit={handleFormSubmit} members={familyMembers} />} />
        <Route path="/tree" element={<FamilyTree members={familyMembers} setMembers={setFamilyMembers} />} />
        <Route path="/edit" element={<EditProfile onUpdate={handleUpdateMember} members={familyMembers} />} />
        <Route path="/profile" element={<MemberProfile members={familyMembers} onDelete={handleDelete} />} /> {/* Add the new route */}
      </Routes>
    </div>
  );
}

export default App;