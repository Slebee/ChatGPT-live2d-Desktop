import React, { useImperativeHandle } from 'react';

type ChatContainerProps = {
  children?: React.ReactNode;
};
export type ChatContainerRef = {
  scrollToBottom: () => void;
};
export default React.forwardRef(({ children }: ChatContainerProps, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (containerRef.current) {
        setTimeout(() => {
          containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
        }, 50);
      }
    },
  }));
  return (
    <div className="h-full  bg-slate-50">
      <div
        className="h-full w-full overflow-x-hidden overflow-y-auto"
        ref={containerRef}
      >
        {children}
      </div>
    </div>
  );
});
