import { useState } from "react";
import { Search, MapPin, Phone, Eye, EyeOff, MessageCircle, X, Droplets, Filter } from "lucide-react";
import { BloodGroupBadge } from "../components/ui/BloodGroupBadge";
import { StatusBadge } from "../components/ui/StatusBadge";

const ALL_DONORS = [
  { id: 1, name: "Rahul Kumar", initials: "RK", blood: "O+", city: "Chennai", phone: "98765•••••", fullPhone: "+91 98765 43210", status: "Available" as const, color: "#C0152A" },
  { id: 2, name: "Meena Devi", initials: "MD", blood: "O+", city: "Chennai", phone: "87654•••••", fullPhone: "+91 87654 32109", status: "Available" as const, color: "#7C3AED" },
  { id: 3, name: "Priya Sharma", initials: "PS", blood: "A+", city: "Coimbatore", phone: "76543•••••", fullPhone: "+91 76543 21098", status: "Available" as const, color: "#2563EB" },
  { id: 4, name: "Karthik Raja", initials: "KR", blood: "B+", city: "Madurai", phone: "65432•••••", fullPhone: "+91 65432 10987", status: "Not Available" as const, color: "#D97706" },
  { id: 5, name: "Ananya Iyer", initials: "AI", blood: "O-", city: "Trichy", phone: "54321•••••", fullPhone: "+91 54321 09876", status: "Available" as const, color: "#16A34A" },
  { id: 6, name: "Vikram Singh", initials: "VS", blood: "B-", city: "Salem", phone: "43210•••••", fullPhone: "+91 43210 98765", status: "Pending" as const, color: "#0891B2" },
  { id: 7, name: "Kavya Reddy", initials: "KR", blood: "AB+", city: "Chennai", phone: "32109•••••", fullPhone: "+91 32109 87654", status: "Available" as const, color: "#C0152A" },
  { id: 8, name: "Arjun Mehta", initials: "AM", blood: "A-", city: "Chennai", phone: "21098•••••", fullPhone: "+91 21098 76543", status: "Not Available" as const, color: "#2563EB" },
  { id: 9, name: "Sunita Das", initials: "SD", blood: "AB-", city: "Coimbatore", phone: "10987•••••", fullPhone: "+91 10987 65432", status: "Available" as const, color: "#7C3AED" },
  { id: 10, name: "Mohan Lal", initials: "ML", blood: "O+", city: "Madurai", phone: "09876•••••", fullPhone: "+91 09876 54321", status: "Available" as const, color: "#D97706" },
  { id: 11, name: "Divya Patel", initials: "DP", blood: "B+", city: "Chennai", phone: "98761•••••", fullPhone: "+91 98761 23456", status: "Available" as const, color: "#16A34A" },
  { id: 12, name: "Sanjay Gupta", initials: "SG", blood: "A+", city: "Salem", phone: "87651•••••", fullPhone: "+91 87651 23456", status: "Not Available" as const, color: "#C0152A" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface ContactModalProps {
  donor: typeof ALL_DONORS[0];
  onClose: () => void;
}

function ContactModal({ donor, onClose }: ContactModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#1A1F2E] rounded-[16px] p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white"
            style={{ background: donor.color, fontSize: "18px", fontWeight: 700 }}
          >
            {donor.initials}
          </div>
          <div>
            <h3 className="text-[#111827] dark:text-white" style={{ fontSize: "16px", fontWeight: 700 }}>
              {donor.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <BloodGroupBadge group={donor.blood} size="sm" />
              <span className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "12px" }}>
                📍 {donor.city}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#F9FAFB] dark:bg-[#0D1117] rounded-xl p-4 mb-4">
          <p className="text-[#6B7280] dark:text-gray-400 mb-1" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em" }}>
            CONTACT NUMBER
          </p>
          <p className="text-[#111827] dark:text-white" style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {donor.fullPhone}
          </p>
        </div>
        <a
          href={`https://wa.me/${donor.fullPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white"
          style={{ background: "#16A34A", fontSize: "14px", fontWeight: 600 }}
        >
          <MessageCircle className="w-4 h-4" />
          Contact on WhatsApp
        </a>
      </div>
    </div>
  );
}

export function SearchDonors() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [revealedPhones, setRevealedPhones] = useState<Set<number>>(new Set());
  const [contactModal, setContactModal] = useState<typeof ALL_DONORS[0] | null>(null);
  const [searched, setSearched] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const toggleGroup = (g: string) =>
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const toggleReveal = (id: number) =>
    setRevealedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filtered = ALL_DONORS.filter((d) => {
    const groupMatch = selectedGroups.length === 0 || selectedGroups.includes(d.blood);
    const cityMatch = !cityFilter || d.city.toLowerCase().includes(cityFilter.toLowerCase());
    const availMatch = !availableOnly || d.status === "Available";
    return groupMatch && cityMatch && availMatch;
  });

  const handleSearch = () => setSearched(true);
  const handleClear = () => {
    setSelectedGroups([]);
    setCityFilter("");
    setAvailableOnly(false);
    setSearched(false);
  };

  const results = searched ? filtered : ALL_DONORS;

  return (
    <div className="p-6 lg:p-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#111827] dark:text-white" style={{ fontSize: "24px", fontWeight: 700 }}>
          Search Donors
        </h1>
        <p className="text-[#6B7280] dark:text-gray-400 mt-0.5" style={{ fontSize: "14px" }}>
          Find available blood donors in your area
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-4 mb-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <div className="flex flex-wrap gap-3 items-end">
          {/* Blood Group Multi-select */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
              BLOOD GROUP
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGroup(g)}
                  className="px-3 py-1 rounded-full border transition-all"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderColor: selectedGroups.includes(g) ? "#C0152A" : "#E5E7EB",
                    background: selectedGroups.includes(g) ? "#FDECEE" : "transparent",
                    color: selectedGroups.includes(g) ? "#C0152A" : "#6B7280",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="min-w-[160px]">
            <label className="block text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
              CITY / LOCATION
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 bg-[#F9FAFB] dark:bg-[#0D1117] text-[#111827] dark:text-gray-100 focus:border-[#C0152A] focus:ring-2 focus:ring-[#C0152A]/20 outline-none placeholder-[#9CA3AF] dark:placeholder-gray-600"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="block text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
              AVAILABILITY
            </label>
            <div className="flex rounded-lg border border-[#E5E7EB] dark:border-gray-600 overflow-hidden">
              {[{ label: "All", val: false }, { label: "Available Only", val: true }].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAvailableOnly(opt.val)}
                  className="px-3 py-2 transition-all"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    background: availableOnly === opt.val ? "#C0152A" : "transparent",
                    color: availableOnly === opt.val ? "#fff" : "#6B7280",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white"
              style={{ background: "#C0152A", fontSize: "13px", fontWeight: 600 }}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            {searched && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-gray-600 text-[#6B7280] dark:text-gray-400 hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors"
                style={{ fontSize: "13px" }}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[#6B7280] dark:text-gray-400" style={{ fontSize: "13px" }}>
          Showing{" "}
          <span className="text-[#111827] dark:text-white" style={{ fontWeight: 600 }}>
            {results.filter((d) => d.status === "Available").length} available
          </span>{" "}
          donors
          {selectedGroups.length > 0 && ` for ${selectedGroups.join(", ")}`}
          {cityFilter && ` in ${cityFilter}`}
        </p>
      </div>

      {/* Donor Cards or Empty State */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: "#FDECEE" }}
          >
            <Droplets className="w-10 h-10" style={{ color: "#C0152A" }} />
          </div>
          <h3 className="text-[#111827] dark:text-white mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
            🩸 No donors found
          </h3>
          <p className="text-[#6B7280] dark:text-gray-400 mb-6 max-w-sm" style={{ fontSize: "14px" }}>
            No available donors found
            {selectedGroups.length > 0 && ` for ${selectedGroups.join(", ")}`}
            {cityFilter && ` in ${cityFilter}`}. Try expanding your search area or check back later.
          </p>
          <button
            onClick={handleClear}
            className="px-5 py-2.5 rounded-lg border-2 border-[#C0152A] text-[#C0152A] hover:bg-[#FDECEE] transition-colors"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((donor) => (
            <div
              key={donor.id}
              className={`bg-white dark:bg-[#1A1F2E] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700/50 p-5 transition-all ${
                donor.status === "Not Available" ? "opacity-50" : "hover:shadow-lg dark:hover:shadow-black/30 hover:-translate-y-0.5"
              }`}
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
            >
              {/* Avatar + Blood */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: donor.color, fontSize: "16px", fontWeight: 700 }}
                >
                  {donor.initials}
                </div>
                <BloodGroupBadge group={donor.blood} />
              </div>

              {/* Info */}
              <h3 className="text-[#111827] dark:text-gray-100 mb-1" style={{ fontSize: "15px", fontWeight: 600 }}>
                {donor.name}
              </h3>
              <div className="flex items-center gap-1 text-[#6B7280] dark:text-gray-400 mb-2" style={{ fontSize: "12px" }}>
                <MapPin className="w-3 h-3" />
                <span>{donor.city}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-3 h-3 text-[#6B7280] dark:text-gray-400" />
                <span
                  className="text-[#6B7280] dark:text-gray-400"
                  style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {revealedPhones.has(donor.id) ? donor.fullPhone : donor.phone}
                </span>
                <button
                  onClick={() => toggleReveal(donor.id)}
                  className="text-[#C0152A] dark:text-[#ff6b7a] hover:opacity-70"
                >
                  {revealedPhones.has(donor.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>

              {/* Status */}
              <div className="mb-4">
                <StatusBadge status={donor.status} compact />
              </div>

              {/* CTA */}
              {donor.status !== "Not Available" && (
                <button
                  onClick={() => setContactModal(donor)}
                  className="w-full py-2.5 rounded-lg text-white transition-all hover:opacity-90"
                  style={{ background: "#C0152A", fontSize: "12px", fontWeight: 600 }}
                >
                  Contact Donor
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <ContactModal donor={contactModal} onClose={() => setContactModal(null)} />
      )}
    </div>
  );
}
