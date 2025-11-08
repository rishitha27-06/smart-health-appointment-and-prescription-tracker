// src/pages/doctor/Schedule.jsx
import { useState } from "react";
import { Calendar, Clock, User, Plus, Trash2 } from "lucide-react";

const Schedule = () => {
  const [schedule, setSchedule] = useState([
    { id: 1, day: 'Monday', slots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'] },
    { id: 2, day: 'Tuesday', slots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
    { id: 3, day: 'Wednesday', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
    { id: 4, day: 'Thursday', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
    { id: 5, day: 'Friday', slots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'] }
  ]);

  const [newSlot, setNewSlot] = useState({ day: 'Monday', time: '' });

  const addTimeSlot = (day) => {
    if (newSlot.time) {
      const updatedSchedule = schedule.map(daySchedule => 
        daySchedule.day === day 
          ? { ...daySchedule, slots: [...daySchedule.slots, newSlot.time] }
          : daySchedule
      );
      setSchedule(updatedSchedule);
      setNewSlot({ day: 'Monday', time: '' });
    }
  };

  const removeTimeSlot = (day, time) => {
    const updatedSchedule = schedule.map(daySchedule =>
      daySchedule.day === day
        ? { ...daySchedule, slots: daySchedule.slots.filter(slot => slot !== time) }
        : daySchedule
    );
    setSchedule(updatedSchedule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">My Schedule</h1>
          <p className="text-gray-600 text-lg">Manage your availability and time slots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Add New Slot */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add Time Slot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                    className="input-field"
                  >
                    {schedule.map(day => (
                      <option key={day.id} value={day.day}>{day.day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
                    className="input-field"
                  />
                </div>
                <button 
                  onClick={() => addTimeSlot(newSlot.day)}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add Slot
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Display */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedule.map(daySchedule => (
                <div key={daySchedule.id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <Calendar size={20} className="mr-2" />
                      {daySchedule.day}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {daySchedule.slots.length} slots
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-gray-700">
                          <Clock size={16} className="mr-2" />
                          <span>{slot}</span>
                        </div>
                        <button
                          onClick={() => removeTimeSlot(daySchedule.day, slot)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {daySchedule.slots.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No time slots scheduled</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-blue-600">{schedule.reduce((total, day) => total + day.slots.length, 0)}</div>
            <div className="text-gray-600">Total Slots</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-gray-600">Working Days</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-gray-600">Avg. Slots/Day</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-orange-600">40</div>
            <div className="text-gray-600">Hours/Week</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;