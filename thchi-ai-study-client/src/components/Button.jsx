const Button = ({ children, style = "", onClick }) => {
  // Tổ hợp class tạo hiệu ứng 3D chuẩn UI Duolingo
  const styleBase =
    "inline-flex items-center justify-center font-bold uppercase tracking-wide text-white text-[15px] " +
    "px-10 py-3.5 rounded-2xl cursor-pointer select-none transition-all duration-150 " +
    "bg-[#58cc02] hover:bg-[#61e002] " +
    "shadow-[0_5px_0_#459804] " +
    "active:shadow-[0_0px_0_#459804] active:translate-y-[5px]";

  return (
    <button onClick={onClick} className={`${styleBase} ${style}`}>
      {children}
    </button>
  );
};

export default Button;
