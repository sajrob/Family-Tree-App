import React from "react";
import Tree from "react-d3-tree";

function FamilyTreeVisualization({ members }) {
  // Convert members data to the format expected by react-d3-tree
  const treeData = convertMembersToTreeData(members);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Tree data={treeData} />
    </div>
  );
}

function convertMembersToTreeData(members) {
  // Create a map of all members for easy lookup
  const memberMap = new Map(members.map((m) => [m.id, { ...m, children: [] }]));

  // Find the root members (those without parents in the tree)
  const rootMembers = members.filter(
    (m) => !m.relationships.some((r) => r.type === "Child")
  );

  // Build the tree structure
  rootMembers.forEach((member) => buildFamilyTree(member, memberMap));

  // If there's only one root, return it directly
  if (rootMembers.length === 1) {
    return memberMap.get(rootMembers[0].id);
  }

  // If there are multiple roots, create a dummy root
  return {
    name: "Family Tree",
    children: rootMembers.map((m) => memberMap.get(m.id)),
  };
}

function buildFamilyTree(member, memberMap) {
  const node = memberMap.get(member.id);

  // Add spouse
  const spouse = member.relationships.find((r) => r.type === "Spouse");
  if (spouse) {
    const spouseNode = memberMap.get(spouse.memberId);
    if (spouseNode) {
      node.spouse = {
        name: spouseNode.name,
        attributes: {
          dob: spouseNode.dob,
          dod: spouseNode.date_of_death,
        },
      };
    }
  }

  // Add children
  const children = member.relationships
    .filter((r) => r.type === "Parent")
    .map((r) => memberMap.get(r.memberId))
    .filter(Boolean);

  children.forEach((child) => {
    const childNode = buildFamilyTree(child, memberMap);
    node.children.push(childNode);
  });

  return {
    name: node.name,
    attributes: {
      dob: node.dob,
      dod: node.date_of_death,
    },
    spouse: node.spouse,
    children: node.children,
  };
}

export default FamilyTreeVisualization;
