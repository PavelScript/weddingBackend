const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');
const { Sequelize } = require('sequelize');

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins (adjust as needed)
app.use(express.json()); // Parse JSON bodies

let Answer;

async function initializeDatabase() {
  try {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database/answers.db', // SQLite database file
    });

    // Define the Answers model
    Answer = sequelize.define('answers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false, // Required field
      },
      coming: {
        type: Sequelize.BOOLEAN,
        allowNull: false, // Required field
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
    });

    // Synchronize the model with the database
    await sequelize.sync({ alter: true }); // Use `alter: true` for development purposes only
    console.log('Database and tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing the database:', err);
    throw err; // Re-throw the error to handle it at a higher level
  }
}

// Initialize the database and start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

// GET /guests: Show all guests' responses
app.get('/guests', async (req, res) => {
  try {
    if (!Answer) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const answers = await Answer.findAll(); // Fetch all records from the 'answers' table
    res.json(answers); // Send the fetched data as JSON response
  } catch (err) {
    console.error('Error fetching guests:', err);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// POST /api/guests: Submit an RSVP
app.post('/api/guests', async (req, res) => {
  try {
    if (!Answer) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const { name, coming, location } = req.body;

    // Validate input data
    if (
      !name ||
      typeof name !== 'string' ||
      typeof coming !== 'boolean' ||
      (location !== undefined && typeof location !== 'string')
    ) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Create a new record in the 'answers' table
    await Answer.create({
      name,
      coming,
      location, // Optional field
    });

    res.status(201).json({ message: 'RSVP submitted successfully' });
  } catch (err) {
    console.error('Error processing RSVP:', err);
    res.status(500).json({ error: 'Failed to process RSVP' });
  }
});