import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteButton from "./SiteButton";
import { addFamilyMember, updateFamilyMember } from "../api";

function FamilyMemberForm({ members, setMembers, isEditing, memberToEdit }) {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [date_of_death, setdate_of_death] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAlive, setIsAlive] = useState(true);
  const [relationships, setRelationships] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && memberToEdit) {
      const [first, ...rest] = memberToEdit.name.split(" ");
      setFirstName(first);
      setSurname(rest.join(" "));
      // Format the date to YYYY-MM-DD for input type="date"
      setDob(
        memberToEdit.dob
          ? new Date(memberToEdit.dob).toISOString().split("T")[0]
          : ""
      );
      setdate_of_death(
        memberToEdit.date_of_death
          ? new Date(memberToEdit.date_of_death).toISOString().split("T")[0]
          : ""
      );
      setIsAlive(!memberToEdit.date_of_death);
      setRelationships(memberToEdit.relationships || []);
      // Handle image if needed
      if (memberToEdit.image) {
        setImagePreview(memberToEdit.image);
        setImage(memberToEdit.image);
      }
    }
  }, [isEditing, memberToEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = `${firstName} ${surname}`.trim();
    let imageData = image;

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    if (image instanceof File) {
      imageData = await convertToBase64(image);
    }

    const memberData = {
      name: fullName,
      dob: dob ? new Date(dob).toISOString() : null,
      date_of_death: isAlive
        ? null
        : date_of_death
        ? new Date(date_of_death).toISOString()
        : null,
      image: imageData,
      relationships,
    };

    try {
      let response;
      if (isEditing) {
        response = await updateFamilyMember(memberToEdit.id, memberData);
      } else {
        response = await addFamilyMember(memberData);
      }
      console.log(
        `Member ${isEditing ? "updated" : "added"} successfully:`,
        response
      );

      // Update the members state with the new data, including reciprocal relationships
      setMembers((prevMembers) => {
        const updatedMembers = isEditing
          ? prevMembers.map((m) => (m.id === memberToEdit.id ? response : m))
          : [...prevMembers, response];

        // Update reciprocal relationships
        return updatedMembers.map((m) => {
          if (
            m.id !== response.id &&
            response.relationships.some((r) => r.memberId === m.id)
          ) {
            const reciprocalRelationship = response.relationships.find(
              (r) => r.memberId === m.id
            );
            const reciprocalType = getReciprocalRelationType(
              reciprocalRelationship.type
            );
            return {
              ...m,
              relationships: [
                ...m.relationships.filter((r) => r.memberId !== response.id),
                { type: reciprocalType, memberId: response.id },
              ],
            };
          }
          return m;
        });
      });

      // Navigate to the tree page
      navigate("/tree");
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} family member:`,
        error
      );
    }
  };

  const addRelationship = () => {
    setRelationships([...relationships, { type: "", memberId: "" }]);
  };

  const updateRelationship = (index, key, value) => {
    const newRelationships = [...relationships];
    newRelationships[index][key] = value;
    setRelationships(newRelationships);
  };

  const removeRelationship = (index) => {
    const relationshipToRemove = relationships[index];
    const newRelationships = relationships.filter((_, i) => i !== index);
    setRelationships(newRelationships);

    // Remove the reciprocal relationship
    setMembers((prevMembers) => {
      return prevMembers.map((member) => {
        if (member.id === relationshipToRemove.memberId) {
          return {
            ...member,
            relationships: member.relationships.filter(
              (r) => r.memberId !== (isEditing ? memberToEdit.id : null)
            ),
          };
        }
        return member;
      });
    });
  };

  // Add this function to explicitly use imagePreview
  const renderImagePreview = () => {
    if (imagePreview) {
      return (
        <div className="w-32 h-32 mx-auto mb-2 overflow-hidden rounded-full">
          <img
            src={imagePreview}
            alt="Member preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  };

  // Update this function to use 'Parent' instead of 'Mother' and 'Father'
  const getReciprocalRelationType = (type) => {
    const reciprocalTypes = {
      Parent: "Child",
      Child: "Parent",
      Sibling: "Sibling",
      Spouse: "Spouse",
      Grandparent: "Grandchild",
      Grandchild: "Grandparent",
      Aunt: "Niece/Nephew",
      Uncle: "Niece/Nephew",
      Niece: "Aunt/Uncle",
      Nephew: "Aunt/Uncle",
      Cousin: "Cousin",
      PotatoLeaf: "PotatoLeaf",
    };
    return reciprocalTypes[type] || type;
  };

  return (
    <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-1 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-5">
              {isEditing ? "Edit" : "Add"} a Family Member
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Surname"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                  <label className="absolute left-3 -top-2.5 text-gray-600 text-sm bg-white px-1">
                    Date of Birth
                  </label>
                </div>
                <div className="relative flex-1">
                  <div className="flex items-center h-full">
                    <input
                      type="checkbox"
                      id="alive"
                      checked={isAlive}
                      onChange={(e) => setIsAlive(e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="alive" className="text-gray-700">
                      Alive
                    </label>
                  </div>
                </div>
              </div>
              {!isAlive && (
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={date_of_death}
                    onChange={(e) => setdate_of_death(e.target.value)}
                  />
                  <label className="absolute left-3 -top-2.5 text-gray-600 text-sm bg-white px-1 ">
                    Date of Death
                  </label>
                </div>
              )}
              <div className="relative">
                {renderImagePreview()}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
              </div>
              <div className="relative">
                {/* <h4 className="text-lg font-semibold mb-2">Relationships</h4> */}
                {relationships.map((relationship, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={relationship.type}
                      onChange={(e) =>
                        updateRelationship(index, "type", e.target.value)
                      }
                      className="w-1/2 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                      required
                    >
                      <option value="" disabled>
                        Select Relationship
                      </option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Grandchild">Grandchild</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Niece">Niece</option>
                      <option value="Nephew">Nephew</option>
                      <option value="Cousin">Cousin</option>
                      <option value="PotatoLeaf">Potato Leaf</option>
                    </select>
                    <span className="py-2 text-gra-700 italic">to</span>
                    <select
                      value={relationship.memberId}
                      onChange={(e) =>
                        updateRelationship(index, "memberId", e.target.value)
                      }
                      className="w-1/2 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                      required
                    >
                      <option value="" disabled>
                        Select Related Member
                      </option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeRelationship(index)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRelationship}
                  className="bg-gray-300 text-gray-800 p-2 rounded w-full hover:bg-gray-400 transition-colors"
                  //px-4 py-2
                >
                  Add Relationship
                </button>
              </div>

              <div className="flex justify-between">
                <SiteButton type="submit" color="blue">
                  {isEditing ? "Update" : "Add"} Member
                </SiteButton>
                <SiteButton
                  type="button"
                  color="red"
                  onClick={() => navigate("/tree")}
                >
                  Cancel
                </SiteButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FamilyMemberForm;
