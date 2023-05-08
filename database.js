import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
console.log('##log process env vars: '+JSON.stringify(process.env));
const { Pool } = pkg;

export { createTables, addUserToDatabase, getUserByNameAndIdentifier };

const connectionString = decodeURIComponent(process.env.DATABASE_URL);
console.log('##connectionString: ' + JSON.stringify(connectionString));
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        ID SERIAL PRIMARY KEY,
        PHONE TEXT,
        NAME TEXT,
        FACE TEXT,
        STATUS TEXT,
        IDENTIFIER TEXT UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS Contacts (
        ID SERIAL PRIMARY KEY,
        USERID INTEGER REFERENCES Users(ID),
        CONTACTUSERID INTEGER REFERENCES Users(ID)
      );
      
      CREATE TABLE IF NOT EXISTS Messages (
        ID SERIAL PRIMARY KEY,
        SENDER INTEGER REFERENCES Users(ID),
        PARTICIPANTS INTEGER REFERENCES Users(ID),
        CONTENT TEXT,
        TIMESTAMP TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const addUserToDatabase = async (user) => {
  try {
    console.log('Adding user to database:', JSON.stringify(user));
    const result = await pool.query(`
      INSERT INTO Users (PHONE, NAME, FACE, STATUS, IDENTIFIER)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ID;
    `, [user.phone, user.name, user.face, user.status, user.identifier]);

    return result.rows[0].id;
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
};

const getUserByNameAndIdentifier = async (name, identifier) => {
  try {
    console.log('Getting user by name and identifier:', JSON.stringify(name), + ' | ' + JSON.stringify(identifier));
    const result = await pool.query(`
      SELECT * FROM Users
      WHERE NAME = $1 AND IDENTIFIER = $2;
    `, [name, identifier]);

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user by name and identifier:', error);
    throw error;
  }
};