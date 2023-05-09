const Icon = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div
      onClick={onClick}
      className={`transition-all inline-block flex flex-wrap items-center justify-center p-1 w-9 h-9 text-center leading-7 rounded-md text-slate-600 cursor-pointer hover:bg-slate-100 active:bg-slate-200 ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  );
};

export default Icon;
