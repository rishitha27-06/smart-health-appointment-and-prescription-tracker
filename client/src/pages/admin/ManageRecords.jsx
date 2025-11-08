// src/pages/admin/ManageRecords.jsx
import { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/api"; // Import your central API
import toast from "react-hot-toast"; // For notifications

const ManageRecords = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch both lists at the same time
        const [doctorRes, patientRes] = await Promise.all([
          api.get('/admin/doctors'), // We will create this backend route
          api.get('/admin/patients')  // We will create this backend route
        ]);
        
        setDoctors(doctorRes.data);
        setPatients(patientRes.data);

      } catch (err) {
        const msg = err.response?.data?.message || "Failed to fetch records";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty array means this runs once on mount

  // Memoize filtered data to avoid recalculating on every render
  const filteredData = useMemo(() => {
    const data = activeTab === 'doctors' ? doctors : patients;
    return data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, activeTab, doctors, patients]);

  // Handle deleting a user
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      // Use the 'userId' which is the '_id' from the userModel
  await api.delete(`/admin/users/${userId}`); 
      toast.success(`${userName} deleted successfully`);

      // Update state locally for a fast UI response
      if (activeTab === 'doctors') {
        setDoctors(prev => prev.filter(doc => doc._id !== userId));
      } else {
        setPatients(prev => prev.filter(pat => pat._id !== userId));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete user";
      toast.error(msg);
    }
  };
  
  // Show loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Main component JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Manage Records</h1>
          <p className="text-gray-600 text-lg">Administrate doctors, patients, and system data</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center ${
              activeTab === 'doctors'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <UserCheck size={20} className="inline mr-2" />
            Doctors
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center ${
              activeTab === 'patients'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            Patients
          </button>
        </div>

        {/* Search and Actions */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button className="btn-primary flex items-center">
              <UserPlus size={20} className="mr-2" />
              Add {activeTab === 'doctors' ? 'Doctor' : 'Patient'}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-cell">Name</th>
                  <th className="th-cell">
                    {activeTab === 'doctors' ? 'Specialization' : 'Age'}
                  </th>
                  <th className="th-cell">Email</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell">
                    {activeTab === 'doctors' ? 'Patients' : 'Last Visit'}
                  </th>
                  <th className="th-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="td-cell">
                      <div className="flex items-center">
                        <img
                          src={item.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0D8ABC&color=fff`}
                          alt={item.name}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="td-cell text-gray-600">
                      {activeTab === 'doctors' ? (item.specialization || 'N/A') : `${item.age} years`}
                    </td>
                    <td className="td-cell text-gray-600">{item.email}</td>
                    <td className="td-cell">
                      <span className={`status-badge ${
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="td-cell text-gray-600">
                      {activeTab === 'doctors' 
                        ? (item.patientCount || 0)
                        : (item.lastVisit ? new Date(item.lastVisit).toLocaleDateString() : 'N/A')
                      }
                    </td>
                    <td className="td-cell">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No {activeTab} found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRecords;