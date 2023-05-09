import { useState, useEffect } from 'react';

export default function TextTyper({
  text = '',
  interval = 500,
  onEnd = () => {},
}) {
  const [typedText, setTypedText] = useState('');

  const typingRender = (
    text: string,
    updater: (v: string) => void,
    interval: number,
  ) => {
    let localTypingIndex = 0;
    let localTyping = '';
    if (text) {
      let printer = setInterval(() => {
        if (localTypingIndex < text.length) {
          updater((localTyping += text[localTypingIndex]));
          localTypingIndex += 1;
        } else {
          localTypingIndex = 0;
          localTyping = '';
          clearInterval(printer);
          onEnd();
          //  return setter && setter(value)
        }
      }, interval);
    }
  };
  useEffect(() => {
    typingRender(text, setTypedText, interval);
  }, [text, interval]);

  return <span>{typedText}</span>;
}
