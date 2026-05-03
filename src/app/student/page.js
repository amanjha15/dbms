'use client';

import { useState, useEffect } from 'react';

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentId, setStudentId] = useState(1); // Hardcoded for demo, normally from auth
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [studentId]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if(Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications?student_id=${studentId}`);
      const data = await res.json();
      if(Array.isArray(data)) setApplications(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, job_id: jobId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Applied successfully!');
        fetchApplications();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to apply.');
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}><p>Loading dashboard...</p></div>;

  return (
    <>
      <div className="bg-image" style={{ backgroundImage: "url('/bg.png')" }}></div>
      <div className="bg-overlay"></div>
      
      <div className="container animate-fade-in" style={{ paddingTop: '120px' }}>
        <h1 className="title" style={{ fontSize: '3rem' }}>Student Portal</h1>
        <p className="subtitle">Welcome back! Here are the latest opportunities.</p>

        <div className="grid" style={{ marginBottom: '3rem' }}>
          <div className="glass-card stat-card" style={{ gridColumn: 'span 1' }}>
             <div className="stat-value">{applications.length}</div>
             <div className="stat-label">Active Applications</div>
          </div>
          <div className="glass-card stat-card" style={{ gridColumn: 'span 1' }}>
             <div className="stat-value" style={{ color: 'var(--accent-color)' }}>{jobs.length}</div>
             <div className="stat-label">Open Roles</div>
          </div>
        </div>

        <div className="grid">
          <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 400, letterSpacing: '0.5px' }}>My Applications</h2>
            {applications.length === 0 ? (
              <p style={{ marginTop: '1rem', color: '#94a3b8' }}>You haven't applied to any jobs yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Applied At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.application_id}>
                        <td style={{ fontWeight: 500 }}>{app.company_name}</td>
                        <td style={{ color: '#94a3b8' }}>{app.role}</td>
                        <td>
                          <span className={`badge ${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
             <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 400, letterSpacing: '0.5px', marginTop: '1rem' }}>Available Roles</h2>
          </div>

          {jobs.map(job => (
            <div key={job.job_id} className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif", letterSpacing: '0.5px' }}>{job.role}</h3>
              <p style={{ color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>{job.company_name}</p>
              
              <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Min CGPA</span>
                  <span>{job.min_cgpa || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Branch</span>
                  <span>{job.required_branch || 'Any'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Deadline</span>
                  <span>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => applyForJob(job.job_id)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
