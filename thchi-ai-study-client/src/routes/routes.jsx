import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "../App";
import AdminLayout from "../layouts/AdminLayout";
import AdminCourse from "../pages/Admin/AdminCourse";
import AdminCourseDetail from "../pages/Admin/AdminCourseDetail";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import { adminLoader } from "../pages/Admin/adminLoader";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminPost from "../pages/Admin/AdminPost";
import AdminPremium from "../pages/Admin/AdminPremium";
import AdminRankConfig from "../pages/Admin/AdminRankConfig";
import AdminTopicVocabManager from "../pages/Admin/AdminTopicVocabManager";
import AdminTransaction from "../pages/Admin/AdminTransaction";
import AdminUser from "../pages/Admin/AdminUser";
import AdminUserDetail from "../pages/Admin/AdminUserDetail";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import RegisterMethod from "../pages/Auth/RegisterMethod";
import ResetPassword from "../pages/Auth/ResetPassword";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import Checkout from "../pages/Checkout/Checkout";
import Community from "../pages/Community/Community";
import { communityLoader } from "../pages/Community/community.loader";
import CommunityMyPost from "../pages/Community/CommunityMyPost";
import Home from "../pages/Home";
import Learn from "../pages/Learn/Learn";
import { learnLoader } from "../pages/Learn/learn.loader";
import LearnCourseDetail from "../pages/Learn/LearnCourseDetail";
import Learning from "../pages/Learn/Learning";
import Notebook from "../pages/Notebook/Notebook";
import { notebookLoader } from "../pages/Notebook/notebook.loader";
import NotebookActive from "../pages/Notebook/NotebookActive";
import PaymentResultPage from "../pages/Payment/PaymentResultPage";
import Practice from "../pages/Practice/Practice";
import PracticeAIQuizlet from "../pages/Practice/PracticeAIQuizlet";
import PracticeSpeaking from "../pages/Practice/PracticeSpeaking";
import PracticeWrite from "../pages/Practice/PracticeWrite";
import Premium from "../pages/Premium/Premium";
import { premiumLoader } from "../pages/Premium/premiumLoader";
import Rank from "../pages/Rank/Rank";
import { rankLoader } from "../pages/Rank/rank.loader";
import Review from "../pages/Review/Review";
import { reviewLoader } from "../pages/Review/review.loader";
import Reviewing from "../pages/Review/Reviewing";
import { streakLoader } from "../pages/Streak/loaders/streak.loader";
import Streak from "../pages/Streak/Streak";
import { getMeLoader } from "../utils/getMeLoader";
import { guestLoader } from "../utils/guestLoader";

const router = createBrowserRouter([
  {
    children: [
      // --- App Routes ---
      {
        path: "/",
        element: <App />,
        children: [
          {
            element: <Home />,
            children: [
              {
                path: "/review",
                element: <Review />,
                loader: reviewLoader,
              },
              {
                path: "/learn",
                element: <Learn />,
                loader: learnLoader.getCourses,
              },
              {
                path: "/learn/:id",
                element: <LearnCourseDetail />,
                loader: ({ params }) => learnLoader.getCourse(params.id),
              },
              {
                path: "/notebook",
                element: <Notebook />,
                loader: notebookLoader.getNotebook,
              },
              {
                path: "/notebook/word-status/:status",
                element: <NotebookActive />,
                loader: ({ params }) =>
                  notebookLoader.getNotebookByStatus(
                    params.status.toUpperCase(),
                  ),
              },
              {
                path: "/rank",
                element: <Rank />,
                loader: rankLoader.getLeaderboard,
              },
              {
                path: "/community",
                element: <Community />,
                loader: communityLoader.getData,
              },
              {
                path: "/community/my-post",
                element: <CommunityMyPost />,
                loader: communityLoader.getMyPost,
              },
              {
                path: "/practice",
                element: <Outlet />,
                children: [
                  {
                    index: true,
                    element: <Practice />,
                  },
                  {
                    path: "write",
                    element: <PracticeWrite />,
                  },
                  { path: "speak", element: <PracticeSpeaking /> },
                  {
                    path: "ai-quizlet",
                    element: <PracticeAIQuizlet />,
                  },
                ],
              },
              {
                path: "/streak",
                loader: streakLoader.getMyStreak,
                element: <Streak />,
              },
            ],
          },
        ],
      },

      // --- Premium & Payment ---
      {
        path: "/premium",
        element: <Premium />,
        loader: premiumLoader.getAllPlans,
      },
      {
        path: "/checkout/:id",
        element: <Checkout />,
      },
      {
        path: "/payment/result",
        element: <PaymentResultPage />,
      },

      // --- Learning Route ---
      {
        path: "/learning/:topicId",
        element: <Learning />,
        loader: ({ params }) => {
          return learnLoader.getTopicIncludeWord(params.topicId);
        },
      },
      {
        path: "/review/:id",
        element: <Reviewing />,
      },

      // --- User Auth Routes ---
      {
        loader: guestLoader,
        children: [
          { path: "/login", element: <Login /> },
          {
            path: "/register",
            element: <RegisterMethod />,
          },
          {
            path: "/register-email",
            element: <Register />,
          },
          {
            path: "/verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "/forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "/reset-password",
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },

  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  {
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        loader: getMeLoader,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/users", element: <AdminUser /> },
          { path: "/admin/users/:id", element: <AdminUserDetail /> },
          { path: "/admin/premiums", element: <AdminPremium /> },
          { path: "/admin/transaction", element: <AdminTransaction /> },
          { path: "/admin/courses", element: <AdminCourse /> },
          { path: "/admin/courses/:id", element: <AdminCourseDetail /> },
          {
            path: "/admin/courses/:id/manage-topic/:topicId?",
            loader: ({ params }) => {
              return adminLoader.getTopicWordById(params.topicId);
            },
            element: <AdminTopicVocabManager />,
          },
          { path: "/admin/posts", element: <AdminPost /> },
          { path: "/admin/rank-config", element: <AdminRankConfig /> },
        ],
      },
    ],
  },
]);

export default router;
