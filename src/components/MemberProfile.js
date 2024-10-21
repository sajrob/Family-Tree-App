import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SiteButton from "./SiteButton";
import placeholderImage from "../assets/placeholderPic.jpg"; // Make sure this path is correct
import { deleteFamilyMember, getFamilyMembers } from "../api";

function MemberProfile({ members, setMembers }) {
  const location = useLocation();
  const navigate = useNavigate();
  const member = location.state?.member;
  const [allMembers, setAllMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const fetchedMembers = await getFamilyMembers();
        setAllMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching all family members:", error);
      }
    };
    fetchAllMembers();
  }, []);

  console.log("Member data:", member);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">No member data available.</p>
        <SiteButton onClick={() => navigate("/tree")} color="blue">
          Family Tree
        </SiteButton>
      </div>
    );
  }

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFamilyMember(member.id);
      setMembers((prevMembers) =>
        prevMembers.filter((m) => m.id !== member.id)
      );
      navigate("/tree");
    } catch (error) {
      console.error("Error deleting member:", error);
    }
    setShowDeleteModal(false);
  };

  const getImageSrc = (image) => {
    if (!image) return placeholderImage;
    if (typeof image === "string") return image;
    return placeholderImage;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleRelatedMemberClick = (relatedMember) => {
    navigate(`/profile/${relatedMember.id}`, {
      state: { member: relatedMember },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-6 max-w-md w-full">
        <img
          src={getImageSrc(member.image)}
          alt={member.name}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold text-center mb-4">{member.name}</h2>
        <div className="space-y-2">
          <p>
            <strong>Date of Birth:</strong> {formatDate(member.dob)}
          </p>
          {member.date_of_death ? (
            <p>
              <strong>Date of Death:</strong> {formatDate(member.date_of_death)}
            </p>
          ) : (
            <p>
              <strong>Living Status:</strong> Alive
            </p>
          )}
          <p>
            <strong>Status:</strong>{" "}
            {member.date_of_death ? "Deceased" : "Alive"}
          </p>

          {member.relationships && member.relationships.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Relationships</h3>
              <ul className="list-disc list-inside">
                {member.relationships.map((rel, index) => {
                  const relatedMember = allMembers.find(
                    (m) => m.id === rel.memberId
                  );
                  return (
                    <li key={index}>
                      <span className="italic text-gray-600">
                        {rel.type} to
                      </span>{" "}
                      {relatedMember ? (
                        <button
                          onClick={() =>
                            handleRelatedMemberClick(relatedMember)
                          }
                          className="text-blue-800 hover:underline focus:outline-none"
                        >
                          {relatedMember.name}
                        </button>
                      ) : (
                        "Unknown"
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p>
              <strong>Relationships:</strong> No relationships added yet.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <SiteButton onClick={() => navigate("/tree")} color="blue">
            Family Tree
          </SiteButton>
          <SiteButton
            onClick={() =>
              navigate(`/edit/${member.id}`, { state: { member } })
            }
            color="yellow"
          >
            Edit Profile
          </SiteButton>
          <SiteButton onClick={handleDelete} color="red">
            Delete Member
          </SiteButton>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-6">
                Are you sure you want to delete {member.name}'s profile?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberProfile;
