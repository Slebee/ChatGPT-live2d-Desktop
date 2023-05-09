import { useState } from 'react';

export const useClipboard = ({
  source,
  copiedDuring,
}: {
  source: string;
  copiedDuring: number;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = (str?: string) => {
    navigator.clipboard.writeText(str ?? source);
    setCopied(true);
    setTimeout(() => setCopied(false), copiedDuring);
  };
  return { copied, copy };
};
