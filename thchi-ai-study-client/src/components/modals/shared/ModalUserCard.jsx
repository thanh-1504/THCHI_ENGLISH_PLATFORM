import { Calendar, Camera, Mail, Pencil } from "lucide-react";
import { useState } from "react";

import userService from "../../../services/user.service";
import useAuthStore from "../../../store/useAuthStore";
import formatDate from "../../../utils/formatDate";
import ChangeAvatarModal from "../ChangeAvatarModal";
import ChangeNameModal from "../ChangeNameModal";

const ModalUserCard = ({ showEditName = false, onNameSave }) => {
  const { user, setUser } = useAuthStore();
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);
  const [showChangeName, setShowChangeName] = useState(false);

  const [nameValue, setNameValue] = useState(user?.name || "");

  const handleSaveAvatar = async (file) => {
    try {
      const uploadedResult = await userService.uploadImage(file);

      if (user.avatarPublicId) {
        await userService.deleteImage(user.avatarPublicId);
      }

      await userService.update({
        avatarUrl: uploadedResult.url,
        avatarPublicId: uploadedResult.publicId,
      });

      setUser({
        ...user,
        avatarUrl: uploadedResult.url,
        avatarPublicId: uploadedResult.publicId,
      });

      setShowChangeAvatar(false);
    } catch (error) {
      console.error("Lỗi cập nhật ảnh đại diện:", error);
      throw error;
    }
  };

  const handleSaveName = async (newName) => {
    try {
      await userService.update({ name: newName });

      setNameValue(newName);
      onNameSave?.(newName);

      setShowChangeName(false);
      setUser({ ...user, name: newName });
    } catch (error) {
      console.error("Lỗi cập nhật tên", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-28 h-28 rounded-full border-4 border-green-400 overflow-hidden bg-gray-100 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-(image:--my-gradient) select-none"
              style={{ display: user?.avatarUrl ? "none" : "flex" }}
            >
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setShowChangeAvatar(true)}
            className="absolute bottom-2 -right-2 w-8 h-8 bg-white rounded-full border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-40"
          >
            <Camera size={16} className="text-gray-500 cursor-pointer" />
          </button>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-gradient text-white font-bold px-4 py-1 rounded-full shadow z-30">
            {user?.accountPremium ? "PREMIUM" : "FREE"}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-800">
              {nameValue || user?.name || "THCHI"}
            </span>
            {showEditName && (
              <button
                onClick={() => setShowChangeName(true)}
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail size={15} className="shrink-0 text-gray-400" />
            <span>
              <span className="font-semibold text-gray-600">Email: </span>
              <span className="text-blue-500">{user?.email ?? ""}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={15} className="shrink-0 text-gray-400" />
            <span>
              <span className="font-semibold text-gray-600">
                Ngày kích hoạt:{" "}
              </span>
              {formatDate(user?.createdAt) ?? ""}
            </span>
          </div>
        </div>
      </div>

      {showChangeAvatar && (
        <ChangeAvatarModal
          onClose={() => setShowChangeAvatar(false)}
          onSave={handleSaveAvatar}
        />
      )}

      {showChangeName && (
        <ChangeNameModal
          currentName={nameValue}
          onClose={() => setShowChangeName(false)}
          onSave={handleSaveName}
        />
      )}
    </>
  );
};

export default ModalUserCard;
