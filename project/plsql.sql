-- #############################
-- CREATE Movie
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateMovie;

DELIMITER //
CREATE PROCEDURE sp_CreateMovie(
    IN m_title VARCHAR(145), 
    IN m_genre VARCHAR(145), 
    IN m_duration INT, 
    OUT m_id INT)
BEGIN
    INSERT INTO Movies (title, genre, duration) 
    VALUES (m_title, m_genre, m_duration);

    -- Store the ID of the last inserted row
    SELECT LAST_INSERT_ID() into m_id;
    -- Display the ID of the last inserted movie.
    SELECT LAST_INSERT_ID() AS 'new_id';

    -- Example of how to get the ID of the newly created person:
        -- CALL sp_CreatePerson('Theresa', 'Evans', 2, 48, @new_id);
        -- SELECT @new_id AS 'New Person ID';
END //
DELIMITER ;


-- #############################
-- UPDATE Movie
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateMovie;

DELIMITER //
CREATE PROCEDURE sp_UpdateMovie(IN m_id INT, IN m_title VARCHAR(145), IN m_genre VARCHAR(145), IN m_duration INT)

BEGIN
    UPDATE Movies SET title = m_title, genre = m_genre, duration = m_duration WHERE movieID = m_id; 
END //
DELIMITER ;


-- #############################
-- DELETE Movie
-- #############################
DROP PROCEDURE IF EXISTS sp_DeleteMovie;

DELIMITER //
CREATE PROCEDURE sp_DeleteMovie(IN m_id INT)
BEGIN
    DECLARE error_message VARCHAR(255); 

    -- error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Roll back the transaction on any error
        ROLLBACK;
        -- Propogate the custom error message to the caller
        RESIGNAL;
    END;

    START TRANSACTION;
        -- Deleting corresponding rows from both bsg_people table and 
        --      intersection table to prevent a data anamoly
        -- This can also be accomplished by using an 'ON DELETE CASCADE' constraint
        --      inside the bsg_cert_people table.
        DELETE FROM Showtimes WHERE movieID = m_id;
        DELETE FROM Movies WHERE movieID = m_id;

        -- ROW_COUNT() returns the number of rows affected by the preceding statement.
        IF ROW_COUNT() = 0 THEN
            set error_message = CONCAT('No matching record found in Movies for id: ', m_id);
            -- Trigger custom error, invoke EXIT HANDLER
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_message;
        END IF;

    COMMIT;

END //
DELIMITER ;


-- #############################
-- UPDATE Screen
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateScreen;

DELIMITER //
CREATE PROCEDURE sp_UpdateScreen(IN s_id INT, IN s_screenNumber INT, IN s_seatingCapacity INT)

BEGIN
    UPDATE Screens
    SET screenNumber = s_screenNumber,
        seatingCapacity = s_seatingCapacity
    WHERE screenID = s_id;
END //
DELIMITER ;

-- #############################
-- CREATE Screen
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateScreen;

DELIMITER //
CREATE PROCEDURE sp_CreateScreen(
    IN s_screenNumber INT, 
    IN s_seatingCapacity INT, 
    OUT s_id INT)
BEGIN
    INSERT INTO Screens (screenNumber, seatingCapacity) 
    VALUES (s_screenNumber, s_seatingCapacity);

    -- Store the ID of the last inserted row
    SELECT LAST_INSERT_ID() into s_id;
    -- Display the ID of the last inserted movie.
    SELECT LAST_INSERT_ID() AS 'new_id';

END //
DELIMITER ;


-- #############################
-- UPDATE Customer
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateCustomer;

DELIMITER //
CREATE PROCEDURE sp_UpdateCustomer(IN c_id INT, IN c_name varchar(145), IN c_email varchar(145))

BEGIN
    UPDATE Customers SET name = c_name, email = c_email WHERE customerID = c_id; 
END //
DELIMITER ;

-- #############################
-- CREATE Customer
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateCustomer;

DELIMITER //
CREATE PROCEDURE sp_CreateCustomer(
    IN c_name VARCHAR(145), 
    IN c_email VARCHAR(145), 
    OUT c_id INT)
BEGIN
    INSERT INTO Customers (name, email) 
    VALUES (c_name, c_email);

    SELECT LAST_INSERT_ID() into c_id;
    SELECT LAST_INSERT_ID() AS 'new_id';

END //
DELIMITER ;



-- #############################
-- UPDATE Showtime
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateShowtime;

DELIMITER //
CREATE PROCEDURE sp_UpdateShowtime(IN sh_id INT, IN sh_date DATE, IN sh_time TIME, IN sh_movieID INT, IN sh_screenID INT)

BEGIN
    UPDATE Showtimes SET showDate = sh_date, startTime = sh_time, movieID = sh_movieID, screenID = sh_screenID WHERE showtimeID = sh_id; 
END //
DELIMITER ;

-- #############################
-- CREATE Showtime
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateShowtime;

DELIMITER //
CREATE PROCEDURE sp_CreateShowtime(
    IN sh_date DATE, 
    IN sh_time TIME,
    IN sh_movieID INT,
    IN sh_screenID INT, 
    OUT sh_id INT)
BEGIN
    INSERT INTO Showtimes (showDate, startTime, movieID, screenID) 
    VALUES (sh_date, sh_time, sh_movieID, sh_screenID);

    SELECT LAST_INSERT_ID() into sh_id;
    SELECT LAST_INSERT_ID() AS 'new_id';

END //
DELIMITER ;


-- #############################
-- UPDATE Ticket
-- #############################
DROP PROCEDURE IF EXISTS sp_UpdateTicket;

DELIMITER //
CREATE PROCEDURE sp_UpdateTicket(IN t_id INT, IN t_buyDate DATETIME, IN t_price DECIMAL(5,2), IN t_showID INT, IN t_customerID INT)

BEGIN
    UPDATE Tickets SET purchaseDate = t_buyDate, ticketPrice = t_price, showtimeID = t_showID, customerID = t_customerID WHERE ticketID = t_id; 
END //
DELIMITER ;

-- #############################
-- CREATE Ticket
-- #############################
DROP PROCEDURE IF EXISTS sp_CreateTicket;

DELIMITER //
CREATE PROCEDURE sp_CreateTicket(
    IN t_buyDate DATETIME, 
    IN t_price DECIMAL(5,2),
    IN t_showID INT,
    IN t_customerID INT, 
    OUT t_id INT)
BEGIN
    INSERT INTO Tickets (purchaseDate, ticketPrice, showtimeID, customerID) 
    VALUES (t_buyDate, t_price, t_showID, t_customerID);

    SELECT LAST_INSERT_ID() into t_id;
    SELECT LAST_INSERT_ID() AS 'new_id';

END //
DELIMITER ;