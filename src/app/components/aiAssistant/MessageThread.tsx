import { Bot, User } from 'lucide-react';
import type { RefObject } from 'react';
import type { AIMessage } from '../../../data/mockData';

interface MessageThreadProps {
  messages: AIMessage[];
  isTyping: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export function MessageThread({ messages, isTyping, bottomRef }: MessageThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'assistant'
                ? 'bg-ide-syntax-keyword'
                : 'bg-ide-accent'
            }`}
          >
            {msg.role === 'assistant' ? (
              <Bot size={13} className="text-white" />
            ) : (
              <User size={13} className="text-white" />
            )}
          </div>

          <div
            className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`px-2.5 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-ide-accent-dark text-white'
                  : 'bg-ide-tab-bg text-ide-text'
              }`}
            >
              <div className="text-[12px] leading-[1.5] whitespace-pre-wrap">
                {msg.content.split('\n').map((line, lineIndex) => {
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <div key={lineIndex}>
                      {parts.map((part, partIndex) => (
                        partIndex % 2 === 1 ? (
                          <strong key={partIndex} className="text-white">
                            {part}
                          </strong>
                        ) : part.includes('`') ? (
                          part.split(/`([^`]+)`/g).map((inlinePart, inlineIndex) => (
                            inlineIndex % 2 === 1 ? (
                              <code
                                key={`${partIndex}-${inlineIndex}`}
                                className="bg-ide-bg text-ide-syntax-string px-1 rounded text-[11px]"
                              >
                                {inlinePart}
                              </code>
                            ) : (
                              <span key={`${partIndex}-${inlineIndex}`}>{inlinePart}</span>
                            )
                          ))
                        ) : (
                          <span key={partIndex}>{part}</span>
                        )
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {msg.codeBlock && (
              <div className="w-full bg-ide-bg rounded border border-ide-border overflow-hidden">
                <div className="flex items-center justify-between px-2 py-1 bg-ide-tab-bg border-b border-ide-border">
                  <span className="text-ide-text-muted text-[10px]">verilog</span>
                  <button className="text-ide-text-muted hover:text-ide-text transition-colors text-[10px]">
                    Copy
                  </button>
                </div>
                <pre className="px-3 py-2 text-ide-info overflow-x-auto text-[11px] font-mono">
                  <code>{msg.codeBlock}</code>
                </pre>
              </div>
            )}

            <span className="text-ide-text-dim text-[10px]">{msg.timestamp}</span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-ide-syntax-keyword flex items-center justify-center shrink-0">
            <Bot size={13} className="text-white" />
          </div>
          <div className="flex items-center gap-1 px-3 py-2 bg-ide-tab-bg rounded-lg">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 bg-ide-text-muted rounded-full animate-bounce"
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}