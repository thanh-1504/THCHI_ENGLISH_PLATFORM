import { Suspense } from "react";
import { useLoaderData } from "react-router-dom";
import useNotebookStore from "../../store/useNotebookStore";
import CoursesModal from "./components/CoursesModal";

const Learn = () => {
  const { isNotebookEmpty} = useNotebookStore();
  const courses = useLoaderData();
  return (
    <Suspense fallback={<div>Loading</div>}>
      <div className="relative min-h-screen">
        {!isNotebookEmpty && <CoursesModal courses={courses}></CoursesModal>}
        {/*If user haven't chosen a lesson yet*/}
        {/* {!isNotebookEmpty && <RecommendationUI isOpenModal />} */}
        {/*If user chosen a lesson*/}
        {/* {courses.length > 0 &&
          isNotebookEmpty &&
          courses.map((course) => {
            return (
              <div key={course.id}>
                <div
                  onClick={() => {
                    setIsSelectedCourse(false);
                  }}
                  className="flex items-center gap-x-2 text-gray-400 hover:text-text-yellow cursor-pointer hover:transition-colors duration-150"
                >
                  <ArrowLeft size={18} />
                  <span>Xem danh sách khóa học</span>
                </div>
                <div>
                  <TitleCourse label={courses[0].title}></TitleCourse>
                  <div className="px-26 flex flex-col gap-y-5">
                    {course.topics.map((topic) => {
                      return (
                        <ItemTopic key={topic.id} topic={topic}></ItemTopic>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })} */}
      </div>
    </Suspense>
  );
};
export default Learn;
