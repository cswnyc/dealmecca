'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FlkAccordionItemProps {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

function FlkAccordionItem({ id, question, answer, isOpen, onToggle }: FlkAccordionItemProps): JSX.Element {
  return (
    <div className="border-b border-flk-border-subtle last:border-0">
      <button
        className="flex h-14 w-full items-center justify-between px-6 text-left hover:bg-flk-surface-subtle"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span className="text-flk-body-m font-medium text-flk-text-primary">{question}</span>
        {isOpen ? <Minus className="h-5 w-5 text-flk-text-primary" /> : <Plus className="h-5 w-5 text-flk-text-primary" />}
      </button>
      {isOpen ? (
        <div className="bg-flk-surface-subtle px-6 py-4 text-flk-body-m text-flk-text-secondary">{answer}</div>
      ) : null}
    </div>
  );
}

interface FlkAccordionProps {
  items: Array<{ id: string; question: string; answer: string }>;
  className?: string;
  allowMultiple?: boolean;
}

export function FlkAccordion({ items, className, allowMultiple = false }: FlkAccordionProps): JSX.Element {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const handleToggle = (id: string): void => {
    if (allowMultiple) {
      setOpenIds((current) => (current.includes(id) ? current.filter((i) => i !== id) : [...current, id]));
    } else {
      setOpenIds((current) => (current.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-flk-xl border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark', className)}>
      {items.map((item) => (
        <FlkAccordionItem
          answer={item.answer}
          id={item.id}
          isOpen={openIds.includes(item.id)}
          key={item.id}
          onToggle={handleToggle}
          question={item.question}
        />
      ))}
    </div>
  );
}
