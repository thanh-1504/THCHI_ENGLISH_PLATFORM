const formatDate = (date) => {
  const formatDate = new Date(date);

  return formatDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default formatDate;
