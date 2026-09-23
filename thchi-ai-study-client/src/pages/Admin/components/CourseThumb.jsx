import { PLACEHOLDER_COLORS } from "../../../utils/config.constant";

const CourseThumb = ({ course, size = "sm" }) => {
  const dim = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  if (course.imageUrl) {
    return (
      <img
        src={course.imageUrl}
        alt={course.title}
        className={`${dim} rounded-xl object-cover shrink-0`}
      />
    );
  }

  const colorClass =
    PLACEHOLDER_COLORS[
      course.title?.charCodeAt(0) % PLACEHOLDER_COLORS.length ?? 0
    ];
  const initials = course.title?.slice(0, 4).toUpperCase() ?? "?";

  return (
    <div
      className={`${dim} rounded-xl ${colorClass} text-white flex items-center justify-center shrink-0`}
    >
      <span className="text-xs font-extrabold leading-none">{initials}</span>
    </div>
  );
};
export default CourseThumb;
