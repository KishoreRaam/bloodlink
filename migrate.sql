-- BloodLink migration: run once against blood_management_system
USE blood_management_system;

-- Admin users (for /auth/login)
CREATE TABLE IF NOT EXISTS users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    name            VARCHAR(100),
    role            VARCHAR(50)  NOT NULL DEFAULT 'admin',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood donation camps
CREATE TABLE IF NOT EXISTS blood_camp (
    camp_id      INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    organizer    VARCHAR(150),
    camp_date    DATE         NOT NULL,
    start_time   VARCHAR(5),
    end_time     VARCHAR(5),
    venue        VARCHAR(200),
    city         VARCHAR(100),
    capacity     INT          NOT NULL DEFAULT 100,
    blood_groups TEXT,           -- JSON array stored as string, e.g. '["O+","A+"]'
    description  TEXT,
    status       ENUM('Upcoming','Active','Completed') NOT NULL DEFAULT 'Upcoming',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_camp_status (status),
    INDEX idx_camp_date   (camp_date)
);

-- Donor password auth (separate from donor table so admin-registered donors stay passwordless)
CREATE TABLE IF NOT EXISTS donor_auth (
    auth_id       INT AUTO_INCREMENT PRIMARY KEY,
    donor_id      INT          NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id) ON DELETE CASCADE
);
