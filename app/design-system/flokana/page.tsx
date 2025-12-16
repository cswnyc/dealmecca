'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { useTheme } from '@/lib/theme-context';

const TOAST_DURATION_MS = 3000;

type TabKey = 'overview' | 'analytics' | 'reports' | 'settings';

export default function FlokanaDesignSystemPage(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<'option1' | 'option2'>('option1');
  const [switchOn, setSwitchOn] = useState(false);
  const [selectValue, setSelectValue] = useState<'option1' | 'option2' | 'option3'>('option1');

  const tabs = useMemo<Array<{ key: TabKey; label: string }>>(
    () => [
      { key: 'overview', label: 'Overview' },
      { key: 'analytics', label: 'Analytics' },
      { key: 'reports', label: 'Reports' },
      { key: 'settings', label: 'Settings' },
    ],
    [],
  );

  const faq = useMemo<Array<{ id: string; q: string; a: string }>>(
    () => [
      {
        id: 'what',
        q: 'What is this page?',
        a: 'A Flokana-inspired, scoped design system sandbox inside the existing DealMecca app—so it won’t fight your global theme.',
      },
      {
        id: 'scope',
        q: 'Does this affect the rest of the app?',
        a: 'No. Tokens are scoped under a `.flk` wrapper and only loaded for this route.',
      },
      {
        id: 'dark',
        q: 'Does it support dark mode?',
        a: 'Yes. It uses the app’s existing ThemeProvider (html class `light|dark`) and swaps Flokana token variables accordingly.',
      },
      {
        id: 'next',
        q: 'How do we use this in real screens?',
        a: 'We can extract the primitives into reusable components (Button/Card/Input/etc.) and compose them into pages—still scoped or gradually replacing the global theme.',
      },
    ],
    [],
  );

  const handleToggleTheme = useCallback((): void => {
    toggleTheme();
  }, [toggleTheme]);

  const handleTabClick = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    const nextTab = event.currentTarget.dataset.tab as TabKey | undefined;
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, []);

  const handleAccordionToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    const nextId = event.currentTarget.dataset.acc ?? null;
    setOpenAccordion((current) => (current === nextId ? null : nextId));
  }, []);

  const openModal = useCallback((): void => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
  }, []);

  const openDrawer = useCallback((): void => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback((): void => {
    setIsDrawerOpen(false);
  }, []);

  const showToast = useCallback((): void => {
    setIsToastOpen(true);
    window.setTimeout(() => {
      setIsToastOpen(false);
    }, TOAST_DURATION_MS);
  }, []);

  const hideToast = useCallback((): void => {
    setIsToastOpen(false);
  }, []);

  const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setCheckboxChecked(event.target.checked);
  }, []);

  const handleRadioChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value;
    if (nextValue === 'option1' || nextValue === 'option2') {
      setRadioValue(nextValue);
    }
  }, []);

  const toggleSwitch = useCallback((): void => {
    setSwitchOn((current) => !current);
  }, []);

  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>): void => {
    const nextValue = event.target.value;
    if (nextValue === 'option1' || nextValue === 'option2' || nextValue === 'option3') {
      setSelectValue(nextValue);
    }
  }, []);

  return (
    <div className="flk min-h-screen w-full bg-flk-bg text-flk-text-primary font-flk">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 border-b border-flk-border-subtle bg-flk-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="text-flk-h4 font-bold text-flk-primary">Flokana UI</div>
            <div className="hidden items-center gap-6 md:flex">
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#primitives">
                Components
              </a>
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#patterns">
                Patterns
              </a>
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#data">
                Data
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-surface-subtle text-flk-text-primary hover:bg-flk-border-subtle"
              onClick={handleToggleTheme}
              type="button"
            >
              <span className="text-[18px] leading-none">{theme === 'dark' ? '☀︎' : '☾'}</span>
            </button>

            <button
              className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              type="button"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-8 text-center sm:py-12">
          <div className="mx-auto inline-flex items-center rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-primary-soft-text">
            Design System • Scoped
          </div>

          <h1 className="mt-6 text-flk-display-l font-bold tracking-[-0.03em]">
            Clean <span className="flk-text-gradient">Component</span> Sandbox
          </h1>

          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            This page reproduces the Flokana-inspired style inside the existing app by scoping tokens to a wrapper and overriding global CSS where needed.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              className="h-[52px] rounded-flk-pill bg-flk-primary px-[22px] text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              type="button"
            >
              Explore Components
            </button>
            <button
              className="h-[52px] rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-[22px] text-flk-text-primary shadow-flk-card hover:bg-flk-surface-subtle dark:shadow-flk-card-dark"
              type="button"
            >
              View Tokens
            </button>
          </div>

          <div className="mt-10 rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-floating dark:shadow-flk-floating-dark sm:p-6">
            <div className="aspect-[16/9] w-full rounded-flk-lg border border-flk-border-subtle bg-flk-surface-subtle" />
          </div>
        </section>

        {/* Primitives */}
        <section className="mt-14" id="primitives">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">Primitives</h2>
          <p className="mt-2 text-flk-body-m text-flk-text-secondary">Buttons, badges, cards, inputs, toggles.</p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* Buttons */}
            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Buttons</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark" type="button">
                  Primary
                </button>
                <button className="h-11 rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-[18px] text-flk-text-primary hover:bg-flk-surface-subtle" type="button">
                  Secondary
                </button>
                <button className="h-11 rounded-flk-pill border border-flk-border-strong bg-transparent px-[18px] text-flk-text-primary hover:bg-flk-primary-soft-bg hover:text-flk-primary-soft-text" type="button">
                  Outline
                </button>
                <button className="h-11 rounded-flk-pill bg-transparent px-[18px] text-flk-text-primary hover:bg-flk-surface-subtle" type="button">
                  Ghost
                </button>
                <button className="h-11 rounded-flk-pill bg-transparent px-[18px] font-medium text-flk-primary hover:underline" type="button">
                  Link
                </button>
              </div>

              <div className="mt-6 text-flk-body-m font-semibold">Icon buttons</div>
              <div className="mt-3 flex gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-flk-md hover:bg-flk-surface-subtle" type="button">
                  ⚙︎
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-surface-subtle hover:bg-flk-border-subtle" type="button">
                  ⌕
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Badges</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-flk-pill bg-flk-surface-subtle px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-text-muted">
                  Neutral
                </span>
                <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-primary-soft-text">
                  Primary
                </span>
                <span className="rounded-flk-pill border border-flk-border-subtle bg-transparent px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-text-muted">
                  Outline
                </span>
                <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-status-success">
                  Success
                </span>
                <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-status-warning">
                  Warning
                </span>
                <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-status-danger">
                  Danger
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Inputs</div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-flk-body-s font-medium text-flk-text-primary" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-flk-md border border-flk-border-subtle bg-flk-surface px-[14px] text-flk-body-m text-flk-text-primary placeholder:text-flk-text-muted focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                    id="email"
                    placeholder="you@company.com"
                    type="email"
                  />
                  <p className="mt-2 text-flk-caption text-flk-text-muted">We’ll never share your email.</p>
                </div>

                <div>
                  <label className="block text-flk-body-s font-medium text-flk-text-primary" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    className="mt-2 w-full resize-none rounded-flk-md border border-flk-border-subtle bg-flk-surface px-[14px] py-3 text-flk-body-m text-flk-text-primary placeholder:text-flk-text-muted focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                    id="message"
                    placeholder="Write a short note…"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-flk-body-s font-medium text-flk-text-primary" htmlFor="select">
                    Select
                  </label>
                  <select
                    className="mt-2 h-11 w-full rounded-flk-md border border-flk-border-subtle bg-flk-surface px-[14px] text-flk-body-m text-flk-text-primary focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                    id="select"
                    onChange={handleSelectChange}
                    value={selectValue}
                  >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    checked={checkboxChecked}
                    className="h-[18px] w-[18px] rounded-flk-xs border border-flk-border-strong accent-[rgb(var(--flk-primary))]"
                    id="checkbox"
                    onChange={handleCheckboxChange}
                    type="checkbox"
                  />
                  <label className="text-flk-body-m text-flk-text-primary" htmlFor="checkbox">
                    I agree to the terms
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="text-flk-body-s font-medium text-flk-text-primary">Radio</div>
                  <div className="flex items-center gap-3">
                    <input
                      checked={radioValue === 'option1'}
                      className="h-[18px] w-[18px] accent-[rgb(var(--flk-primary))]"
                      id="radio1"
                      name="radio"
                      onChange={handleRadioChange}
                      type="radio"
                      value="option1"
                    />
                    <label className="text-flk-body-m" htmlFor="radio1">
                      Option 1
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      checked={radioValue === 'option2'}
                      className="h-[18px] w-[18px] accent-[rgb(var(--flk-primary))]"
                      id="radio2"
                      name="radio"
                      onChange={handleRadioChange}
                      type="radio"
                      value="option2"
                    />
                    <label className="text-flk-body-m" htmlFor="radio2">
                      Option 2
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    aria-pressed={switchOn}
                    className={
                      switchOn
                        ? 'relative h-6 w-[44px] rounded-flk-pill bg-flk-primary'
                        : 'relative h-6 w-[44px] rounded-flk-pill bg-flk-border-strong'
                    }
                    onClick={toggleSwitch}
                    type="button"
                  >
                    <span
                      className={
                        switchOn
                          ? 'absolute left-[2px] top-[2px] h-5 w-5 translate-x-[18px] rounded-full bg-white shadow'
                          : 'absolute left-[2px] top-[2px] h-5 w-5 translate-x-0 rounded-full bg-white shadow'
                      }
                    />
                  </button>
                  <span className="text-flk-body-m text-flk-text-primary">Enable notifications</span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Cards</div>
              <div className="mt-4 grid gap-4">
                <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-[20px]">✦</div>
                    <div>
                      <div className="text-[16px] font-semibold tracking-[-0.01em]">Soft elevation</div>
                      <div className="mt-1 text-flk-body-s text-flk-text-muted">Subtle borders + shadows, premium feel.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-[20px]">⚡</div>
                    <div>
                      <div className="text-[16px] font-semibold tracking-[-0.01em]">Whitespace forward</div>
                      <div className="mt-1 text-flk-body-s text-flk-text-muted">Breathing room before decoration.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data + patterns */}
        <section className="mt-16" id="data">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">Data</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {[{ label: 'Total Users', value: '12,459', delta: '+12.5%', tone: 'text-flk-status-success' },
              { label: 'Revenue', value: '$84,200', delta: '+8.2%', tone: 'text-flk-status-success' },
              { label: 'Conversion', value: '3.24%', delta: '-2.1%', tone: 'text-flk-status-danger' },
              { label: 'Active Now', value: '1,892', delta: 'Live users', tone: 'text-flk-text-muted' }].map((stat) => (
              <div
                className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark"
                key={stat.label}
              >
                <div className="text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-text-muted">{stat.label}</div>
                <div className="mt-2 text-flk-h2 font-bold">{stat.value}</div>
                <div className={['mt-1 text-flk-body-s', stat.tone].join(' ')}>{stat.delta}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-flk-body-m font-semibold">Tabs</div>

            <div className="mt-4 border-b border-flk-border-subtle">
              <div className="flex gap-8">
                {tabs.map((t) => (
                  <button
                    className={
                      activeTab === t.key
                        ? 'relative pb-3 text-flk-body-m font-medium text-flk-primary'
                        : 'pb-3 text-flk-body-m font-medium text-flk-text-muted hover:text-flk-text-primary'
                    }
                    data-tab={t.key}
                    key={t.key}
                    onClick={handleTabClick}
                    type="button"
                  >
                    {t.label}
                    {activeTab === t.key ? <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-flk-primary" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-6 text-flk-body-m text-flk-text-secondary">Content for {activeTab}.</div>
          </div>

          <div className="mt-8 rounded-flk-lg border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark">
            <div className="border-b border-flk-border-subtle px-6 py-4 text-flk-body-m font-semibold">Table</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-flk-border-subtle">
                    <th className="px-6 py-4 text-left text-flk-body-s font-medium text-flk-text-muted">Name</th>
                    <th className="px-6 py-4 text-left text-flk-body-s font-medium text-flk-text-muted">Status</th>
                    <th className="px-6 py-4 text-left text-flk-body-s font-medium text-flk-text-muted">Role</th>
                    <th className="px-6 py-4 text-left text-flk-body-s font-medium text-flk-text-muted">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ name: 'John Doe', status: 'Active', role: 'Admin', email: 'john@example.com' },
                    { name: 'Jane Smith', status: 'Active', role: 'Editor', email: 'jane@example.com' },
                    { name: 'Bob Johnson', status: 'Inactive', role: 'Viewer', email: 'bob@example.com' }].map((row) => (
                    <tr className="border-b border-flk-border-subtle last:border-0 hover:bg-flk-surface-subtle" key={row.email}>
                      <td className="px-6 py-4 text-flk-body-m">{row.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            row.status === 'Active'
                              ? 'rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium text-flk-status-success'
                              : 'rounded-flk-pill bg-flk-surface-subtle px-[10px] py-[6px] text-flk-caption font-medium text-flk-text-muted'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-flk-body-m">{row.role}</td>
                      <td className="px-6 py-4 text-flk-body-m text-flk-text-muted">{row.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-16" id="patterns">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">Patterns</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Accordion / FAQ</div>

              <div className="mt-4 overflow-hidden rounded-flk-lg border border-flk-border-subtle">
                {faq.map((item) => (
                  <div className="border-b border-flk-border-subtle last:border-0" key={item.id}>
                    <button
                      className="flex h-14 w-full items-center justify-between px-5 text-left hover:bg-flk-surface-subtle"
                      data-acc={item.id}
                      onClick={handleAccordionToggle}
                      type="button"
                    >
                      <span className="text-flk-body-m font-medium">{item.q}</span>
                      <span className="text-[18px]">{openAccordion === item.id ? '−' : '+'}</span>
                    </button>
                    {openAccordion === item.id ? (
                      <div className="bg-flk-surface-subtle px-5 py-4 text-flk-body-m text-flk-text-secondary">{item.a}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
              <div className="text-flk-body-m font-semibold">Overlays</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse hover:bg-flk-primary-hover" onClick={openModal} type="button">
                  Show Modal
                </button>
                <button className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse hover:bg-flk-primary-hover" onClick={openDrawer} type="button">
                  Show Drawer
                </button>
                <button className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse hover:bg-flk-primary-hover" onClick={showToast} type="button">
                  Show Toast
                </button>
              </div>

              <div className="mt-6 rounded-flk-lg bg-flk-primary-soft-bg p-4 text-flk-body-s text-flk-primary-soft-text">
                These overlays are intentionally simple here—once you like the baseline look, we can swap them for Radix components with the same Flokana tokens.
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-flk-lg bg-flk-primary p-10 text-center text-flk-text-inverse sm:p-14">
            <h3 className="text-flk-h2 font-bold">Ready to ship Flokana styling?</h3>
            <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-l text-white/90">
              We can extract these into reusable primitives and roll them out page-by-page.
            </p>
            <button
              className="mt-7 h-[52px] rounded-flk-pill bg-white px-[22px] text-flk-body-l font-medium text-flk-brand-ink shadow-flk-floating hover:bg-white/90"
              type="button"
            >
              Start Building
            </button>
          </div>
        </section>
      </main>

      {/* Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 dark:bg-black/55">
          <div className="w-full max-w-[520px] rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
            <div className="text-flk-h3 font-bold">Modal title</div>
            <div className="mt-3 text-flk-body-m text-flk-text-secondary">
              This modal is styled with Flokana tokens and should stay consistent even with DealMecca global styles.
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="h-11 rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-[18px] hover:bg-flk-surface-subtle" onClick={closeModal} type="button">
                Cancel
              </button>
              <button className="h-11 rounded-flk-pill bg-flk-primary px-[18px] text-flk-text-inverse hover:bg-flk-primary-hover" onClick={closeModal} type="button">
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Drawer */}
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50">
          <button aria-label="Close drawer overlay" className="absolute inset-0 bg-black/35 dark:bg-black/55" onClick={closeDrawer} type="button" />
          <div className="absolute right-0 top-0 h-full w-full max-w-[420px] border-l border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
            <div className="flex items-center justify-between">
              <div className="text-flk-h3 font-bold">Drawer</div>
              <button className="flex h-10 w-10 items-center justify-center rounded-flk-md hover:bg-flk-surface-subtle" onClick={closeDrawer} type="button">
                ✕
              </button>
            </div>
            <div className="mt-3 text-flk-body-m text-flk-text-secondary">A side sheet for nav/filters. Same surfaces, borders, and shadows.</div>
            <div className="mt-6 space-y-2">
              {['Menu Item 1', 'Menu Item 2', 'Menu Item 3'].map((label) => (
                <a className="block rounded-flk-md px-3 py-2 text-flk-body-m hover:bg-flk-surface-subtle" href="#" key={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {isToastOpen ? (
        <div className="fixed bottom-6 right-6 z-50 min-w-[320px] rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-floating dark:shadow-flk-floating-dark">
          <div className="flex items-start gap-3">
            <span className="text-[18px]">✓</span>
            <div className="flex-1">
              <div className="text-flk-body-m font-semibold">Success</div>
              <div className="mt-1 text-flk-body-s text-flk-text-secondary">Your action completed successfully.</div>
            </div>
            <button className="text-flk-text-muted hover:text-flk-text-primary" onClick={hideToast} type="button">
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
