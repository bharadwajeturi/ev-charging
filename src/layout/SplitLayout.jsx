export default function SplitLayout({ left, right }) {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">

      {/* LEFT PANEL */}
      <div
        className="
          bg-white/70 backdrop-blur
          border-r border-gray-200
          p-4
          overflow-y-auto

          w-full
          md:w-[380px]          /* Tablet */
          lg:w-[400px]          /* Desktop */
          xl:w-[420px]

          transition-all duration-300
        "
      >
        {left}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 relative">
        {right}
      </div>

    </div>
  );
}
