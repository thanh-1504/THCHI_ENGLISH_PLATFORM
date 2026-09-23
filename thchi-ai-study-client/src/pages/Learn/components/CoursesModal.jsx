import { useEffect } from "react";
import HeaderModal from "./HeaderModal";
import ItemCourse from "./ItemCourse";
const CoursesModal = ({ courses }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="relative w-full sm:w-[67%] bg-white h-screen flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <HeaderModal />
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          {courses &&
            courses.length > 0 &&
            courses.map((course) => (
              <ItemCourse key={course.id} course={course} />
            ))}
        </div>
      </div>
    </div>
  );
};
export default CoursesModal;
