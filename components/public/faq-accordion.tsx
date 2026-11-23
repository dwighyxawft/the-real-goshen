'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqAccordion({ faqs }: { faqs: Array<{ id: string; question: string; answer: string }> }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="faq-list">
      {faqs.map((faq, index) => (
        <div className="faq-item" key={faq.id}>
          <button className="faq-question" onClick={() => setOpen(open === index ? -1 : index)}>
            {faq.question}
            <ChevronDown size={19} style={{ transform: open === index ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--gold-text)' }} />
          </button>
          {open === index && <div className="faq-answer">{faq.answer}</div>}
        </div>
      ))}
    </div>
  );
}
