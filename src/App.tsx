
import { useEffect, useState } from 'react';
import './App.css';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [salary, setSalary] = useState('');

  const [editingEmployeeId, setEditingEmployeeId] =
    useState<number | null>(null);
    const [viewingEmployee, setViewingEmployee] =
  useState<Employee | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSalary, setEditSalary] = useState('');

  const [loading, setLoading] = useState(true);

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (employee.name ?? '').toLowerCase().includes(search) ||
      (employee.email ?? '').toLowerCase().includes(search);

    const matchesDepartment =
      selectedDepartment === 'All' ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Fetch employees from Spring Boot
  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/employees'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load employees when the page opens
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add a new employee
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const employee = {
      name,
      email,
      department,
      salary: Number(salary),
    };

    try {
      const response = await fetch(
        'http://localhost:8080/api/employees',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employee),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save employee');
      }

      alert('Employee saved successfully!');

      setName('');
      setEmail('');
      setDepartment('');
      setSalary('');
      setShowForm(false);

      await fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Could not save employee. Check the backend and console.');
    }
  };

  // Start editing an employee
  const startEditing = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEditName(employee.name ?? '');
    setEditEmail(employee.email ?? '');
    setEditDepartment(employee.department ?? '');
    setEditSalary(String(employee.salary ?? ''));
  };

  // Update an employee
  const handleUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (editingEmployeeId === null) return;

    const updatedEmployee = {
      name: editName,
      email: editEmail,
      department: editDepartment,
      salary: Number(editSalary),
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/${editingEmployeeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEmployee),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      alert('Employee updated successfully!');

      cancelEditing();
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Could not update employee. Check the backend endpoint.');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEmployeeId(null);
    setEditName('');
    setEditEmail('');
    setEditDepartment('');
    setEditSalary('');
  };

  // Delete an employee
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this employee?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      if (editingEmployeeId === id) {
        cancelEditing();
      }

      alert('Employee deleted successfully!');
      await fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(
        'Could not delete employee. Check whether the backend DELETE endpoint exists.'
      );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Employee Management System</h1>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </header>

      {/* Add Employee Form */}
      {showForm && (
        <div className="employee-form">
          <h2>Add New Employee</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
              required
            />

            <button type="submit">Save Employee</button>
          </form>
        </div>
      )}

      {/* Edit Employee Form */}
      {editingEmployeeId !== null && (
        <div className="employee-form">
          <h2>Edit Employee</h2>

          <form onSubmit={handleUpdate}>
            <input
              type="text"
              placeholder="Employee Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Department"
              value={editDepartment}
              onChange={(e) => setEditDepartment(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Salary"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
              min="0"
              required
            />

            <button type="submit">Save Changes</button>

            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="dashboard-cards">
        <div className="summary-card">
          <p>Total Employees</p>
          <h2>{employees.length}</h2>
        </div>

        <div className="summary-card">
          <p>Departments</p>
          <h2>
            {
              new Set(
                employees
                  .map((employee) => employee.department)
                  .filter(Boolean)
              ).size
            }
          </h2>
        </div>

        <div className="summary-card">
          <p>Total Salary</p>
          <h2>
            {employees
              .reduce(
                (total, employee) =>
                  total + Number(employee.salary || 0),
                0
              )
              .toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
          </h2>
        </div>
      </div>

      {/* Employee List */}
      <section className="employee-list">
        
        <div className="employee-list-header">
          <h2>Employee List</h2>

          <input
            className="search-input"
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="search-input"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>

            {[
              ...new Set(
                employees
                  .map((employee) => employee.department)
                  .filter(Boolean)
              ),
            ].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : filteredEmployees.length === 0 ? (
          <p>No employees match your search or department filter.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>
                    {Number(employee.salary || 0).toLocaleString(
                      'en-IN',
                      {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => startEditing(employee)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </button>

                    <button
  type="button"
  onClick={() => setViewingEmployee(employee)}
>
  View
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          
        )}

        
{viewingEmployee !== null && (
  <section className="employee-details">
    <h2>Employee Details</h2>

    <p><strong>ID:</strong> {viewingEmployee.id}</p>
    <p><strong>Name:</strong> {viewingEmployee.name}</p>
    <p><strong>Email:</strong> {viewingEmployee.email}</p>
    <p><strong>Department:</strong> {viewingEmployee.department}</p>
    <p>
      <strong>Salary:</strong>{' '}
      {Number(viewingEmployee.salary || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      })}
    </p>

    <button
      type="button"
      onClick={() => setViewingEmployee(null)}
    >
      Close Details
    </button>
  </section>
)}

      </section>
    </div>
  );
}

export default App;
