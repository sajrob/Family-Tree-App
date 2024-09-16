import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Form({ onSubmit, members }) {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [image, setImage] = useState(null);
  const [isAlive, setIsAlive] = useState(true);
  const [relationships, setRelationships] = useState([]); // Change to array
  const [relatedMemberId, setRelatedMemberId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullName = `${firstName} ${surname}`.trim();
    onSubmit({ 
      name: fullName, 
      dob, 
      dateOfDeath: isAlive ? null : dateOfDeath, 
      image, 
      relationships, // Submit the array of relationships
      relatedMemberId 
    });
    // Reset form fields
    setFirstName('');
    setSurname('');
    setDob('');
    setDateOfDeath('');
    setImage(null);
    setIsAlive(true);
    setRelationships([]); // Reset relationships
    setRelatedMemberId('');
    navigate('/tree');
  };

  const addRelationship = () => {
    setRelationships([...relationships, { type: '', memberId: '' }]);
  };

  const updateRelationship = (index, key, value) => {
    const newRelationships = [...relationships];
    newRelationships[index][key] = value;
    setRelationships(newRelationships);
  };

  const removeRelationship = (index) => {
    const newRelationships = relationships.filter((_, i) => i !== index);
    setRelationships(newRelationships);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-10">
      <h3 className="text-2xl font-semibold mb-4">Add a new family member</h3>
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter First Name"
          className="border border-gray-300 p-2 rounded w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Surname"
          className="border border-gray-300 p-2 rounded w-full"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
        <input
          type="date"
          className="border border-gray-300 p-2 rounded w-full"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="alive"
            checked={isAlive}
            onChange={(e) => setIsAlive(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="alive" className="text-gray-700">Alive</label>
        </div>
        {!isAlive && (
          <input
            type="date"
            className="border border-gray-300 p-2 rounded w-full"
            value={dateOfDeath}
            onChange={(e) => setDateOfDeath(e.target.value)}
          />
        )}
        <h4 className="text-lg font-semibold">Relationships</h4>
        {relationships.map((relationship, index) => (
          <div key={index} className="flex space-x-2">
            <select
              value={relationship.type}
              onChange={(e) => updateRelationship(index, 'type', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
              required
            >
              <option value="" disabled>Select Relationship</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Spouse">Spouse</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Aunt/Uncle">Aunt/Uncle</option>
              <option value="Cousin">Cousin</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={relationship.memberId}
              onChange={(e) => updateRelationship(index, 'memberId', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
              required
            >
              <option value="" disabled>Select Related Member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => removeRelationship(index)} className="bg-red-500 text-white p-2 rounded">X</button>
          </div>
        ))}
        <button type="button" onClick={addRelationship} className="bg-green-500 text-white p-2 rounded">Add Relationship</button>
        <input
          type="file"
          className="border border-gray-300 p-2 rounded w-full"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Add Member
        </button>
      </form>
    </div>
  );
}

export default Form;