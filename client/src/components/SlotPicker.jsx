import { useEffect, useState } from "react";
import api from "../api/api";

export default function SlotPicker({ doctorId, date, onChange, disabled }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !date) return;
      setLoading(true);
      setError("");
      try {
        // Normalize incoming date to local YYYY-MM-DD (no timezone) to prevent UTC shift
        const toLocalYMD = (d) => {
          if (d instanceof Date) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
          if (typeof d === "string") {
            if (d.includes("T")) return d.split("T")[0];
            return d.slice(0, 10);
          }
          return d;
        };
        const dateParam = toLocalYMD(date);
        const res = await api.get(`/appointments/slots`, { params: { doctorId, date: dateParam } });
        setSlots(res.data?.slots || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load slots");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [doctorId, date]);

  const select = (t) => {
    setSelected(t);
    onChange?.(t);
  };

  if (!doctorId || !date) {
    return <div className="text-sm text-gray-500">Select a doctor and date</div>;
  }

  if (loading) return <div className="text-sm text-gray-600">Loading slots...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!slots.length) return <div className="text-sm text-gray-500">No slots available</div>;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {slots.map((t) => (
        <button
          key={t}
          type="button"
          disabled={disabled}
          onClick={() => select(t)}
          className={`px-3 py-2 rounded-md border text-sm ${
            selected === t ? "bg-blue-600 text-white border-blue-600" : "bg-white/80 border-gray-300 hover:bg-blue-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
