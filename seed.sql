USE blood_management_system;

-- Donors (6 total)
-- last_donated 100 days ago  → eligible (>= 90 days)
-- last_donated 30 days ago   → NOT eligible (< 90 days)
-- last_donated NULL          → eligible
INSERT INTO donor (name, age, gender, blood_group, contact_number, email, address, availability_status, last_donated) VALUES
('Alice Johnson', 28, 'Female', 'O+',  '9876543210', 'alice@example.com',  '12 Rose Street, Mumbai',   'Available',     DATE_SUB(CURDATE(), INTERVAL 100 DAY)),
('Bob Smith',     35, 'Male',   'A+',  '9876543211', 'bob@example.com',    '45 Oak Avenue, Delhi',     'Available',     NULL),
('Carol Davis',   42, 'Female', 'B-',  '9876543212', 'carol@example.com',  '7 Pine Road, Bangalore',   'Not Available', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('David Lee',     25, 'Male',   'AB+', '9876543213', 'david@example.com',  '89 Maple Lane, Chennai',   'Available',     DATE_SUB(CURDATE(), INTERVAL 100 DAY)),
('Eva Martinez',  31, 'Female', 'O-',  '9876543214', 'eva@example.com',    '23 Birch Blvd, Hyderabad', 'Not Available', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('Frank Wilson',  48, 'Male',   'A-',  '9876543215', 'frank@example.com',  '56 Cedar Court, Pune',     'Available',     NULL);

-- Blood Banks (3 cities)
INSERT INTO blood_bank (name, city, contact_number, email, available_units, blood_group) VALUES
('LifeBlood Bank Mumbai', 'Mumbai',    '0221234567', 'lifeblood@mumbai.com',    50, 'O+'),
('Red Cross Delhi',       'Delhi',     '0111234567', 'redcross@delhi.com',       30, 'A+'),
('HealBlood Bangalore',   'Bangalore', '0801234567', 'healblood@bangalore.com',  20, 'B-');

-- Hospitals (3)
INSERT INTO hospital (name, city, contact_number, email, address) VALUES
('City General Hospital',  'Mumbai',    '0229876543', 'citygeneral@hospital.com', '1 Hospital Road, Mumbai'),
('Apollo Healthcare',      'Delhi',     '0119876543', 'apollo@hospital.com',      '10 Medical Square, Delhi'),
('Manipal Medical Center', 'Bangalore', '0809876543', 'manipal@hospital.com',     '5 Health Park, Bangalore');

-- Patient Requests (4: mix of Pending / Fulfilled)
INSERT INTO patient_request (patient_name, blood_group, quantity_needed, hospital_id, status) VALUES
('Raj Kumar',    'O+',  2, 1, 'Pending'),
('Sunita Sharma','A+',  3, 2, 'Fulfilled'),
('Arjun Patel',  'B-',  1, 3, 'Pending'),
('Meena Nair',   'AB+', 2, 1, 'Pending');

-- Donation Records (inserted directly to bypass trigger for seed data)
INSERT INTO donation_record (donor_id, bloodbank_id, donation_date, quantity_donated, notes) VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 100 DAY), 1, 'Regular donation'),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 1, 'First time donor'),
(3, 3, DATE_SUB(CURDATE(), INTERVAL 30 DAY),  1, 'Emergency donation'),
(5, 1, DATE_SUB(CURDATE(), INTERVAL 30 DAY),  1, 'Voluntary donation');
