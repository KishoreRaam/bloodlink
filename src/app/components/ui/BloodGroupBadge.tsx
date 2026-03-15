type BloodGroup = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

interface BloodGroupBadgeProps {
  group: string;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  "O+":  { bg: "#FDECEE", text: "#C0152A", darkBg: "#C0152A22", darkText: "#ff6b7a" },
  "O-":  { bg: "#FDECEE", text: "#C0152A", darkBg: "#C0152A22", darkText: "#ff6b7a" },
  "A+":  { bg: "#EFF6FF", text: "#1D4ED8", darkBg: "#1D4ED822", darkText: "#93c5fd" },
  "A-":  { bg: "#EFF6FF", text: "#1D4ED8", darkBg: "#1D4ED822", darkText: "#93c5fd" },
  "B+":  { bg: "#F5F3FF", text: "#6D28D9", darkBg: "#6D28D922", darkText: "#c4b5fd" },
  "B-":  { bg: "#F5F3FF", text: "#6D28D9", darkBg: "#6D28D922", darkText: "#c4b5fd" },
  "AB+": { bg: "#FFFBEB", text: "#D97706", darkBg: "#D9770622", darkText: "#fcd34d" },
  "AB-": { bg: "#FFFBEB", text: "#D97706", darkBg: "#D9770622", darkText: "#fcd34d" },
};

export function BloodGroupBadge({ group, inverted = false, size = "md" }: BloodGroupBadgeProps) {
  const colors = colorMap[group] || colorMap["O+"];

  const sizeStyles = {
    sm: { height: "22px", minWidth: "38px", fontSize: "10px", padding: "0 7px" },
    md: { height: "28px", minWidth: "48px", fontSize: "12px", padding: "0 10px" },
    lg: { height: "34px", minWidth: "60px", fontSize: "14px", padding: "0 14px" },
  };

  if (inverted) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-white/30"
        style={{
          ...sizeStyles[size],
          background: "rgba(255,255,255,0.2)",
          color: "#fff",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          backdropFilter: "blur(4px)",
        }}
      >
        {group}
      </span>
    );
  }

  return (
    <span
      className="blood-group-badge inline-flex items-center justify-center rounded-full"
      style={{
        ...sizeStyles[size],
        background: colors.bg,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        border: `1px solid ${colors.text}22`,
      }}
    >
      {group}
    </span>
  );
}
