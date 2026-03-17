import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, UserPlus } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getDonors, type Donor } from "../services/api";

const BLOOD_GROUPS = ["All", "O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const initialsColor = (name: string) => {
  const colors = ["#C0152A", "#2563EB", "#7C3AED", "#D97706", "#16A34A", "#0891B2"];
  return colors[name.charCodeAt(0) % colors.length];
};

export function DonorList() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("All");
  const [availFilter, setAvailFilter] = useState("All");

  useEffect(() => {
    getDonors()
      .then(setDonors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = donors.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.address ?? "").toLowerCase().includes(search.toLowerCase());
    const matchBlood = bloodFilter === "All" || d.blood_group === bloodFilter;
    const matchAvail =
      availFilter === "All" ||
      (availFilter === "Available" && d.availability_status === "Available") ||
      (availFilter === "Not Available" && d.availability_status === "Not Available");
    return matchSearch && matchBlood && matchAvail;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
            Donor Profiles
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
            {loading ? "Loading…" : `${donors.length} registered donor${donors.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/register")}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-md shadow-red-900/20 hover:shadow-lg transition-all hover:scale-[1.02]"
          style={{ background: "#C0152A" }}
        >
          <UserPlus className="w-4 h-4" />
          Register Donor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="w-full pl-9 pr-4 py-2.5 border border-[#E5E7EB] dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1F2E] text-[#111827] dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30 focus:border-[#C0152A]"
            style={{ fontSize: "13px" }}
          />
        </div>

        {/* Blood group filter */}
        <div className="flex gap-1.5 flex-wrap">
          {BLOOD_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setBloodFilter(g)}
              className="px-3 py-1.5 rounded-lg border transition-all"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                background: bloodFilter === g ? "#C0152A" : "white",
                color: bloodFilter === g ? "#fff" : "#374151",
                borderColor: bloodFilter === g ? "#C0152A" : "#E5E7EB",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Availability filter */}
        <select
          value={availFilter}
          onChange={(e) => setAvailFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#E5E7EB] dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1F2E] text-[#111827] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C0152A]/30"
          style={{ fontSize: "13px" }}
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6B7280]" style={{ fontSize: "14px" }}>
          Loading donors…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "14px" }}>
            {donors.length === 0 ? "No donors registered yet." : "No donors match your filters."}
          </p>
          {donors.length === 0 && (
            <button
              onClick={() => navigate("/admin/register")}
              className="text-[#C0152A] hover:underline"
              style={{ fontSize: "13px" }}
            >
              Register the first donor →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((donor) => (
            <div
              key={donor.donor_id}
              onClick={() => navigate(`/admin/profile/${donor.donor_id}`)}
              className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 cursor-pointer hover:shadow-lg dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: initialsColor(donor.name), fontSize: "14px", fontWeight: 700 }}
                >
                  {initials(donor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#111827] dark:text-gray-100 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {donor.name}
                    </p>
                    <BloodGroupBadge group={donor.blood_group} size="sm" />
                  </div>
                  <p className="text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "12px" }}>
                    {donor.gender} · Age {donor.age}
                  </p>
                  {donor.address && (
                    <div className="flex items-center gap-1 text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "11px" }}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{donor.address}</span>
                    </div>
                  )}
                  <StatusBadge status={donor.availability_status as any} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
