export default function CenteredOverlay({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          background: "#15191e",
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ opacity: 0.9 }}>{subtitle}</div>
      </div>
    </div>
  );
}
