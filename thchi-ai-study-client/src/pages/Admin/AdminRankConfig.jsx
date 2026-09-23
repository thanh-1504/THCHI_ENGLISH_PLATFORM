import { Pencil, Plus, RefreshCw, Trash2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import adminService from "../../services/admin.service";
import RankConfigModal from "./components/RankConfigModal";
import TierBadge from "./components/TierBadge";

const AdminRankConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRankTierConfigs();
      setConfigs(data);
    } catch {
      toast.error("Không thể tải danh sách cấu hình xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleOpenAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (config) => {
    setEditData(config);
    setModalOpen(true);
  };

  const handleDelete = async (config) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      html: `Bạn có chắc muốn xóa mức xếp hạng <b>${config.tier}</b>?<br/>Hành động này không thể hoàn tác.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });
    if (!result.isConfirmed) return;
    try {
      await adminService.deleteRankTierConfig(config.id);
      toast.success(`Đã xóa mức xếp hạng ${config.tier}`);
      fetchConfigs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Cài đặt xếp hạng
          </h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus size={17} />
          <span className="hidden xs:inline sm:inline">Thêm mức xếp hạng</span>
          <span className="xs:hidden sm:hidden">Thêm</span>
        </button>
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 sm:mb-6">
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm sm:text-base">Danh sách mức xếp hạng</h2>
          <button
            onClick={fetchConfigs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* ── Desktop Table (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 w-16">
                  THỨ TỰ
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  TÊN XẾP HẠNG
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  XP YÊU CẦU
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  MÔ TẢ
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  XP DUY TRÌ
                </th>
                <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  HÀNH ĐỘNG
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                        <Trophy size={24} className="text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        Chưa có mức xếp hạng nào
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="text-sm text-amber-500 hover:text-amber-600 font-semibold"
                      >
                        + Thêm mức đầu tiên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                configs.map((config, index) => (
                  <tr
                    key={config.id}
                    className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700">{index + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <TierBadge tier={config.tier} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-800">
                        {config.xpRequired.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {config.description || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-700">
                        {config.xpToMaintain.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(config)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(config)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (< md) ── */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-1/2" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-2/3" />
              </div>
            ))
          ) : configs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                  <Trophy size={24} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Chưa có mức xếp hạng nào
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="text-sm text-amber-500 hover:text-amber-600 font-semibold"
                >
                  + Thêm mức đầu tiên
                </button>
              </div>
            </div>
          ) : (
            configs.map((config, index) => (
              <div
                key={config.id}
                className="p-4 hover:bg-amber-50/20 transition-colors"
              >
                {/* Card top: index + TierBadge + actions */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-gray-400 w-5 text-center">
                      {index + 1}
                    </span>
                    <TierBadge tier={config.tier} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(config)}
                      className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-500 hover:bg-amber-50 transition-all"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={13} />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(config)}
                      className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                {/* Card stats: 2-col grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-7">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">XP Yêu cầu</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {config.xpRequired.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">XP Duy trì</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {config.xpToMaintain.toLocaleString()}
                    </p>
                  </div>
                  {config.description && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Mô tả</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <RankConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchConfigs}
        editData={editData}
      />
    </div>
  );
};

export default AdminRankConfig;
