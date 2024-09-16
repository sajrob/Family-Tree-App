import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from './assets/placeholderPic.jpg';

function FamilyTree({ members, setMembers }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setSelectedMember(null);
  };

  const handleViewProfile = () => {
    if (selectedMember) {
      handleClosePopup();
      navigate('/profile', { state: { memberId: selectedMember.id } });
    }
  };

  const handleEditProfile = () => {
    if (selectedMember) {
      handleClosePopup();
      navigate('/edit', { state: { member: selectedMember } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-gray-700 rounded-lg p-6">
      {members.length === 0 ? (
        <p className="bg-white shadow-md text-center rounded-lg p-6 max-w-md w-full">
          No family members added yet. <br />
          Click the <span className="text-green-500">Add Family Member</span> button to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {members.map((member) => {
            const dobYear = member.dob ? new Date(member.dob).getFullYear() : 'N/A';
            const dodYear = member.dateOfDeath ? new Date(member.dateOfDeath).getFullYear() : 'N/A';
            return (
              <div 
                key={member.id} 
                className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center transition-transform duration-200 transform hover:scale-105 cursor-pointer"
                onClick={() => handleMemberClick(member)}
              >
                <img
                  src={member.image ? URL.createObjectURL(member.image) : placeholderImage}
                  alt={member.name}
                  className="w-32 h-32 object-cover rounded-full border-4 border-blue-400 mb-4" //this is where the colour around the image is
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">
                  {member.dateOfDeath ? `${dobYear} - ${dodYear}` : `${dobYear} - Alive`}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Options for {selectedMember.name}</h3>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleViewProfile} className="bg-blue-500 text-white py-2 px-4 rounded">View Profile</button>
              <button onClick={handleEditProfile} className="bg-yellow-500 text-white py-2 px-4 rounded">Edit Profile</button>
            </div>
            <button onClick={handleClosePopup} className="mt-4 text-gray-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyTree;