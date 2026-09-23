import { useNavigate } from "react-router-dom";
import learnServices from "../../../services/learn.service";
import useUIStore from "../../../store/useUIStore";
const ItemCourse = ({ course }) => {
  const navigate = useNavigate();
  const { setIsOpenModal, setIsSelectedCourse } = useUIStore();
  const handleClick = async () => {
    try {
      await learnServices.enrollCourse(course.id);
      setIsOpenModal(false);
      setIsSelectedCourse(true);
      navigate(`/learn/${course.id}`);
    } catch (error) {
      console.error("Lỗi khi enroll khóa học:", error);
    }
  };
  return (
    <div
      onClick={handleClick}
      className="px-3 py-2 first:bg-yellow-400 bg-[#e3e3e379] shadow-lg mt-5 mx-0 sm:mx-40 rounded-2xl hover:opacity-80 transition-opacity duration-100 hover:cursor-pointer"
    >
      <p className="uppercase text-neutral-800 font-semibold pl-4 text-2xl mb-4 mt-2">
        {course.title}
      </p>
      <div>
        <div className="flex items-center">
          <img
            src="goal.png"
            alt="Mục tiêu"
            className="w-20 h-20 object-cover"
          />
          <span className="text-lg"> {course.subtitle}</span>
        </div>
        <div className="flex items-center">
          <img src="hat.png" alt="hat" className="w-20 h-20 object-cover" />
          <span className="text-lg">{course.description}</span>
        </div>
      </div>
    </div>
  );
};
export default ItemCourse;
