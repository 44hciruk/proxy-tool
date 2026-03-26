const Tooltip = ({ text }: { text: string }) => (
  <span className="relative group inline-flex items-center ml-1">
    <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400
                     text-xs flex items-center justify-center cursor-help
                     hover:border-blue-400 hover:text-blue-400 transition-colors">
      i
    </span>
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                     w-64 bg-gray-800 text-white text-xs rounded-lg px-3 py-2
                     opacity-0 group-hover:opacity-100 transition-opacity
                     pointer-events-none z-50 shadow-lg">
      {text}
      <span className="absolute left-1/2 -translate-x-1/2 top-full
                       border-4 border-transparent border-t-gray-800"/>
    </span>
  </span>
);

export default Tooltip;
