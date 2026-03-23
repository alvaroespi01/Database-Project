// ########################################
// ########## SETUP

// Express
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 37545;

// Database
const db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars'); // Import express-handlebars engine
app.engine('.hbs', engine({ extname: '.hbs' })); // Create instance of handlebars
app.set('view engine', '.hbs'); // Use handlebars engine for *.hbs files.

// ########################################
// ########## ROUTE HANDLERS

// READ ROUTES
app.get('/', async function (req, res) {
    try {
        res.render('home'); // Render the home.hbs file
    } catch (error) {
        console.error('Error rendering page:', error);
        // Send a generic error message to the browser
        res.status(500).send('An error occurred while rendering the page.');
    }
});

// Movies Page
app.get('/Movies', async function (req, res) {
    try {
        // Create and execute our queries
        const movieQuery = `SELECT movieID, title, genre, duration 
                FROM Movies ORDER BY title ASC`;
        const movieDropdown = `SELECT movieID, concat(movieID, ' - ', title) as display, title, genre, duration FROM Movies ORDER BY movieID ASC`;
        
        const [movieList] = await db.query(movieDropdown);
        const [movie] = await db.query(movieQuery);

        // Render the bsg-people.hbs file, and also send the renderer
        //  an object that contains our bsg_people and bsg_homeworld information
        res.render('Movies/Movies', { movie: movie, movieList:movieList });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Screens Page
app.get('/Screens', async function (req, res) {
    try {
        // Create and execute our queries
        const screensQuery = `SELECT screenID, screenNumber, seatingCapacity 
                FROM Screens ORDER BY screenID ASC`;

        const [screen] = await db.query(screensQuery);

        res.render('Screens/Screens', { screen: screen });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Customers Page
app.get('/Customers', async function (req, res) {
    try {
        const customersQuery = `SELECT customerID, concat(customerID, " - ", name) as display, name, email 
                FROM Customers ORDER BY customerID`;

        const [customer] = await db.query(customersQuery);

        res.render('Customers/Customers', { customer: customer });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Showtimes Page
app.get('/Showtimes', async function (req, res) {
    try {
        // Create and execute our queries
        const showtimesQuery = 
            `SELECT 
                showtimeID, 
                concat(showtimeID, " - ", Movies.title, " - ", startTime) as display, 
                showDate, 
                startTime, 
                Movies.movieID AS movieID,
                Movies.title AS movieTitle, 
                Screens.screenID AS screenID,
                Screens.screenNumber AS screenNumber 
                FROM Showtimes 
                    JOIN Movies ON Showtimes.movieID = Movies.movieID 
                    JOIN Screens on Showtimes.screenID = Screens.screenID 
                ORDER BY showDate, startTime ASC`;
        const movieDropdown = `SELECT * FROM Movies ORDER BY title ASC`;
        const screenDropdown = `SELECT * FROM Screens ORDER BY screenID ASC`;
        
        const [movieList] = await db.query(movieDropdown);
        const [screenList] = await db.query(screenDropdown);
        const [showtime] = await db.query(showtimesQuery);

        res.render('Showtimes/Showtimes', { showtime:showtime, movieList:movieList, screenList:screenList });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Tickets
app.get('/Tickets', async function (req, res) {
    try {
        // Create and execute our queries
        const ticketQuery = 
            `SELECT 
                ticketID, 
                purchaseDate,
                ticketPrice, 
                Showtimes.showtimeID AS showtimeID,
                CONCAT(Movies.title,' - ', Showtimes.showDate,' ',Showtimes.startTime) AS showtimeLabel, 
                Customers.customerID as customerID,
                Customers.name AS customerName 
                FROM Tickets 
                    JOIN Showtimes ON Tickets.showtimeID = Showtimes.showtimeID 
                    JOIN Movies ON Showtimes.movieID = Movies.movieID 
                    JOIN Customers ON Tickets.customerID = Customers.customerID 
                ORDER BY Customers.name ASC, purchaseDate DESC`;
        const showtimeDropdown = `SELECT showtimeID, CONCAT(Movies.title,' - ', showDate,' ',startTime) AS showtimeLabel
                FROM Showtimes JOIN Movies on Showtimes.movieID = Movies.movieID
                ORDER BY showdate, showtimeLabel, startTime ASC;`;
        const customerDropdown = `SELECT * FROM Customers ORDER BY name;`;

        const [ticket] = await db.query(ticketQuery);
        const [showtime] = await db.query(showtimeDropdown);
        const [customer] = await db.query(customerDropdown);

        res.render('Tickets/Tickets', { ticket: ticket, showtime:showtime, customer:customer});
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Create a Movie
app.post('/Movies/addMovie', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;

        // Cleanse data - If the duration isn't a number, make it NULL.
        // if (isNaN(parseInt(data.create_person_duration)))
        //     data.create_person_duration = null;

        // Create and execute our queries
        // Using parameterized queries (Prevents SQL injection attacks)
        const query1 = `CALL sp_CreateMovie(?, ?, ?, @new_id);`;

        // Store ID of last inserted row
        const [[[rows]]] = await db.query(query1, [
            data.create_movie_title,
            data.create_movie_genre,
            data.create_movie_duration,
        ]);

        // Redirect the user to the updated webpage
        res.redirect('/Movies');
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Update a Movie
app.post('/Movies/update', async function (req, res) {
    try {
        const data = req.body;

        const query1 = 'CALL sp_UpdateMovie(?, ?, ?, ?);';
        const query2 = 'SELECT title, genre, duration FROM Movies WHERE movieID = ?;';

        await db.query(query1, [
            data.update_movie,
            data.update_movie_title,
            data.update_movie_genre,
            data.update_movie_duration,
        ]);
        const [[rows]] = await db.query(query2, [data.update_movie]);

        res.redirect('/Movies');
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Delete Movie
app.post('/Movies/delete', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_DeleteMovie(?);`;
        await db.query(query1, [data.delete_movie_id]);

        res.redirect('/Movies');
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Create a screen
app.post('/Screens/addScreen', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_CreateScreen(?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query1, [
            data.create_screen_num,
            data.create_screen_capacity,
        ]);

        res.redirect('/Screens');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const screensQuery = `SELECT screenID, screenNumber, seatingCapacity 
                FROM Screens ORDER BY screenID ASC`;

            const [screen] = await db.query(screensQuery);

            return res.render('Screens/Screens', {
                screen: screen,
                addError: "Screen number already exists.",
                layout: 'main'
            });     
        }

        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Update a Screen
app.post('/Screens/update', async function (req, res){
try {
        const data = req.body;

        const query1 = 'CALL sp_UpdateScreen(?, ?, ?);';
        const query2 = 'SELECT screenNumber, seatingCapacity FROM Screens WHERE screenID = ?;';
        await db.query(query1, [
            data.update_screen,
            data.update_screen_num,
            data.update_screen_capacity,
        ]);
        const [[rows]] = await db.query(query2, [data.update_screen]);

        res.redirect('/Screens');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const screensQuery = `SELECT screenID, screenNumber, seatingCapacity 
                FROM Screens ORDER BY screenID ASC`;

            const [screen] = await db.query(screensQuery);

            return res.render('Screens/Screens', {
                screen: screen,
                updateError: "Screen number already exists.",
                layout: 'main'
            });     
        }

        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Create a Customer
app.post('/Customers/addCustomer', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_CreateCustomer(?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query1, [
            data.create_name,
            data.create_email,
        ]);

        res.redirect('/Customers');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const customersQuery = `SELECT customerID, name, email 
                FROM Customers ORDER BY name ASC`;

            const [customer] = await db.query(customersQuery);

            return res.render('Customers/Customers', {
                customer: customer,
                addError: "Email already exists.",
                layout: 'main'
            });     
        }

        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Update a Customer
app.post('/Customers/update', async function (req, res){
try {
        const data = req.body;

        const query1 = 'CALL sp_UpdateCustomer(?, ?, ?);';
        const query2 = 'SELECT name, email FROM Customers WHERE customerID = ?;';
        await db.query(query1, [
            data.update_customer,
            data.update_name,
            data.update_email,
        ]);
        const [[rows]] = await db.query(query2, [data.update_customer]);

        res.redirect('/Customers');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const customersQuery = `SELECT customerID, name, email 
                FROM Customers ORDER BY name ASC`;

            const [customer] = await db.query(customersQuery);

            return res.render('Customers/Customers', {
                customer: customer,
                updateError: "Email already exists.",
                layout: 'main'
            });     
        }

        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Update a Showtime
app.post('/Showtimes/update', async function (req, res){
try {
        const data = req.body;

        const query1 = 'CALL sp_UpdateShowtime(?, ?, ?, ?, ?);';
        const query2 = 'SELECT showDate, startTime, movieID, screenID FROM Showtimes WHERE showtimeID = ?;';
        await db.query(query1, [
            data.update_showtime,
            data.update_showtime_date,
            data.update_showtime_time,
            data.update_showtime_movie,
            data.update_showtime_screen,
        ]);
        const [[rows]] = await db.query(query2, [data.update_showtime]);

        res.redirect('/Showtimes');
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Create a Showtime
app.post('/Showtimes/addShowtime', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_CreateShowtime(?, ?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query1, [
            data.create_showtime_date,
            data.create_showtime_time,
            data.create_showtime_movie,
            data.create_showtime_screen,
        ]);

        res.redirect('/Showtimes');
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// Update a Ticket
app.post('/Tickets/update', async function (req, res){
try {
        const data = req.body;

        const query1 = 'CALL sp_UpdateTicket(?, ?, ?, ?, ?);';
        const query2 = 'SELECT purchaseDate, ticketPrice, showtimeID, customerID FROM Tickets WHERE ticketID = ?;';
        await db.query(query1, [
            data.update_ticket,
            data.update_ticket_date,
            data.update_ticket_price,
            data.update_ticket_showtime,
            data.update_ticket_customer,
        ]);
        const [[rows]] = await db.query(query2, [data.update_ticket]);

        res.redirect('/Tickets');
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


// Create a Ticket
app.post('/Tickets/addTicket', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_CreateTicket(?, ?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query1, [
            data.create_ticket_date,
            data.create_ticket_price,
            data.create_ticket_showtime,
            data.create_ticket_customer,
        ]);

        res.redirect('/Tickets');
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});


app.get('/reset-table', async function (req, res) {
        console.log("Reset table route hit"); // add this
    try {
        const query1 = 'CALL sp_load_moviesdb();';
        await db.query(query1);
        res.redirect(req.headers.referer || '/');
    } catch (error) {
        console.error("Error executing PL/SQL:", error);
        // Send a generic error message to the browser
        res.status(500).send("An error occurred while executing the PL/SQL.");
    }
});


// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(
        'Express started on http://localhost:' +
            PORT +
            '; press Ctrl-C to terminate.'
    );
});

