import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ItemTopic from "../../components/ItemTopic";
import TitleCourse from "../../components/TitleCourse";
import learnServices from "../../services/learn.service";
import useAuthStore from "../../store/useAuthStore";

const LearnCourseDetail = () => {
  const navigate = useNavigate();
  const course = useLoaderData();
  const [progress, setProgress] = useState([]);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    const fetchProgress = async () => {
      if (user && course) {
        try {
          const completedTopicIds = await learnServices.getCourseProgress(
            course.id,
          );
          setProgress(completedTopicIds);
        } catch (error) {
          console.error("Failed to fetch course progress:", error);
        }
      }
    };
    fetchProgress();
  }, [user, course]);

  return (
    <div onClick={() => navigate("/learn")}>
      <div onClick={(e) => e.stopPropagation()}>
        <div onClick={() => navigate("/learn")} className="cursor-pointer">
          <TitleCourse label={course.title}></TitleCourse>
        </div>
        {course.topics && course.topics.length > 0 && (
          <div className="px-3 lg:px-26 flex flex-col gap-y-3 lg:gap-y-5 pb-24 lg:pb-0">
            {course.topics.map((topic) => {
              const isCompleted = progress.includes(topic.id);
              const isLocked =
                topic.isPremium &&
                (!user?.accountPremium ||
                  new Date(user.subscriptionEndDate) < new Date());
              return (
                <ItemTopic
                  key={topic.id}
                  topic={topic}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                ></ItemTopic>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default LearnCourseDetail;
