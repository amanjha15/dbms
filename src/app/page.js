'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    placementRate: '0%',
    avgSalary: '₹0',
    medianSalary: '₹0',
    totalStudents: 0,
    placedStudents: 0
  });

  const [sortField, setSortField] = useState('deadline');
  const [sortDir, setSortDir] = useState('desc');
  
  const [branchFilter, setBranchFilter] = useState('');
  const [cgpaFilter, setCgpaFilter] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if(Array.isArray(data)) setJobs(data);
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredJobs = jobs.filter(job => {
    let match = true;
    if (branchFilter) {
      const branches = job.required_branch ? String(job.required_branch) : '';
      const branchArray = branches.split(',').map(b => b.trim());
      match = match && (branchArray.includes(branchFilter) || branches === 'Any' || branches === 'All Branches' || branches === 'B.E. All Branches');
    }
    if (cgpaFilter) {
      const reqCgpa = job.min_cgpa !== null ? Number(job.min_cgpa) : 0;
      match = match && (reqCgpa <= Number(cgpaFilter));
    }
    if (companySearch) {
      match = match && job.company_name.toLowerCase().includes(companySearch.toLowerCase());
    }
    return match;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    let comparison = 0;

    if (sortField === 'deadline') {
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      comparison = isNaN(timeA) || isNaN(timeB) ? 0 : timeA - timeB;
    } else if (sortField === 'package' || sortField === 'min_cgpa') {
      const numA = valA ? Number(valA) : 0;
      const numB = valB ? Number(valB) : 0;
      comparison = isNaN(numA) || isNaN(numB) ? 0 : numA - numB;
    } else {
      const strA = valA ? String(valA).toLowerCase() : '';
      const strB = valB ? String(valB).toLowerCase() : '';
      comparison = strA.localeCompare(strB);
    }

    if (comparison !== 0) {
      return sortDir === 'asc' ? comparison : -comparison;
    }
    return String(a.job_id).localeCompare(String(b.job_id));
  });

  const allBranchesRaw = jobs.map(j => j.required_branch).filter(Boolean);
  const uniqueBranches = [...new Set(allBranchesRaw.flatMap(b => String(b).split(',').map(s => s.trim())))].filter(b => b !== 'Any' && b !== 'All Branches' && b.length > 0).sort();

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div className="brutal-card" style={{ marginBottom: '2rem', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 className="title" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Track every <span className="gradient-text">application</span>.<br/>
          Land the <span className="underline-accent">dream</span>.
        </h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
          Made by Aashika Joshi, Vishwas Sethi, Aman Jha
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ color: '#3b82f6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="title" style={{ fontSize: '2.5rem' }}>{stats.totalCompanies}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563', paddingBottom: '8px' }}>Total</div>
          </div>
        </div>
        
        <div className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ color: '#10b981' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="title" style={{ fontSize: '2.5rem' }}>{stats.placedStudents}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563', paddingBottom: '8px' }}>Offers</div>
          </div>
        </div>

        <div className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ color: '#f59e0b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="title" style={{ fontSize: '2rem' }}>{stats.avgSalary}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563', paddingBottom: '8px' }}>Avg CTC</div>
          </div>
        </div>

        <div className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ color: '#8b5cf6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="title" style={{ fontSize: '2rem' }}>{stats.medianSalary}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#4b5563', paddingBottom: '8px' }}>Median</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="brutal-card" style={{ marginBottom: '2rem' }}>
        <h3 className="title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Choose Branch</label>
            <select 
              className="form-input" 
              value={branchFilter} 
              onChange={e => setBranchFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">— All Branches —</option>
              {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Search Company</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Google" 
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>CGPA (&lt;=)</label>
            <input 
              type="number" 
              step="0.1" 
              className="form-input" 
              placeholder="e.g., 8.0" 
              value={cgpaFilter}
              onChange={e => setCgpaFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('deadline')}>
                Date {sortField === 'deadline' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('company_name')}>
                Company {sortField === 'company_name' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('role')}>
                Job Role {sortField === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('package')}>
                CTC {sortField === 'package' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('required_branch')}>
                Branches {sortField === 'required_branch' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('min_cgpa')}>
                Min CGPA {sortField === 'min_cgpa' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.length > 0 ? sortedJobs.map((job, index) => (
              <tr key={`${job.job_id}-${index}`}>
                <td style={{ color: '#4b5563', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {new Date(job.deadline).toLocaleDateString()}
                </td>
                <td style={{ fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      {job.company_name.substring(0,2).toUpperCase()}
                    </div>
                    {job.company_name}
                  </div>
                </td>
                <td>{job.role}</td>
                <td style={{ fontWeight: 700 }}>
                  {job.package ? `₹${Number(job.package).toLocaleString('en-IN')}` : 'TBD'}
                </td>
                <td>
                  <span className="badge" style={{ borderColor: '#4b5563', color: '#4b5563' }}>
                    {job.required_branch || 'All'}
                  </span>
                </td>
                <td>{job.min_cgpa ? job.min_cgpa : '—'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#4b5563', padding: '3rem' }}>
                  No opportunities match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
