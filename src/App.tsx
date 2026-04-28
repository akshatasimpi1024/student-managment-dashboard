import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  LayoutDashboard, 
  UserPlus,
  BookOpen,
  Layers,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from './types';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    branch: '',
    semester: ''
  });

  const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science', 'Electrical'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.usn || !formData.branch || !formData.semester) {
      setError('All fields are required');
      return;
    }

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save student');

      await fetchStudents();
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', usn: '', branch: '', semester: '' });
      showSuccess(editingStudent ? 'Student updated successfully' : 'Student added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete student');
      
      setStudents(prev => prev.filter(s => s.id !== id));
      showSuccess('Student deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      usn: student.usn,
      branch: student.branch,
      semester: student.semester
    });
    setIsModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.usn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = branchFilter === 'All' || student.branch === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [students, searchQuery, branchFilter]);

  const stats = useMemo(() => {
    const branchCount = new Set(students.map(s => s.branch)).size;
    return {
      total: students.length,
      branches: branchCount
    };
  }, [students]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight">EduManage</h1>
        </div>

        <nav className="space-y-1">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-indigo-600 bg-indigo-50 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => {
              setEditingStudent(null);
              setFormData({ name: '', usn: '', branch: '', semester: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
          >
            <UserPlus size={20} />
            Add Student
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Connected to Server
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">Student Dashboard</h2>
            <p className="text-slate-500">Manage your students and academic records</p>
          </div>
          <button 
            onClick={() => {
              setEditingStudent(null);
              setFormData({ name: '', usn: '', branch: '', semester: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Add New Student
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-display font-bold text-slate-900">{stats.total}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
              <Layers size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Branches</p>
              <h3 className="text-3xl font-display font-bold text-slate-900">{stats.branches}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Avg. Semester</p>
              <h3 className="text-3xl font-display font-bold text-slate-900">
                {students.length > 0 
                  ? (students.reduce((acc, s) => acc + parseInt(s.semester), 0) / students.length).toFixed(1) 
                  : '0.0'}
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-6 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl mb-6 flex items-center gap-3"
            >
              <CheckCircle2 size={20} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or USN..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl transition-all outline-none min-w-[180px]"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">USN</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Semester</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Loading students...
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">{student.usn}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                          {student.branch}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-700">{student.semester}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(student)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-display font-bold text-slate-900">
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">USN (University Serial Number)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 1MS20CS001"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-mono"
                      value={formData.usn}
                      onChange={(e) => setFormData({...formData, usn: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Branch</label>
                      <select 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all"
                        value={formData.branch}
                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Semester</label>
                      <select 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all"
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      >
                        <option value="">Select Sem</option>
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100"
                    >
                      {editingStudent ? 'Update Records' : 'Save Student'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
