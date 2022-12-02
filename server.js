// imported packages needed
const mysql = require('mysql2');
const inquirer = require('inquirer'); 
const cTable = require('console.table'); 

// connect to mysql and database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1046',
    database: 'employee_db',
});

db.connect(err => {
    if (err) console(err);
    console.log('Connected to Database');
    startUp();
});

// little employee manager start up screen
startUp = () => {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("*                                 *")
    console.log("***********************************")
    IntroQues();
};

// beginning questions
IntroQues = () => {
    inquirer
    .prompt(
        {
            type: 'list',
            message: 'What shall we do today?',
            name: 'choose',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add Department',
                'Add Roles',
                'Add Employees',
                'Delete Departments',
                'Delete Employee',
                'Delete Roles',
                'Update Employee Roles',
                'Update Employee Manager',
                'View Employee By Manager',
                'Exit'
            ]
            // changes which function is brought up based on what choice is selected
        }).then(answer => {
            switch (answer.choose) {
                case "View All Departments":
                    viewAllDepartments();
                    break;

                case "View All Roles":
                    viewAllRoles();
                    break;

                case "View All Employees":
                    viewAllEmployees();
                    break;

                case "Add Department":
                    addDepartment();
                    break;

                case "Add Roles":
                    addRoles();
                    break;

                case "Add Employees":
                    addEmployee();
                    break;

                case "Update Employee Roles":
                    updateEmployeeRole();
                    break;

                case "Delete Departments":
                    deleteDepartment();
                    break;

                case "Delete Employee":
                    deleteEmployee();
                    break;

                case "Delete Roles":
                    deleteRole();
                    break;

                case "Update Employee Manager":
                    updateManager()
                    break;

                case "View Employee By Manager":
                    viewEmployeeByManager()
                    break;

                case "Exit":
                    db.end();
                    console.log('Thank you and Have a great day!');
                    break;
            }
        })  
}

// shows deparments
viewAllDepartments = () => {
    db.query(
        'SELECT * FROM Department', (err, res) => {
            if (err) {
                console.log(err);
            }
            console.table(res)
            IntroQues();
        }
    )
}

// shows all roles
viewAllRoles = () => {
    db.query(
        'select ro.title as Role_title, ro.salary as Salary , dept.name as DepartmentName from Role ro left join department as dept on dept.id = ro.department_id', (err, res) => {
            if (err) {
                console.log(err);
            }
            console.table(res)
            IntroQues();
        }
    )
}

// shows all employee name, employee ID, Job title, Salary, Department name, and Manager name is they have a manager
viewAllEmployees = () => {
    const sql = 'Select emp.id as EmployeeID, concat(emp.first_name,"  ",emp.last_name ) as EmployeeName , ro.title as Job_tittle, ro.salary as Salary,dept.name as Department_Name,concat(emp2.first_name,"  ",emp2.last_name) as ManagerName from employee_db.employee as emp left join employee_db.employee as emp2 on emp2.id=emp.manager_id left join employee_db.Role as ro on emp.role_id=ro.id left join employee_db.department as dept on dept.id = ro.department_id';
    db.query(
        sql, 
        (err, res) => {
            if (err) {
                console.log(err);
            }
            console.table(res)
            IntroQues();
        }
    )
}

addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Please add a department name:'
        }
    ]).then(answer => {
        console.log(answer);
        db.query('INSERT INTO department SET?', { name: answer.department }, (err, res) => {
            if (err) console.log(err);
            console.log('Added new department')
            IntroQues();
        });
    });
}

addRoles = () => {
    db.promise().query("SELECT * FROM Department")
    .then((res) => {
        return res[0].map(dept => {
            return {
                name: dept.name,
                value: dept.id
            }
        })
    })
    .then((departments) => {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'roles',
                message: 'Please add a role:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Please enter a salary:'
            },
            {
                type: 'list',
                name: 'depts',
                choices: departments,
                message: 'Please select your department.'
            }
        ])
    }).then(answer => {
        console.log(answer);
        return db.promise().query('INSERT INTO role SET ?', { title: answer.roles, salary: answer.salary, department_id: answer.depts });
    })
    .then(res => {
        console.log('Added new role')
        IntroQues();

    })
    .catch(err => {
        console.log(err)
    });
}

function selectRole() {
    return db.promise().query("SELECT * FROM role")
        .then(res => {
            return res[0].map(role => {
                return {
                    name: role.title,
                    value: role.id
                }
            })
        })
}


function selectManager() {
    return db.promise().query("SELECT * FROM employee ")
        .then(res => {
            return res[0].map(manager => {
                return {
                    name: `${manager.first_name} ${manager.last_name}`,
                    value: manager.id,
                }
            })
        })

}

async function addEmployee() {
    const managers = await selectManager();


    inquirer.prompt([
        {
            name: "firstname",
            type: "input",
            message: "Enter their first name "
        },
        {
            name: "lastname",
            type: "input",
            message: "Enter their last name "
        },
        {
            name: "role",
            type: "list",
            message: "What is their role? ",
            choices: await selectRole()
        },
        {
            name: "manager",
            type: "list",
            message: "Whats their managers name?",
            choices: managers
        }
    ]).then(function (res) {
        const roleId = res.role
        const managerId = res.manager

        console.log({managerId});
        db.query("INSERT INTO Employee SET ?",
            {
                first_name: res.firstname,
                last_name: res.lastname,
                manager_id: managerId,
                role_id: roleId

            }, function (err) {
                if (err) console.log(err);
                console.table(res)
                IntroQues();
            })
    })
}

updateEmployeeRole = () => {
    db.promise().query('SELECT *  FROM employee')
    .then((res) => {
        return res[0].map(employee => {
            return {
                name: employee.first_name,
                value: employee.id
            }
        })
    })
    .then(async (employeeList) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'employeeListId',
                choices: employeeList,
                message: 'Please select the employee you want to update a role:.'
            },
            {
                type: 'list',
                name: 'roleId',
                choices: await selectRole(),
                message: 'Please select the role.'
            }
        ])
    })
    .then(answer => {
        console.log(answer);
        return db.promise().query("UPDATE employee SET  role_id = ? WHERE id = ?",
                [
                    answer.roleId,
                    answer.employeeListId,
                ],
        );
    }).then(res => {
        console.log('Updated Manager Successfully')
        IntroQues();
    }).catch(err => {
        console.log(err);
    });
}

// deletes selected deparment
deleteDepartment = () => {
    db.promise().query('SELECT * FROM Department')
    .then((res) => {
        return res[0].map(dept => {
            return {
                name: dept.name,
                value: dept.id
            }
        })
    }).then((departments) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'deptId',
                choices: departments,
                message: 'Please select the department you want to delete.'
            }
        ])
    }).then(answer => {
        console.log(answer);
        return db.promise().query('DELETE FROM Department WHERE id = ?', answer.deptId);
    }).then(res => {
        console.log('Department Deleted Successfully')
        IntroQues();
    }).catch(err => {
        console.log(err);
    });
}

// deletes selected employee
deleteEmployee = () => {
    db.promise().query('SELECT * FROM employee')
        .then((res) => {
            return res[0].map(emp => {
                return {
                    name: emp.first_name,
                    value: emp.id
                }
            })
        })
        .then((employees) => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    choices: employees,
                    message: 'Please select the employee you want to delete.'
                }
            ])
        }).then(answer => {
            console.log(answer);
            return db.promise().query('DELETE FROM Employee WHERE id = ?', answer.employeeId);
        }).then(res => {
            console.log('Employee Deleted Successfully')
            IntroQues();
        }).catch(err => {
            console.log(err);
        });
}

// deleted selected role
deleteRole = () => {
    db.promise().query('SELECT title, id FROM role')
        .then((res) => {
            return res[0].map(roles => {
                return {
                    name: roles.title,
                    value: roles.id
                }
            })
        }).then((employeeRoles) => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'roleId',
                    choices: employeeRoles,
                    message: 'Please select the employee you want to delete.'
                }
            ])
        }).then(answer => {
            console.log(answer);
            return db.promise().query('DELETE FROM Role WHERE id = ?', answer.roleId);
        }).then(res => {
            console.log('Role Deleted Successfully')
            IntroQues();
        }).catch(err => {
            console.log(err);
        }); 
}

// updates manager for person selected
updateManager = () => {
    db.promise().query('SELECT *  FROM employee')
    .then((res) => {
        return res[0].map(employee => {
            return {
                name: employee.first_name,
                value: employee.id
            }
        })
    })
    .then(async (employeeList) => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'employeeListId',
                choices: employeeList,
                message: 'Please select the employee you want to assign manager to:.'
            },
            {
                type: 'list',
                name: 'managerId',
                choices: await selectManager(),
                message: 'Please select the employee you want to make manager.'
            }
        ])
    })
    .then(answer => {
        console.log(answer);
        return db.promise().query("UPDATE employee SET  manager_id = ? WHERE id = ?",
                [
                    answer.managerId,
                    answer.employeeListId,
                ],
        );
    }).then(res => {
        console.log('Updated Manager Successfully')
        IntroQues();
    }).catch(err => {
        console.log(err);
    });
}

// view employees based on which manager is selected
viewEmployeeByManager = () => {
    db.promise().query('SELECT *  FROM employee')
        .then((res) => {
            return res[0].map(employee => {
                return {
                    name: employee.first_name,
                    value: employee.id
                }
            })
        }).then(async (managerList) => {
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'managerId',
                    choices: managerList,
                    message: 'Please select the manager you want to view employee by.'
                }
            ])
        }).then(answer => {
            console.log(answer);
            return db.promise().query('SELECT * from Employee where manager_id=?',answer.managerId);
        }).then(res => {
            console.table(res[0])
            IntroQues();
        }).catch(err => {
            console.log(err);
        });
}