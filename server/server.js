const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected successfully", time: rows[0].now });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Database connection failed", details: error.message });
  }
});

// Helper function to get the reciprocal relationship type
function getReciprocalRelationType(type) {
  const reciprocals = {
    Parent: "Child",
    Child: "Parent",
    Sibling: "Sibling",
    Spouse: "Spouse",
    Grandparent: "Grandchild",
    Grandchild: "Grandparent",
    "Aunt/Uncle": "Niece/Nephew",
    "Niece/Nephew": "Aunt/Uncle",
    Cousin: "Cousin",
    PotatoLeaf: "PotatoLeaf",
  };
  return reciprocals[type] || "Other";
}

// API routes will be added here
//........................................................................................................................
// Get all family members
app.get("/api/family-members", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM family_members");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new family member
app.post("/api/family-members", async (req, res) => {
  //console.log('Received data on server:', req.body);
  const { name, dob, date_of_death, image, relationships } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO family_members (id, name, dob, date_of_death, image, relationships) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5) RETURNING *",
      [name, dob, date_of_death, image, JSON.stringify(relationships)]
    );
    //console.log("Inserted row:", rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error inserting into database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a family member
app.put("/api/family-members/:id", async (req, res) => {
  const { id } = req.params;
  const { name, dob, date_of_death, image, relationships } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update the current family member
    const { rows } = await client.query(
      "UPDATE family_members SET name = $1, dob = $2, date_of_death = $3, image = $4, relationships = $5 WHERE id = $6 RETURNING *",
      [name, dob, date_of_death, image, JSON.stringify(relationships), id]
    );

    // Update reciprocal relationships
    for (const relationship of relationships) {
      const relatedMemberId = relationship.memberId;
      const reciprocalType = getReciprocalRelationType(relationship.type);

      // Get the related member's current relationships
      const { rows: relatedMemberRows } = await client.query(
        "SELECT relationships FROM family_members WHERE id = $1",
        [relatedMemberId]
      );

      if (relatedMemberRows.length > 0) {
        let relatedMemberRelationships =
          relatedMemberRows[0].relationships || [];

        // Remove any existing relationship with the current member
        relatedMemberRelationships = relatedMemberRelationships.filter(
          (rel) => rel.memberId !== id
        );

        // Add the new reciprocal relationship
        relatedMemberRelationships.push({ type: reciprocalType, memberId: id });

        // Update the related member's relationships
        await client.query(
          "UPDATE family_members SET relationships = $1 WHERE id = $2",
          [JSON.stringify(relatedMemberRelationships), relatedMemberId]
        );
      }
    }

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating family member:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Delete a family member
app.delete("/api/family-members/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM family_members WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
