// src/components/ProfileDropdown.jsx
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ role }) {
  const navigate = useNavigate();

  const menuItems = {
    patient: [
      { name: "Profile", path: "/patient-profile" },
      { name: "Dashboard", path: "/patient-dashboard" },
      { name: "Prescriptions", path: "/prescriptions" },
    ],
    doctor: [
      { name: "Profile", path: "/doctor-profile" },
      { name: "Appointments", path: "/doctor-dashboard" },
      { name: "Schedule", path: "/schedule" },
      { name: "Patient Records", path: "/patients-records" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin-dashboard" },
      { name: "Manage Records", path: "/manage-records" },
    ],
  };

  return (
    <div className="absolute right-0 mt-3 bg-white rounded-lg shadow-lg w-56 text-gray-700">
      {menuItems[role].map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
