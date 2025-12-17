'use client';

import React, { createContext, useContext, useState } from 'react';

import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within FlkTabs');
  }
  return context;
}

interface FlkTabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function FlkTabs({ defaultValue, children, className }: FlkTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface FlkTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function FlkTabsList({ children, className }: FlkTabsListProps): JSX.Element {
  return (
    <div className={cn('border-b border-flk-border-subtle', className)}>
      <div className="flex gap-8">{children}</div>
    </div>
  );
}

interface FlkTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function FlkTabsTrigger({ value, children, className }: FlkTabsTriggerProps): JSX.Element {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      className={cn(
        'relative pb-3 text-flk-body-m font-medium transition-colors',
        isActive ? 'text-flk-primary' : 'text-flk-text-muted hover:text-flk-text-primary',
        className,
      )}
      onClick={() => setActiveTab(value)}
      type="button"
    >
      {children}
      {isActive ? <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-flk-primary" /> : null}
    </button>
  );
}

interface FlkTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function FlkTabsContent({ value, children, className }: FlkTabsContentProps): JSX.Element {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return <></>;
  }

  return <div className={cn('py-6', className)}>{children}</div>;
}
