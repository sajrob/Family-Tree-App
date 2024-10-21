import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getFamilyMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/family-members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching family members:", error);
    throw error;
  }
};

export const addFamilyMember = (member) =>
  axios.post(`${API_URL}/family-members`, member);

export const updateFamilyMember = async (id, memberData) => {
  try {
    const response = await axios.put(
      `${API_URL}/family-members/${id}`,
      memberData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating family member:", error);
    throw error;
  }
};

export const deleteFamilyMember = async (id) => {
  try {
    await axios.delete(`${API_URL}/family-members/${id}`);
  } catch (error) {
    console.error("Error deleting family member:", error);
    throw error;
  }
};

// export const deleteMember = async (id) => {
//   try {
//     const response = await axios.delete(`${API_URL}/family-members/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error deleting family member:', error);
//     throw error;
//   }
// };

export const getFamilyMember = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/family-members/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching family member:", error);
    throw error;
  }
};
