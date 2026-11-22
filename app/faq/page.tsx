'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SiteChrome } from '@/components/public/site-chrome';

const faqs = [
  ['How do I pay for the products I am interested in?', 'Payment is arranged directly with us by email or WhatsApp after you submit your interests. Nothing is paid on the website.'],
  ['What is a preorder and how long does it take?', 'We order the item for you from our supplier and it usually arrives in about 4 to 8 weeks after your order is confirmed.'],
  ['Can I get updates while I wait?', 'Yes. We keep you updated through the contact details you share with us.'],
  ['Do you deliver outside Lagos?', 'Send us your location with your interests and we will confirm the available delivery options.'],
  ['Can I return or exchange an item?', 'We will share the applicable details for your item before anything is confirmed.'],
  ['How do discounts work?', 'Discounts are applied to selected pieces during active events and are reflected in the estimate you see.'],
];

export default function FAQPage() { const [open, setOpen] = useState(0); return <SiteChrome><section className="page-hero"><div className="container"><span className="breadcrumb">Home / FAQ</span><h1>Frequently asked questions</h1><p>Everything you need to feel confident before sending your picks.</p></div></section><div className="faq-list">{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button className="faq-question" onClick={() => setOpen(open === index ? -1 : index)}>{question}<ChevronDown size={19} style={{ transform:open === index ? 'rotate(180deg)' : 'none', transition:'transform .2s', color:'var(--gold-text)' }} /></button>{open === index && <div className="faq-answer">{answer}</div>}</div>)}<div className="editorial-band" style={{ marginTop:54, borderRadius:18 }}><div className="editorial-content"><h2>Still have questions?</h2><p>We are one message away.</p><a href="/contact" className="button button-gold">Contact us</a></div></div></div></SiteChrome>; }
