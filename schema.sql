-- Blood Management System Schema
-- Database: blood_management_system

CREATE DATABASE IF NOT EXISTS blood_management_system;
USE blood_management_system;

-- 1. donor
CREATE TABLE IF NOT EXISTS donor (
    donor_id            INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    age                 INT NOT NULL CHECK (age >= 18 AND age <= 65),
    gender              ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group         ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
    contact_number      VARCHAR(15) NOT NULL UNIQUE,
    email               VARCHAR(100),
    address             TEXT,
    availability_status ENUM('Available', 'Not Available') NOT NULL DEFAULT 'Available',
    last_donated        DATE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_donor_blood_group        (blood_group),
    INDEX idx_donor_availability_status (availability_status)
);

-- 2. blood_bank
CREATE TABLE IF NOT EXISTS blood_bank (
    bloodbank_id     INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    city             VARCHAR(100) NOT NULL,
    contact_number   VARCHAR(15),
    email            VARCHAR(100),
    available_units  INT NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    blood_group      ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. hospital
CREATE TABLE IF NOT EXISTS hospital (
    hospital_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    contact_number  VARCHAR(15),
    email           VARCHAR(100),
    address         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. patient_request
CREATE TABLE IF NOT EXISTS patient_request (
    request_id      INT AUTO_INCREMENT PRIMARY KEY,
    patient_name    VARCHAR(100) NOT NULL,
    blood_group     ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-') NOT NULL,
    quantity_needed INT NOT NULL CHECK (quantity_needed > 0),
    hospital_id     INT NOT NULL,
    status          ENUM('Pending','Fulfilled','Cancelled') NOT NULL DEFAULT 'Pending',
    request_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id) ON DELETE RESTRICT,
    INDEX idx_request_blood_group (blood_group),
    INDEX idx_request_status      (status)
);

-- 5. donation_record
CREATE TABLE IF NOT EXISTS donation_record (
    donation_id      INT AUTO_INCREMENT PRIMARY KEY,
    donor_id         INT NOT NULL,
    bloodbank_id     INT NOT NULL,
    donation_date    DATE NOT NULL,
    quantity_donated INT NOT NULL CHECK (quantity_donated > 0),
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id)     REFERENCES donor(donor_id)         ON DELETE RESTRICT,
    FOREIGN KEY (bloodbank_id) REFERENCES blood_bank(bloodbank_id) ON DELETE RESTRICT
);

-- VIEW: active_donors
CREATE OR REPLACE VIEW active_donors AS
SELECT
    donor_id,
    name,
    age,
    gender,
    blood_group,
    contact_number,
    email,
    address,
    availability_status,
    last_donated,
    DATEDIFF(CURDATE(), last_donated) AS days_since_donation,
    created_at
FROM donor
WHERE availability_status = 'Available';

-- TRIGGER: after_donation_insert
DELIMITER $$
CREATE TRIGGER after_donation_insert
AFTER INSERT ON donation_record
FOR EACH ROW
BEGIN
    UPDATE donor
    SET availability_status = 'Not Available',
        last_donated        = NEW.donation_date
    WHERE donor_id = NEW.donor_id;
END$$
DELIMITER ;

-- STORED PROCEDURE: fulfill_request
DELIMITER $$
CREATE PROCEDURE fulfill_request(IN req_id INT, IN bank_id INT)
BEGIN
    DECLARE needed    INT;
    DECLARE available INT;

    SELECT quantity_needed INTO needed
    FROM patient_request
    WHERE request_id = req_id;

    SELECT available_units INTO available
    FROM blood_bank
    WHERE bloodbank_id = bank_id;

    IF available >= needed THEN
        UPDATE blood_bank
        SET available_units = available_units - needed
        WHERE bloodbank_id = bank_id;

        UPDATE patient_request
        SET status = 'Fulfilled'
        WHERE request_id = req_id;
    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient blood units in bank';
    END IF;
END$$
DELIMITER ;
