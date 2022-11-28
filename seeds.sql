INSERT INTO department (name)
VALUES 
('Engineering'),
('Finance & Accounting'),
('Sales'),
('Legal');

INSERT INTO role (title, salary, department_id)
VALUES
('Lead Engineer', 200000, 1),
('Software Engineer', 180000, 1),
('Accountant', 150000, 2), 
('Finanical Analyst', 150000, 2),
('Marketing Coordindator', 100000, 3), 
('Sales Lead', 120000, 3),
('Project Manager', 170000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Brandon', 'Rodriguez', 1, null),
('Serapio', 'Gomez', 2, 1),
('Yanis', 'Frasto', 3, null),
('Kevin', 'Castillo', 4, 3),
('Braulio', 'Martinez', 5, null),
('Noe', 'Ibarra', 6, 5),
('Nailea', 'Rodriguez', 7, null);

SELECT * from department;
SELECT * from role;
SELECT * from employee;
