import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function MemberProfile({ members, onDelete }) {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.memberId;
  const member = members.find(m => m.id === memberId);

  if (!member) {
    return <div>Error: Member not found.</div>;
  }

  const handleDelete = () => {
    onDelete(memberId);
    const popup = document.createElement('div');
    popup.innerText = 'Family Member Deleted';
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.right = '20px';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    popup.style.color = 'white';
    popup.style.padding = '10px';
    popup.style.borderRadius = '5px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
    navigate('/tree');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-10">
      <h3 className="text-2xl font-semibold mb-4">{member.name}</h3>
      <p><strong>Date of Birth:</strong> {member.dob}</p>
      <p><strong>Date of Death:</strong> {member.dateOfDeath || 'Alive'}</p>
      <p><strong>Relationships:</strong></p>
      <ul className="list-disc pl-5">
        {member.relationships && member.relationships.map((relationship, index) => (
          <li key={index}>
            {relationship.type}: {members.find(m => m.id === relationship.memberId)?.name || 'Unknown'}
          </li>
        ))}
      </ul>
      {member.image && (
        <div className="flex justify-center mt-4">
          <img
            src={URL.createObjectURL(member.image)}
            alt={member.name}
            className="w-32 h-32 object-cover rounded-full border-4 border-gray-400"
          />
        </div>
      )}
      <div className="flex justify-center">
        <button 
          onClick={handleDelete} 
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
        >
          Delete Profile
        </button>
      </div>
    </div>
  );
}

export default MemberProfile;
