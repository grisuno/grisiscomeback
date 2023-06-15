const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;



// Configure SQLite database
// const db = new sqlite3.Database(':memory:'); // Change the database path as needed
const db = new sqlite3.Database('web');
// Create table for contact form data
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        status INTEGER
      )
    `);
  });

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views folder
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
  res.render('index');
});

// ...

// Contact form route
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const status = 1;
  
    // Insert form data into SQLite database
    db.run(
      'INSERT INTO contacts (name, email, message, createdAt, updatedAt, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, message, createdAt, updatedAt, status],
      function(err) {
        if (err) {
          console.error('Error inserting data into database', err);
          res.sendStatus(500);
        } else {
          // Retrieve the inserted row to get the auto-incremented ID
          const contactId = this.lastID;
          // Fetch the inserted contact from the database
          db.get('SELECT * FROM contacts WHERE id = ?', [contactId], (err, row) => {
            if (err) {
              console.error('Error fetching contact from database', err);
              res.sendStatus(500);
            } else {
              // Send the inserted contact as JSON response
              res.redirect('/');
            }
          });
        }
      }
    );
  });
  
  // ...
  
// Get all contacts route
app.get('/api/contacts', (req, res) => {
    // Fetch all contacts from the database
    db.all('SELECT * FROM contacts', (err, rows) => {
      if (err) {
        console.error('Error fetching contacts from database', err);
        res.sendStatus(500);
      } else {
        // Send the contacts as JSON response
        res.json(rows);
      }
    });
  });
// Handle not found routes
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

// Start the server
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
