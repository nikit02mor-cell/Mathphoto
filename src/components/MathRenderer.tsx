import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  block = false,
}) => {
  if (!content) return null;

  // If block is explicitly true and content is a pure formula
  if (block) {
    try {
      const cleanContent = content.replace(/^\$\$/g, '').replace(/\$\$$/g, '');
      const html = katex.renderToString(cleanContent, {
        displayMode: true,
        throwOnError: false,
      });
      return (
        <div
          className={`overflow-x-auto py-2 text-center select-all ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <div className={`font-mono text-sm ${className}`}>{content}</div>;
    }
  }

  // Parse text that has mixed content with $$...$$ and $...$
  const renderFormattedText = (text: string) => {
    // Split by block formulas first: $$...$$
    const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return blockParts.map((part, blockIdx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathExpr = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathExpr, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={`block-${blockIdx}`}
              className="my-3 overflow-x-auto rounded-lg bg-indigo-50/50 p-2 dark:bg-slate-800/60"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <div key={`block-${blockIdx}`} className="font-mono text-sm my-2">
              {part}
            </div>
          );
        }
      }

      // Inside regular text or inline parts: split by $...$
      const inlineParts = part.split(/(\$[^\$\n]+?\$)/g);

      return (
        <span key={`text-${blockIdx}`}>
          {inlineParts.map((subPart, inlineIdx) => {
            if (subPart.startsWith('$') && subPart.endsWith('$') && subPart.length > 2) {
              const mathExpr = subPart.slice(1, -1);
              try {
                const html = katex.renderToString(mathExpr, {
                  displayMode: false,
                  throwOnError: false,
                });
                return (
                  <span
                    key={`inline-${inlineIdx}`}
                    className="inline-block px-1 align-baseline select-all"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch {
                return (
                  <span key={`inline-${inlineIdx}`} className="font-mono text-sm">
                    {subPart}
                  </span>
                );
              }
            }

            // Normal text with line breaks preserved
            return (
              <span key={`plain-${inlineIdx}`} className="whitespace-pre-wrap">
                {subPart}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return <div className={`math-content ${className}`}>{renderFormattedText(content)}</div>;
};
