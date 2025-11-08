import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, MapPin, Star, User, X, CheckCircle, Stethoscope } from "lucide-react";
import api from "../../api/api";
import toast from "react-hot-toast";
import SlotPicker from "../../components/SlotPicker";
import { useMemo } from "react";

export default function FindDoctors() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [symptom, setSymptom] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ date: "", time: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favDoctors') || '[]'); } catch { return []; }
  });

  const commonSymptoms = [
    "Muscle Pain", "Fever", "Headache", "Chest Pain", "Stomach Pain",
    "Back Pain", "Cough", "Joint Pain", "Skin Rash", "Anxiety"
  ];

  const handleSearch = async () => {
    if (!symptom.trim()) {
      toast.error("Please enter a symptom");
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get(`/doctor-profiles?symptom=${encodeURIComponent(symptom)}`);
      setDoctors(response.data);
      if (response.data.length === 0) {
        toast.error("No doctors found for this symptom");
      } else {
        toast.success(`Found ${response.data.length} doctor(s)`);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to search doctors");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByName = async () => {
    if (!nameQuery.trim()) {
      toast.error("Enter a name to search");
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get(`/doctor-profiles?q=${encodeURIComponent(nameQuery)}`);
      setDoctors(response.data);
      if (!response.data.length) toast.error("No doctors matched that name");
      else toast.success(`Found ${response.data.length} doctor(s)`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to search by name");
    } finally { setIsSearching(false); }
  };

  const handleBrowseAll = async () => {
    setIsSearching(true);
    try {
      const response = await api.get(`/doctor-profiles`);
      setDoctors(response.data);
      toast.success(`Found ${response.data.length} doctor(s)`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load doctors");
    } finally { setIsSearching(false); }
  };

  const requestChat = async (doctor) => {
    try {
      await api.post('/chat/requests', { doctorId: doctor.doctorId?._id });
      toast.success('Chat request sent to doctor');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to request chat');
    }
  };

  // favorites helpers
  useEffect(()=>{
    localStorage.setItem('favDoctors', JSON.stringify(favorites));
  }, [favorites]);
  const isFav = (doc) => favorites.includes(doc.doctorId?._id);
  const toggleFav = (doc) => {
    const id = doc.doctorId?._id;
    if (!id) return;
    setFavorites((prev)=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    toast.success(prev => (favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites'));
  };

  const handleBook = async () => {
    if (!bookingData.date || !bookingData.time) {
      toast.error("Please select date and time");
      return;
    }

    setBookingLoading(true);
    try {
      await api.post("/appointments", {
        doctorId: selectedDoctor.doctorId._id,
        date: bookingData.date,
        time: bookingData.time,
      });
      toast.success("Appointment booked successfully! Confirmation email sent.");
      setShowBookingModal(false);
      setSelectedDoctor(null);
      setBookingData({ date: "", time: "" });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <Stethoscope className="w-10 h-10 mr-3 text-blue-600" />
            Find Your Doctor
          </h1>
          <p className="text-gray-600 text-lg">
            Search for specialists based on your symptoms
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Describe your symptoms (e.g., muscle pain, fever, headache...)"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
              />
            </div>
            <motion.button
              onClick={handleSearch}
              disabled={isSearching || !symptom.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Doctors
                </>
              )}
            </motion.button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by doctor name (e.g., Bhargavi)"
                value={nameQuery}
                onChange={(e)=> setNameQuery(e.target.value)}
                onKeyPress={(e)=> e.key==='Enter' && handleSearchByName()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearchByName}
              disabled={isSearching || !nameQuery.trim()}
              className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 disabled:opacity-50"
            >
              Search by Name
            </button>
            <button
              onClick={handleBrowseAll}
              disabled={isSearching}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
            >
              Browse All
            </button>
          </div>

          {/* Quick Symptom Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Quick search:</span>
            {commonSymptoms.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSymptom(sym);
                  setTimeout(() => handleSearch(), 100);
                }}
                className="px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full hover:from-blue-200 hover:to-purple-200 transition-all duration-200"
              >
                {sym}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Doctor List */}
        <AnimatePresence>
          {doctors.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Available Doctors ({doctors.length})
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc, index) => (
                  <motion.div
                    key={doc._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                            {doc.doctorId?.name?.charAt(0) || "D"}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {doc.doctorId?.name || "Doctor"}
                            </h3>
                            <p className="text-blue-600 font-medium">{doc.specialization}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleFav(doc)}
                            title={isFav(doc) ? 'Remove Favorite' : 'Add to Favorites'}
                            className={`inline-flex items-center px-2 py-1 rounded-full border ${isFav(doc) ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-600'} hover:shadow`}
                          >
                            <Star className={`w-4 h-4 mr-1 ${isFav(doc) ? 'fill-current' : ''}`} />
                            {isFav(doc) ? 'Favorited' : 'Favorite'}
                          </button>
                        </div>
                      </div>

                      {doc.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doc.bio}</p>
                      )}

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm">{doc.experience} years experience</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">{doc.location || "City Medical Center"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => openBookingModal(doc)}
                          className="py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book
                        </motion.button>
                        <button
                          onClick={() => requestChat(doc)}
                          className="py-3 bg-white border-2 border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition"
                        >
                          Request Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {doctors.length === 0 && symptom && !isSearching && (
          <motion.div
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try different symptoms or check back later.</p>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedDoctor && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Book Appointment
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">{selectedDoctor.doctorId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">{selectedDoctor.location || "City Medical Center"}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: "" })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                  <div className="border-2 border-gray-200 rounded-xl p-3">
                    <SlotPicker
                      doctorId={selectedDoctor.doctorId?._id}
                      date={bookingData.date}
                      onChange={(t)=> setBookingData({ ...bookingData, time: t })}
                      disabled={!bookingData.date}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={bookingLoading || !bookingData.date || !bookingData.time}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Booking...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
