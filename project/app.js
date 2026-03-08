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

app.get('/Movies', async function (req, res) {
    try {
        // Create and execute our queries
        const movieQuery = `SELECT movieID, title, genre, duration 
                FROM Movies ORDER BY title ASC`;
        const movieDropdown = `SELECT * FROM Movies ORDER BY movieID ASC`;
        
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

app.get('/Screens', async function (req, res) {
    try {
        // Create and execute our queries
        const screensQuery = `SELECT screenID, screenNumber, seatingCapacity 
                FROM Screens ORDER BY screenID ASC`;

        const [screen] = await db.query(screensQuery);

        // Render the bsg-people.hbs file, and also send the renderer
        //  an object that contains our bsg_people and bsg_homeworld information
        res.render('Screens/Screens', { screen: screen });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/Customers', async function (req, res) {
    try {
        const customersQuery = `SELECT customerID, name, email 
                FROM Customers ORDER BY name ASC`;

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

app.get('/Showtimes', async function (req, res) {
    try {
        // Create and execute our queries
        const showtimesQuery = `SELECT showtimeID, showDate, startTime, 
                Movies.title AS movieTitle, Screens.screenNumber AS screenNumber 
                FROM Showtimes 
                    JOIN Movies ON Showtimes.movieID = Movies.movieID 
                    JOIN Screens on Showtimes.screenID = Screens.screenID 
                ORDER BY showDate, startTime ASC`;
        const movieDropdown = `SELECT * FROM Movies ORDER BY title ASC`;
        const screenDropdown = `SELECT * FROM Screens ORDER BY screenID ASC`;
        
        const [movieList] = await db.query(movieDropdown);
        const [screenList] = await db.query(screenDropdown);
        const [showtime] = await db.query(showtimesQuery);

        // Render the bsg-people.hbs file, and also send the renderer
        //  an object that contains our bsg_people and bsg_homeworld information
        res.render('Showtimes/Showtimes', { showtime:showtime, movieList:movieList, screenList:screenList });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/Tickets', async function (req, res) {
    try {
        // Create and execute our queries
        const ticketQuery = `SELECT ticketID, purchaseDate,ticketPrice, 
                CONCAT(Movies.title,' - ', Showtimes.showDate,' ',Showtimes.startTime) AS showtimeLabel, 
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

        // Render the bsg-people.hbs file, and also send the renderer
        //  an object that contains our bsg_people and bsg_homeworld information
        res.render('Tickets/Tickets', { ticket: ticket, showtime:showtime, customer:customer});
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/EditCustomer', async function (req, res){
try {
        res.render('Customers/EditCustomer', { });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/EditShowtime', async function (req, res){
try {
        const movieDropdown = `SELECT * FROM Movies ORDER BY title ASC`;
        const screenDropdown = `SELECT * FROM Screens ORDER BY screenID ASC`;

        const [movieList] = await db.query(movieDropdown);
        const [screenList] = await db.query(screenDropdown);

        res.render('Showtimes/EditShowtime', { movieList:movieList, screenList:screenList});
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/EditTicket', async function (req, res){
try {
        const showtimeDropdown = `SELECT showtimeID, CONCAT(Movies.title,' - ', showDate,' ',startTime) AS showtimeLabel
                FROM Showtimes JOIN Movies on Showtimes.movieID = Movies.movieID
                ORDER BY showdate, showtimeLabel, startTime ASC;`;
        const customerDropdown = `SELECT * FROM Customers ORDER BY name;`;
       
        const [movieList] = await db.query(showtimeDropdown);
        const [customerList] = await db.query(customerDropdown);

        res.render('Tickets/EditTicket', { movieList:movieList, customerList:customerList });
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.post('/Movies/addMovie', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;

        // Cleanse data - If the duration isn't a number, make it NULL.
        if (isNaN(parseInt(data.create_person_duration)))
            data.create_person_duration = null;

        // Create and execute our queries
        // Using parameterized queries (Prevents SQL injection attacks)
        const query1 = `CALL sp_CreateMovie(?, ?, ?, @new_id);`;

        // Store ID of last inserted row
        const [[[rows]]] = await db.query(query1, [
            data.create_movie_title,
            data.create_movie_genre,
            data.create_movie_duration,
        ]);

        console.log(`CREATE Movie. ID: ${rows.new_id} ` +
            `Title: ${data.create_movie_title}`
        );

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

app.post('/Movies/update', async function (req, res) {
    try {
        // Parse frontend form information
        const data = req.body;

        // Cleanse data - If the duration isn't a number, make it NULL.
        if (isNaN(parseInt(data.update_movie_duration)))
            data.update_movie_duration = null;

        // Create and execute our query
        // Using parameterized queries (Prevents SQL injection attacks)
        const query1 = 'CALL sp_UpdateMovie(?, ?, ?, ?);';
        const query2 = 'SELECT title, genre, duration FROM Movies WHERE movieID = ?;';
        await db.query(query1, [
            data.update_movie,
            data.update_movie_title,
            data.update_movie_genre,
            data.update_movie_duration,
        ]);
        const [[rows]] = await db.query(query2, [data.update_movie]);

        console.log(`UPDATE Movie. ID: ${data.update_movie} ` +
            `Title: ${rows.title}`
        );

        // Redirect the user to the updated webpage data
        res.redirect('/Movies');
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

// DELETE ROUTES
app.post('/Movies/delete', async function (req, res) {
    try {
        // Parse frontend form information
        let data = req.body;

        // Create and execute our query
        // Using parameterized queries (Prevents SQL injection attacks)
        const query1 = `CALL sp_DeleteMovie(?);`;
        await db.query(query1, [data.delete_movie_id]);

        console.log(`DELETE Movie. ID: ${data.delete_movie_id} ` +
            `Name: ${data.delete_movie_title}`
        );

        // Redirect the user to the updated webpage data
        res.redirect('/Movies');
    } catch (error) {
        console.error('Error executing queries:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.post('/Screens/addScreen', async function (req, res) {
    try {
        let data = req.body;

        const query1 = `CALL sp_CreateScreen(?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query1, [
            data.create_screen_num,
            data.create_screen_capacity,
        ]);

        console.log(`CREATE Screen. ID: ${rows.new_id} ` +
            `Title: ${data.create_screen_num}`
        );

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

        console.log(`UPDATE Screen. ID: ${data.update_screen} ` + `Title: ${rows.screenNumber}`
        );

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

