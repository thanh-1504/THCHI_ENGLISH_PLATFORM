const RoleBadge = ({ role }) => {
  const styles = {
    USER: "bg-blue-100 text-blue-600",
    PREMIUM: "bg-purple-100 text-purple-600",
    ADMIN: "bg-orange-100 text-orange-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[role] || "bg-gray-100 text-gray-500"
      }`}
    >
      {role}
    </span>
  );
};
export default RoleBadge;
