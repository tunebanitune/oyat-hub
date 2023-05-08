import { Pool } from 'pg';

export { createTables, addUserToDatabase };

const pool = new Pool({
  // Add your PostgreSQL connection details
  host: 'your_host',
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
  port: your_port,
});

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        ID SERIAL PRIMARY KEY,
        PHONE TEXT,
        NAME TEXT,
        FACE TEXT,
        STATUS TEXT
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
    const result = await pool.query(`
      INSERT INTO Users (PHONE, NAME))
      VALUES ($1, $2)
      RETURNING ID;
    `, [user.phone, user.name]);

    return result.rows[0].id;
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
};

