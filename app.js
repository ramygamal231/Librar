const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');




const app = express();
app.use(session({
    secret: 'your-secret-key', // Replace with a strong, unique secret
    resave: false, // Do not save the session if it hasn't been modified
    saveUninitialized: false, // Do not create a session until something is stored
    cookie: { secure: false } // Use `true` only if HTTPS is enabled
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    console.log('Session Data:', req.session);
    next();
});



const path = require('path');

app.get('/auth/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({ loggedIn: true });
    } else {
        res.status(401).json({ loggedIn: false });
    }
});

app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbCon.query(sqlQuery, [email, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.user = results[0];
            res.send({ success: true });
        } else {
            res.send({ success: false });
        }
    });
});

app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const sqlQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    dbCon.query(sqlQuery, [name, email, password], (err) => {
        if (err) throw err;
        res.redirect('/home.html');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});

app.get('/read/:id', (req, res) => {
    const id = req.params.id;
    const sqlQuery = `SELECT * FROM books WHERE id = ${id}`;
    dbCon.query(sqlQuery, (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404).send('Book not found');
        } else {
            res.sendFile(path.join(__dirname, 'public', 'read.html'));
        }
    });
});

app.use(express.static(__dirname + '/public'));

// Now the files in the 'public' directory will be served


// createing a connection to MySQL DBMS
const dbCon = mysql.createConnection(
    {
      host     : 'localhost',
      user     : 'rami',
      password : 'webdev',
      database : 'online_library'
    }
  );
  
  dbCon.connect(function (err) { 
      if (err) throw err;
      console.log('Successfully connected with Database...');
  });


  app.post('/data/books', function (req, res) { 
    const book = {
        title: req.body.title,
        author: req.body.author,
        category: req.body.category,
        pdfUrl: req.body.pdfUrl,
        coverUrl: req.body.coverUrl
    };
    let sqlQuery = `INSERT INTO books (title, author, category, pdfUrl, coverUrl) 
        VALUES ('${book.title}', '${book.author}', '${book.category}', '${book.pdfUrl}', '${book.coverUrl}')`;
    dbCon.query(sqlQuery, function (err, results) { 
        if (err) throw err;
        res.redirect('/');
    });
});



app.get('/data/books', function (req, res) { 
    let sqlQuery = 'SELECT * FROM books';
    dbCon.query(sqlQuery, function (err, results) { // call back function
        if (err) throw err;
        res.send(results);
    });
});

app.get('/data/books/:id', function (req, res) {
    const id = req.params.id;
    const sqlQuery = `SELECT * FROM books WHERE id = ${id}`;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404).send({ error: 'Book not found' });
        } else {
            res.send(results[0]); // Send the first (and only) result
        }
    });
});

app.put('/data/books/:id', function (req, res) {
    const id = req.params.id;
    const { title, author, category, pdfUrl, coverUrl } = req.body;

    const sqlQuery = `
        UPDATE books 
        SET title = ?, author = ?, category = ?, pdfUrl = ?, coverUrl = ? 
        WHERE id = ?`;

    dbCon.query(sqlQuery, [title, author, category, pdfUrl, coverUrl, id], function (err, results) {
        if (err) throw err;
        if (results.affectedRows === 0) {
            res.status(404).send({ error: 'Book not found' });
        } else {
            res.send({ message: 'Book updated successfully!' });
        }
    });
});

app.get('/read/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    const sqlQuery = `SELECT * FROM books WHERE id = ${id}`;
    dbCon.query(sqlQuery, (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404).send('Book not found');
        } else {
            res.sendFile(path.join(__dirname, 'public', 'read.html'));
        }
    });
});


app.delete('/data/books/:id', function (req, res) { 
    let id = req.params.id;
    let sqlQuery = `DELETE FROM books WHERE id = ${id}`;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        if (results.affectedRows === 1)
            res.send({ result: 'success' });
        else
            res.send({ result: 'fail' });
    });
});

app.get('/data/featured-books', function (req, res) {
    const sqlQuery = `
        SELECT * FROM books LIMIT 6; 
    `;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        res.json(results); // This sends the books as JSON data to the frontend
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/data/fiction-books', function (req, res) {
    const sqlQuery = `
        SELECT * FROM books WHERE category = 'Fiction' LIMIT 6;
    `;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        res.json(results); // Sends the fiction books as JSON data to the frontend
    });
});

app.get('/data/business-books', function (req, res) {
    const sqlQuery = `
        SELECT * FROM books WHERE category = 'Business' LIMIT 6;
    `;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        res.json(results); // Sends the fiction books as JSON data to the frontend
    });
});

app.get('/data/history-books', function (req, res) {
    const sqlQuery = `
        SELECT * FROM books WHERE category = 'History' LIMIT 6;
    `;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        res.json(results); // Sends the fiction books as JSON data to the frontend
    });
});

app.get('/data/technology-books', function (req, res) {
    const sqlQuery = `
        SELECT * FROM books WHERE category = 'Technology' LIMIT 6;
    `;
    dbCon.query(sqlQuery, function (err, results) {
        if (err) throw err;
        res.json(results); // Sends the fiction books as JSON data to the frontend
    });
});

// For Sign Up
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    const sqlQuery = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    dbCon.query(sqlQuery, [name, email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to sign up. Please try again.");
        }
        res.redirect('/'); // Redirect to home page on success
    });
});

// For Login 
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbCon.query(sqlQuery, [email, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ success: true }); // Valid credentials
        } else {
            res.send({ success: false }); // Invalid credentials
        }
    });
});

app.get('/data/search', (req, res) => {
    const query = req.query.q; // Get the search query from the request
    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }

    const sqlQuery = `
        SELECT * FROM books 
        WHERE title LIKE ? OR author LIKE ? OR category LIKE ?
    `;
    const searchTerm = `%${query}%`; // Use wildcards for partial matches

    dbCon.query(sqlQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) throw err;
        res.json(results); // Send the search results as JSON
    });
});





// trying to get the PORT number from environment file, if present. Otherwise setting it to 3000
const PORT = 3000;

// starting the web server on PORT number
app.listen(PORT, () => console.log(`Listening on port ${PORT}...\nPress Ctrl + C to stop the server...`));