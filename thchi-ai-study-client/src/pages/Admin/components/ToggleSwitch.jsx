
const ToggleSwitch = ({ checked, onChange, loading = false }) => (
  <button
    onClick={onChange}
    disabled={loading}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
      loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    } ${checked ? "bg-yellow-400" : "bg-gray-300"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);
export default ToggleSwitch;
