import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import placeholderImage from "../assets/placeholderPic.jpg";
import SiteButton from "./SiteButton";
import FamilyTreeVisualization from "./FamilyTreeVisualization";

function FamilyTree({ members, setMembers }) {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const hasMembers = members.length > 0;
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    // Force a re-render when the component mounts or members change
    setIsLoaded(false);
    setTimeout(() => setIsLoaded(true), 0);
  }, [members]);

  console.log("FamilyTree rendered. Members:", members);

  // Function to generate a color from a string (surname)
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Generate a map of surnames to colors
  const surnameColors = useMemo(() => {
    const colorMap = {};
    members.forEach((member) => {
      if (member.name) {
        const surname = member.name.split(" ").slice(-1)[0];
        if (!colorMap[surname]) {
          colorMap[surname] = stringToColor(surname);
        }
      }
    });
    return colorMap;
  }, [members]);

  const handleMemberClick = (member) => {
    navigate(`/profile/${member.id}`, { state: { member } });
  };

  const getImageSrc = (image) => {
    if (!image) return placeholderImage;
    if (typeof image === "string") return image;
    return placeholderImage;
  };

  const calculateAge = (dob, dod) => {
    const birthDate = new Date(dob);
    const endDate = dod ? new Date(dod) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && endDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!isLoaded) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div>
      <button onClick={() => setShowVisualization(!showVisualization)}>
        {showVisualization ? "Show Grid View" : "Show Tree Visualization"}
      </button>

      {showVisualization ? (
        <FamilyTreeVisualization members={members} />
      ) : (
        // <div>Tree Visualization</div>
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-white to-gray-200 p-4 overflow-x-hidden">
          <h2 className="text-3xl font-bold mb-6 text-blue-800">Family Tree</h2>
          {!hasMembers ? (
            <div className="text-center">
              <p className="mb-4 text-lg text-gray-600">
                No family members added yet. <br />
                Add Family Members to get started.
              </p>
              <SiteButton to="/form" color="green">
                Add Family Member
              </SiteButton>
            </div>
          ) : (
            <div className="w-full max-w-7xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 auto-rows-fr">
                {members.map((member, index) => {
                  // Ensure we're working with the correct data structure
                  const memberData = member.data || member;

                  const dobYear = memberData.dob
                    ? new Date(memberData.dob).getFullYear()
                    : "N/A";
                  const dodYear = memberData.date_of_death
                    ? new Date(memberData.date_of_death).getFullYear()
                    : "Present";
                  const age = calculateAge(
                    memberData.dob,
                    memberData.date_of_death
                  );
                  const name = memberData.name || "New Member";
                  const surname = name.split(" ").slice(-1)[0];
                  const borderColor = surnameColors[surname] || "#000000";

                  return (
                    <div
                      key={memberData.id || index}
                      className="flex flex-col items-center justify-start transition-transform duration-200 transform hover:scale-105 cursor-pointer p-2"
                      onClick={() => handleMemberClick(memberData)}
                    >
                      <div
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-2 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2"
                        style={{ borderColor: borderColor }}
                      >
                        <img
                          src={getImageSrc(memberData.image)}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-center text-gray-800 mb-1 line-clamp-2">
                        {name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 text-center">
                        {dobYear} - {dodYear}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        Age: {age}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FamilyTree;
