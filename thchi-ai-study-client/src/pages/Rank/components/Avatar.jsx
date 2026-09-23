const getInitial = (name = "") => (name ? name.charAt(0).toUpperCase() : "?");

const Avatar = ({ src, name, size = "md", ring = "" }) => {
  // Cấu hình các kích thước
  const sizes = {
    xs: "w-8 h-8 text-xs", // Kích thước dùng cho bảng AdminPost
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  // Danh sách màu động
  const colors = [
    "bg-blue-400",
    "bg-purple-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-orange-400",
  ];

  const char = getInitial(name);
  const color = colors[(char.charCodeAt(0) || 0) % colors.length];

  // Nếu có ảnh thì hiển thị ảnh
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 shadow-sm ${sizes[size]} ${ring}`}
      />
    );
  }

  // Nếu không có ảnh thì hiển thị chữ cái đầu với màu nền
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm ${color} ${sizes[size]} ${ring}`}
    >
      {char}
    </div>
  );
};

export default Avatar;
