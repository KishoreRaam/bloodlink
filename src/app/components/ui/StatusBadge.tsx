type Status = "Available" | "Not Available" | "Pending" | "Fulfilled" | "Urgent";

interface StatusBadgeProps {
  status: Status;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const configs: Record<Status, { dot: string; text: string; bg: string; label: string }> = {
    Available: {
      dot: "#16A34A",
      text: "#15803D",
      bg: "#F0FDF4",
      label: "Available",
    },
    "Not Available": {
      dot: "#9CA3AF",
      text: "#6B7280",
      bg: "#F9FAFB",
      label: "Not Available",
    },
    Pending: {
      dot: "#F59E0B",
      text: "#D97706",
      bg: "#FFFBEB",
      label: "Pending",
    },
    Fulfilled: {
      dot: "#16A34A",
      text: "#15803D",
      bg: "#F0FDF4",
      label: "Fulfilled",
    },
    Urgent: {
      dot: "#C0152A",
      text: "#C0152A",
      bg: "#FDECEE",
      label: "Urgent",
    },
  };

  const config = configs[status];

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "Urgent" ? "animate-pulse" : ""}`}
          style={{ background: config.dot }}
        />
        <span style={{ color: config.text, fontSize: "12px", fontWeight: 500 }}>
          {config.label}
        </span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: config.bg, border: `1px solid ${config.dot}22` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === "Urgent" ? "animate-pulse" : ""}`}
        style={{ background: config.dot }}
      />
      <span style={{ color: config.text, fontSize: "12px", fontWeight: 500 }}>
        {config.label}
      </span>
    </span>
  );
}
