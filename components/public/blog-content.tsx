'use client';

import ReactMarkdown from 'react-markdown';

export function BlogContent({ content }: { content: string }) {
  return (
    <div className="blog-content" style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--muted)' }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ marginTop: 24 }}>{children}</p>,
          h2: ({ children }) => <h2 style={{ marginTop: 40, fontSize: 28, color: 'var(--ink)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ marginTop: 32, fontSize: 22, color: 'var(--ink)' }}>{children}</h3>,
          ul: ({ children }) => <ul style={{ marginTop: 16, paddingLeft: 24 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ marginTop: 16, paddingLeft: 24 }}>{children}</ol>,
          a: ({ children, href }) => <a href={href} className="text-link">{children}</a>,
          strong: ({ children }) => <strong style={{ color: 'var(--ink)' }}>{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
