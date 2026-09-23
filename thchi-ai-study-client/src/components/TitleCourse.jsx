import useUIStore from "../store/useUIStore";

export default function TitleCourse({ label = "1000 TỪ CƠ BẢN", onClick }) {
  const { setIsSelectedCourse, setIsOpenModal } = useUIStore();
  return (
    <div className="flex justify-center items-center min-h-[80px] sm:min-h-[200px] bg-white p-0 py-4 sm:py-0">
      <div
        onClick={() => {
          setIsOpenModal(true);
        }}
        className="relative w-max cursor-pointer"
      >
        <div className="absolute top-3 -left-4 sm:-left-6 md:-left-8 w-16 sm:w-24 h-full bg-[#FF8A00] rounded-l-full z-0"></div>

        <div className="absolute top-3 -right-4 sm:-right-6 md:-right-8 w-16 sm:w-24 h-full bg-[#FF8A00] rounded-r-full z-0"></div>

        <div className="relative z-10 bg-[#FFCC00] rounded-full px-10 sm:px-16 md:px-32 py-3 sm:py-4 md:py-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] flex items-center justify-center">
          <span className="font-bold text-base sm:text-xl md:text-xl uppercase tracking-wide text-black whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
