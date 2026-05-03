'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    placementRate: '0%',
    avgSalary: '₹0',
    medianSalary: '₹0'
  });
  const [studentForm, setStudentForm] = useState({ name: '', branch: '', cgpa: '', email: '' });
  const [placementForm, setPlacementForm] = useState({ student_id: '', job_id: '', salary: '' });
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchResults();
      fetchStats();
      fetchStudents();
      fetchJobs();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if(Array.isArray(data)) setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if(data) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Student added successfully!');
        setStudentForm({ name: '', branch: '', cgpa: '', email: '' });
        fetchStats(); // Refresh stats
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to add student');
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placementForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Placement recorded successfully!');
        setPlacementForm({ student_id: '', job_id: '', salary: '' });
        fetchResults();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to record placement');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="brutal-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Admin Access</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Enter the master password to manage placements.</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Overview and management of the placement ecosystem.</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="btn">Lock Session</button>
      </div>

      {/* Analytics Section */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '3rem' }}>
        <div className="brutal-card">
          <div className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563' }}>Total Students</div>
        </div>
        <div className="brutal-card">
          <div className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stats.totalCompanies}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563' }}>Partner Companies</div>
        </div>
        <div className="brutal-card">
          <div className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#10b981' }}>{stats.placementRate}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563' }}>Placement Rate</div>
        </div>
        <div className="brutal-card">
          <div className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#f59e0b' }}>{stats.avgSalary}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563' }}>Average Salary</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="brutal-card">
          <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Student</h2>
          <form onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={studentForm.name}
                onChange={e => setStudentForm({...studentForm, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={studentForm.branch}
                onChange={e => setStudentForm({...studentForm, branch: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>CGPA</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="10"
                className="form-input" 
                required
                value={studentForm.cgpa}
                onChange={e => setStudentForm({...studentForm, cgpa: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                className="form-input" 
                required
                value={studentForm.email}
                onChange={e => setStudentForm({...studentForm, email: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Student</button>
          </form>
        </div>

        <div className="brutal-card">
          <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Record Placement</h2>
          <form onSubmit={handlePlacementSubmit}>
            <div className="form-group">
              <label>Student</label>
              <select 
                className="form-input" 
                required
                value={placementForm.student_id}
                onChange={e => setPlacementForm({...placementForm, student_id: e.target.value})}
              >
                <option value="">Select Student</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.branch})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Job Opportunity</label>
              <select 
                className="form-input" 
                required
                value={placementForm.job_id}
                onChange={e => setPlacementForm({...placementForm, job_id: e.target.value})}
              >
                <option value="">Select Job</option>
                {jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.company_name} - {j.role}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Final CTC (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                required
                value={placementForm.salary}
                onChange={e => setPlacementForm({...placementForm, salary: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Record Placement</button>
          </form>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        <div className="brutal-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2rem 1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>Recent Placements</h2>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student..." 
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(res => !studentSearch || res.name.toLowerCase().includes(studentSearch.toLowerCase())).length > 0 ? results.filter(res => !studentSearch || res.name.toLowerCase().includes(studentSearch.toLowerCase())).map((res, i) => (
                  <tr key={`${res.name}-${i}`}>
                    <td style={{ fontWeight: 700 }}>{res.name}</td>
                    <td>{res.company_name}</td>
                    <td style={{ color: '#4b5563' }}>{res.role}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>₹{Number(res.salary).toLocaleString('en-IN')}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#4b5563', padding: '2rem' }}>
                      No placement records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
