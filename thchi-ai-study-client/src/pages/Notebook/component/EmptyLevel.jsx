const EmptyLevel = () => {
  return (
    <div className="flex flex-col items-center text-center pt-10 pb-16 animate-fade-in">
      <img className="w-52 h-52 object-cover" src="/ThChi.png" alt="ThChi" />
      <div className="font-semibold text-lg text-gray-600 mt-3 max-w-xs leading-relaxed">
        <p>
          Không tìm được từ nào ở cấp độ này trong danh sách từ đã ôn của bạn.
        </p>
        <p className="mt-1 text-gray-400 font-normal text-sm">
          Bạn thử tìm từ ở cấp độ khác nha.
        </p>
      </div>
    </div>
  );
};

export default EmptyLevel;
