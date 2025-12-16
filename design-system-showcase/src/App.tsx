import { useState } from 'react';
import './App.css';

function App(): JSX.Element {
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState<number | null>(null);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioSelected, setRadioSelected] = useState('option1');
  const [switchOn, setSwitchOn] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const showToastNotification = (): void => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-sm border-b border-light-border-subtle dark:border-dark-border-subtle h-[72px]">
          <div className="max-w-container mx-auto px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-h4 font-bold text-brand-primary">DesignSystem</div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Components</a>
                <a href="#" className="text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Tokens</a>
                <a href="#" className="text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Guidelines</a>
                <a href="#" className="text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary border-b-2 border-brand-primary pb-1">Showcase</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="w-[40px] h-[40px] rounded-md bg-light-surface-subtle dark:bg-dark-surface-subtle hover:bg-light-border-subtle dark:hover:bg-dark-border-subtle flex items-center justify-center"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover shadow-card-light dark:shadow-card-dark">
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-container mx-auto px-8 py-16">
          {/* Hero Section */}
          <section className="text-center mb-24">
            <div className="inline-block px-[10px] py-[6px] rounded-pill bg-light-primary-soft-bg dark:bg-dark-primary-soft-bg text-light-primary-soft-text dark:text-dark-primary-soft-text text-caption font-medium uppercase tracking-overline mb-6">
              Design System v1.0
            </div>
            <h1 className="text-display-l font-bold mb-6">
              Clean <span className="text-gradient">Component</span> Library
            </h1>
            <p className="text-body-l text-light-text-secondary dark:text-dark-text-secondary max-w-[68ch] mx-auto mb-8">
              A comprehensive showcase of every UI component following the Flokana-inspired clean SaaS aesthetic with generous whitespace and soft elevation.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="h-[52px] px-[22px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover shadow-card-light dark:shadow-card-dark text-body-l">
                Explore Components
              </button>
              <button className="h-[52px] px-[22px] rounded-pill bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary font-medium border border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle text-body-l">
                View Docs
              </button>
            </div>
          </section>

          {/* Typography Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Typography</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Display XL</p>
                  <h1 className="text-display-xl font-bold">The quick brown fox</h1>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Display L</p>
                  <h1 className="text-display-l font-bold">The quick brown fox</h1>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Heading 1</p>
                  <h1 className="text-h1 font-bold">The quick brown fox</h1>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Heading 2</p>
                  <h2 className="text-h2 font-bold">The quick brown fox</h2>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Heading 3</p>
                  <h3 className="text-h3 font-bold">The quick brown fox</h3>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Heading 4</p>
                  <h4 className="text-h4 font-bold">The quick brown fox</h4>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Body Large</p>
                  <p className="text-body-l">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Body Medium</p>
                  <p className="text-body-m">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Body Small</p>
                  <p className="text-body-s">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Caption</p>
                  <p className="text-caption">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mb-2">Gradient Text</p>
                  <h2 className="text-h2 font-bold text-gradient">Innovation & Excellence</h2>
                </div>
              </div>
            </div>
          </section>

          {/* Buttons Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Buttons</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="space-y-8">
                {/* Button Variants */}
                <div>
                  <h3 className="text-h4 font-semibold mb-4">Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <button className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover shadow-card-light dark:shadow-card-dark">
                      Primary Button
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary font-medium border border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                      Secondary Button
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-transparent text-light-text-primary dark:text-dark-text-primary font-medium border border-light-border-strong dark:border-dark-border-strong hover:bg-light-primary-soft-bg dark:hover:bg-dark-primary-soft-bg hover:text-light-primary-soft-text dark:hover:text-dark-primary-soft-text">
                      Outline Button
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-transparent text-light-text-primary dark:text-dark-text-primary font-medium hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                      Ghost Button
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-transparent text-brand-primary font-medium hover:underline">
                      Link Button
                    </button>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h3 className="text-h4 font-semibold mb-4">Sizes</h3>
                  <div className="flex items-center gap-4">
                    <button className="h-[36px] px-[14px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover text-body-s">
                      Small
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover text-body-m">
                      Medium
                    </button>
                    <button className="h-[52px] px-[22px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover text-body-l">
                      Large
                    </button>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h3 className="text-h4 font-semibold mb-4">States</h3>
                  <div className="flex flex-wrap gap-4">
                    <button className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover shadow-card-light dark:shadow-card-dark">
                      Default
                    </button>
                    <button className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover shadow-card-light dark:shadow-card-dark flex items-center gap-2">
                      <span className="animate-spin">⟳</span> Loading
                    </button>
                    <button disabled className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium opacity-50 cursor-not-allowed">
                      Disabled
                    </button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div>
                  <h3 className="text-h4 font-semibold mb-4">Icon Buttons</h3>
                  <div className="flex gap-4">
                    <button className="w-[32px] h-[32px] rounded-sm bg-transparent hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle flex items-center justify-center">
                      ⚙️
                    </button>
                    <button className="w-[40px] h-[40px] rounded-md bg-transparent hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle flex items-center justify-center">
                      🔍
                    </button>
                    <button className="w-[40px] h-[40px] rounded-md bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-border-subtle dark:hover:bg-dark-border-subtle flex items-center justify-center">
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cards Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Feature Card */}
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6 hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark hover:-translate-y-[2px] transition-all">
                <div className="w-[40px] h-[40px] rounded-md bg-light-primary-soft-bg dark:bg-dark-primary-soft-bg flex items-center justify-center text-[20px] mb-4">
                  🎨
                </div>
                <h3 className="text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] mb-2">Beautiful Design</h3>
                <p className="text-body-s text-light-text-muted dark:text-dark-text-muted">Modern, clean interface with attention to every detail</p>
              </div>

              {/* Feature Card */}
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6 hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark hover:-translate-y-[2px] transition-all">
                <div className="w-[40px] h-[40px] rounded-md bg-light-primary-soft-bg dark:bg-dark-primary-soft-bg flex items-center justify-center text-[20px] mb-4">
                  ⚡
                </div>
                <h3 className="text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] mb-2">Lightning Fast</h3>
                <p className="text-body-s text-light-text-muted dark:text-dark-text-muted">Optimized for performance and user experience</p>
              </div>

              {/* Feature Card */}
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6 hover:shadow-card-hover-light dark:hover:shadow-card-hover-dark hover:-translate-y-[2px] transition-all">
                <div className="w-[40px] h-[40px] rounded-md bg-light-primary-soft-bg dark:bg-dark-primary-soft-bg flex items-center justify-center text-[20px] mb-4">
                  🔒
                </div>
                <h3 className="text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] mb-2">Secure by Default</h3>
                <p className="text-body-s text-light-text-muted dark:text-dark-text-muted">Enterprise-grade security built into every component</p>
              </div>
            </div>
          </section>

          {/* Badges Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Badges</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="flex flex-wrap gap-4">
                <span className="px-[10px] py-[6px] rounded-pill bg-light-surface-subtle dark:bg-dark-surface-subtle text-light-text-muted dark:text-dark-text-muted text-caption font-medium uppercase tracking-overline">
                  Neutral
                </span>
                <span className="px-[10px] py-[6px] rounded-pill bg-light-primary-soft-bg dark:bg-dark-primary-soft-bg text-light-primary-soft-text dark:text-dark-primary-soft-text text-caption font-medium uppercase tracking-overline">
                  Primary
                </span>
                <span className="px-[10px] py-[6px] rounded-pill bg-transparent border border-light-border-subtle dark:border-dark-border-subtle text-light-text-muted dark:text-dark-text-muted text-caption font-medium uppercase tracking-overline">
                  Outline
                </span>
                <span className="px-[10px] py-[6px] rounded-pill bg-green-100 dark:bg-green-900/30 text-light-status-success dark:text-dark-status-success text-caption font-medium uppercase tracking-overline">
                  Success
                </span>
                <span className="px-[10px] py-[6px] rounded-pill bg-yellow-100 dark:bg-yellow-900/30 text-light-status-warning dark:text-dark-status-warning text-caption font-medium uppercase tracking-overline">
                  Warning
                </span>
                <span className="px-[10px] py-[6px] rounded-pill bg-red-100 dark:bg-red-900/30 text-light-status-danger dark:text-dark-status-danger text-caption font-medium uppercase tracking-overline">
                  Danger
                </span>
              </div>
            </div>
          </section>

          {/* Form Inputs Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Form Inputs</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-body-s font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-[44px] px-[14px] rounded-md bg-light-surface dark:bg-dark-surface border border-light-border-subtle dark:border-dark-border-subtle text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)] focus:border-brand-primary"
                  />
                  <p className="text-caption text-light-text-muted dark:text-dark-text-muted mt-2">We'll never share your email</p>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-body-s font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Enter your message"
                    rows={4}
                    className="w-full px-[14px] py-3 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border-subtle dark:border-dark-border-subtle text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)] focus:border-brand-primary resize-none"
                  />
                </div>

                {/* Select */}
                <div>
                  <label className="block text-body-s font-medium mb-2">Select Option</label>
                  <select
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    className="w-full h-[44px] px-[14px] rounded-md bg-light-surface dark:bg-dark-surface border border-light-border-subtle dark:border-dark-border-subtle text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)] focus:border-brand-primary"
                  >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="checkbox1"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    className="w-[18px] h-[18px] rounded-xs border-2 border-light-border-subtle dark:border-dark-border-subtle checked:bg-brand-primary checked:border-brand-primary focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                  />
                  <label htmlFor="checkbox1" className="text-body-m cursor-pointer">I agree to the terms and conditions</label>
                </div>

                {/* Radio Buttons */}
                <div>
                  <p className="text-body-s font-medium mb-3">Choose an option:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="radio1"
                        name="radio-group"
                        value="option1"
                        checked={radioSelected === 'option1'}
                        onChange={(e) => setRadioSelected(e.target.value)}
                        className="w-[18px] h-[18px] border-2 border-light-border-subtle dark:border-dark-border-subtle checked:border-brand-primary focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                      />
                      <label htmlFor="radio1" className="text-body-m cursor-pointer">Option 1</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="radio2"
                        name="radio-group"
                        value="option2"
                        checked={radioSelected === 'option2'}
                        onChange={(e) => setRadioSelected(e.target.value)}
                        className="w-[18px] h-[18px] border-2 border-light-border-subtle dark:border-dark-border-subtle checked:border-brand-primary focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)]"
                      />
                      <label htmlFor="radio2" className="text-body-m cursor-pointer">Option 2</label>
                    </div>
                  </div>
                </div>

                {/* Switch */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSwitchOn(!switchOn)}
                    className={`relative w-[44px] h-[24px] rounded-pill transition-colors ${
                      switchOn
                        ? 'bg-brand-primary'
                        : 'bg-light-border-strong dark:bg-dark-border-strong'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform ${
                        switchOn ? 'translate-x-[22px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                  <label className="text-body-m cursor-pointer" onClick={() => setSwitchOn(!switchOn)}>
                    Enable notifications
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Avatars Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Avatars</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-h4 font-semibold mb-4">Sizes</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-light-accent-violet to-light-accent-pink border-2 border-light-surface dark:border-dark-surface" />
                    <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-light-accent-violet to-light-accent-pink border-2 border-light-surface dark:border-dark-surface" />
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-light-accent-violet to-light-accent-pink border-2 border-light-surface dark:border-dark-surface" />
                    <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-light-accent-violet to-light-accent-pink border-2 border-light-surface dark:border-dark-surface" />
                  </div>
                </div>
                <div>
                  <h3 className="text-h4 font-semibold mb-4">Stack (with overlap)</h3>
                  <div className="flex items-center">
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-light-surface dark:border-dark-surface" />
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-light-surface dark:border-dark-surface -ml-[10px]" />
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-light-surface dark:border-dark-surface -ml-[10px]" />
                    <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-light-surface dark:border-dark-surface -ml-[10px]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Alerts Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Alerts</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3">
                <span className="text-[20px]">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-light-status-info dark:text-dark-status-info mb-1">Information</h4>
                  <p className="text-body-s text-light-text-secondary dark:text-dark-text-secondary">This is an informational message for the user.</p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-start gap-3">
                <span className="text-[20px]">✅</span>
                <div>
                  <h4 className="font-semibold text-light-status-success dark:text-dark-status-success mb-1">Success</h4>
                  <p className="text-body-s text-light-text-secondary dark:text-dark-text-secondary">Your changes have been saved successfully.</p>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 flex items-start gap-3">
                <span className="text-[20px]">⚠️</span>
                <div>
                  <h4 className="font-semibold text-light-status-warning dark:text-dark-status-warning mb-1">Warning</h4>
                  <p className="text-body-s text-light-text-secondary dark:text-dark-text-secondary">Please review this action before proceeding.</p>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-start gap-3">
                <span className="text-[20px]">❌</span>
                <div>
                  <h4 className="font-semibold text-light-status-danger dark:text-dark-status-danger mb-1">Error</h4>
                  <p className="text-body-s text-light-text-secondary dark:text-dark-text-secondary">Something went wrong. Please try again.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Display Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Data Display</h2>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
                <p className="text-caption text-light-text-muted dark:text-dark-text-muted uppercase tracking-overline mb-2">Total Users</p>
                <p className="text-h2 font-bold">12,459</p>
                <p className="text-body-s text-light-status-success dark:text-dark-status-success mt-1">↑ 12.5%</p>
              </div>
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
                <p className="text-caption text-light-text-muted dark:text-dark-text-muted uppercase tracking-overline mb-2">Revenue</p>
                <p className="text-h2 font-bold">$84,200</p>
                <p className="text-body-s text-light-status-success dark:text-dark-status-success mt-1">↑ 8.2%</p>
              </div>
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
                <p className="text-caption text-light-text-muted dark:text-dark-text-muted uppercase tracking-overline mb-2">Conversion</p>
                <p className="text-h2 font-bold">3.24%</p>
                <p className="text-body-s text-light-status-danger dark:text-dark-status-danger mt-1">↓ 2.1%</p>
              </div>
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
                <p className="text-caption text-light-text-muted dark:text-dark-text-muted uppercase tracking-overline mb-2">Active Now</p>
                <p className="text-h2 font-bold">1,892</p>
                <p className="text-body-s text-light-text-muted dark:text-dark-text-muted mt-1">Live users</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6 mb-8">
              <h3 className="text-h4 font-semibold mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-s">Project Completion</span>
                    <span className="text-body-s font-medium">75%</span>
                  </div>
                  <div className="w-full h-[8px] bg-light-surface-subtle dark:bg-dark-surface-subtle rounded-pill overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-pill" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-s">Storage Used</span>
                    <span className="text-body-s font-medium">45%</span>
                  </div>
                  <div className="w-full h-[8px] bg-light-surface-subtle dark:bg-dark-surface-subtle rounded-pill overflow-hidden">
                    <div className="h-full bg-light-status-success dark:bg-dark-status-success rounded-pill" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-s">API Quota</span>
                    <span className="text-body-s font-medium">92%</span>
                  </div>
                  <div className="w-full h-[8px] bg-light-surface-subtle dark:bg-dark-surface-subtle rounded-pill overflow-hidden">
                    <div className="h-full bg-light-status-warning dark:bg-dark-status-warning rounded-pill" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-border-subtle dark:border-dark-border-subtle">
                    <th className="text-left px-6 py-4 text-body-s font-medium text-light-text-muted dark:text-dark-text-muted">Name</th>
                    <th className="text-left px-6 py-4 text-body-s font-medium text-light-text-muted dark:text-dark-text-muted">Status</th>
                    <th className="text-left px-6 py-4 text-body-s font-medium text-light-text-muted dark:text-dark-text-muted">Role</th>
                    <th className="text-left px-6 py-4 text-body-s font-medium text-light-text-muted dark:text-dark-text-muted">Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors">
                    <td className="px-6 py-4 text-body-m">John Doe</td>
                    <td className="px-6 py-4">
                      <span className="px-[10px] py-[6px] rounded-pill bg-green-100 dark:bg-green-900/30 text-light-status-success dark:text-dark-status-success text-caption font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-m">Admin</td>
                    <td className="px-6 py-4 text-body-m text-light-text-muted dark:text-dark-text-muted">john@example.com</td>
                  </tr>
                  <tr className="border-b border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors">
                    <td className="px-6 py-4 text-body-m">Jane Smith</td>
                    <td className="px-6 py-4">
                      <span className="px-[10px] py-[6px] rounded-pill bg-green-100 dark:bg-green-900/30 text-light-status-success dark:text-dark-status-success text-caption font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-m">Editor</td>
                    <td className="px-6 py-4 text-body-m text-light-text-muted dark:text-dark-text-muted">jane@example.com</td>
                  </tr>
                  <tr className="hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors">
                    <td className="px-6 py-4 text-body-m">Bob Johnson</td>
                    <td className="px-6 py-4">
                      <span className="px-[10px] py-[6px] rounded-pill bg-gray-100 dark:bg-gray-800/30 text-light-text-muted dark:text-dark-text-muted text-caption font-medium">
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-m">Viewer</td>
                    <td className="px-6 py-4 text-body-m text-light-text-muted dark:text-dark-text-muted">bob@example.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Tabs Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Tabs</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="border-b border-light-border-subtle dark:border-dark-border-subtle mb-6">
                <div className="flex gap-8">
                  {['Overview', 'Analytics', 'Reports', 'Settings'].map((tab, index) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(index)}
                      className={`pb-3 text-body-m font-medium transition-colors relative ${
                        activeTab === index
                          ? 'text-brand-primary'
                          : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary'
                      }`}
                    >
                      {tab}
                      {activeTab === index && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="py-4">
                <p className="text-body-m">Content for {['Overview', 'Analytics', 'Reports', 'Settings'][activeTab]} tab</p>
              </div>
            </div>
          </section>

          {/* Accordion Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Accordion / FAQ</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark overflow-hidden">
              {[
                { q: 'What is this design system?', a: 'A comprehensive collection of reusable components built with React and Tailwind CSS following the Flokana-inspired design principles.' },
                { q: 'How do I get started?', a: 'Simply install the required dependencies and import the components you need into your React application.' },
                { q: 'Is it accessible?', a: 'Yes, all components are built with accessibility in mind, following WCAG AA guidelines for contrast and keyboard navigation.' },
                { q: 'Can I customize the theme?', a: 'Absolutely! The design system is built on Tailwind CSS, making it easy to customize colors, spacing, and other design tokens.' },
              ].map((item, index) => (
                <div key={index} className="border-b border-light-border-subtle dark:border-dark-border-subtle last:border-0">
                  <button
                    onClick={() => setAccordionOpen(accordionOpen === index ? null : index)}
                    className="w-full h-[56px] px-6 flex items-center justify-between hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors"
                  >
                    <span className="text-body-m font-medium">{item.q}</span>
                    <span className="text-[20px]">{accordionOpen === index ? '−' : '+'}</span>
                  </button>
                  {accordionOpen === index && (
                    <div className="px-6 py-4 bg-light-surface-subtle dark:bg-dark-surface-subtle">
                      <p className="text-body-m text-light-text-secondary dark:text-dark-text-secondary">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Breadcrumbs Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Breadcrumbs</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="flex items-center gap-2 text-body-s">
                <a href="#" className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Home</a>
                <span className="text-light-text-muted dark:text-dark-text-muted">›</span>
                <a href="#" className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Components</a>
                <span className="text-light-text-muted dark:text-dark-text-muted">›</span>
                <span className="text-light-text-primary dark:text-dark-text-primary">Breadcrumbs</span>
              </div>
            </div>
          </section>

          {/* Pagination Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Pagination</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="flex items-center justify-center gap-2">
                <button className="h-[36px] px-[14px] rounded-pill border border-light-border-subtle dark:border-dark-border-subtle text-body-s hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                  ‹ Previous
                </button>
                <button className="h-[36px] w-[36px] rounded-pill border border-light-border-subtle dark:border-dark-border-subtle text-body-s hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                  1
                </button>
                <button className="h-[36px] w-[36px] rounded-pill bg-brand-primary text-light-text-inverse text-body-s">
                  2
                </button>
                <button className="h-[36px] w-[36px] rounded-pill border border-light-border-subtle dark:border-dark-border-subtle text-body-s hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                  3
                </button>
                <button className="h-[36px] w-[36px] rounded-pill border border-light-border-subtle dark:border-dark-border-subtle text-body-s hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                  4
                </button>
                <button className="h-[36px] px-[14px] rounded-pill border border-light-border-subtle dark:border-dark-border-subtle text-body-s hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">
                  Next ›
                </button>
              </div>
            </div>
          </section>

          {/* Divider Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Divider</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <p className="text-body-m mb-4">Content above the divider</p>
              <hr className="border-0 border-t border-light-border-subtle dark:border-dark-border-subtle my-4" />
              <p className="text-body-m mt-4">Content below the divider</p>
            </div>
          </section>

          {/* Overlays Section */}
          <section className="mb-24">
            <h2 className="text-h2 font-bold mb-8">Overlays</h2>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border-subtle dark:border-dark-border-subtle shadow-card-light dark:shadow-card-dark p-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover"
                >
                  Show Modal
                </button>
                <button
                  onClick={() => setShowDrawer(true)}
                  className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover"
                >
                  Show Drawer
                </button>
                <button
                  onClick={showToastNotification}
                  className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover"
                >
                  Show Toast
                </button>
              </div>
            </div>
          </section>

          {/* CTA Band */}
          <section className="mb-24">
            <div className="bg-brand-primary rounded-lg p-16 text-center">
              <h2 className="text-h2 font-bold text-light-text-inverse mb-4">Ready to get started?</h2>
              <p className="text-body-l text-light-text-inverse/90 mb-8 max-w-[68ch] mx-auto">
                Build beautiful, accessible interfaces with our comprehensive design system.
              </p>
              <button className="h-[52px] px-[22px] rounded-pill bg-white text-brand-ink font-medium hover:bg-white/90 text-body-l shadow-floating-light">
                Start Building Today
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border-subtle dark:border-dark-border-subtle">
          <div className="max-w-container mx-auto px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="text-h4 font-bold text-brand-primary mb-4">DesignSystem</div>
                <p className="text-body-s text-light-text-muted dark:text-dark-text-muted">
                  A modern, clean design system for building beautiful interfaces.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Features</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Pricing</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Changelog</a>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Documentation</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Guides</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Support</a>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">About</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Blog</a>
                  <a href="#" className="block text-body-s text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Careers</a>
                </div>
              </div>
            </div>
            <div className="border-t border-light-border-subtle dark:border-dark-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-caption text-light-text-muted dark:text-dark-text-muted">
                © 2025 DesignSystem. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">Twitter</a>
                <a href="#" className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">GitHub</a>
                <a href="#" className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 dark:bg-black/55">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-floating-light dark:shadow-floating-dark max-w-[500px] w-full p-6">
              <h3 className="text-h3 font-bold mb-4">Modal Title</h3>
              <p className="text-body-m text-light-text-secondary dark:text-dark-text-secondary mb-6">
                This is a modal dialog. It can contain any content you need, including forms, images, or other components.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="h-[44px] px-[18px] rounded-pill bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary font-medium border border-light-border-subtle dark:border-dark-border-subtle hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="h-[44px] px-[18px] rounded-pill bg-brand-primary text-light-text-inverse font-medium hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer */}
        {showDrawer && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/35 dark:bg-black/55"
              onClick={() => setShowDrawer(false)}
            />
            <div className="absolute top-0 right-0 h-full w-full max-w-[400px] bg-light-surface dark:bg-dark-surface border-l border-light-border-subtle dark:border-dark-border-subtle p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h3 font-bold">Drawer Title</h3>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="w-[40px] h-[40px] rounded-md hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <p className="text-body-m text-light-text-secondary dark:text-dark-text-secondary mb-6">
                This is a drawer component that slides in from the side. Perfect for navigation menus or side panels.
              </p>
              <div className="space-y-2">
                <a href="#" className="block p-3 rounded-md hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">Menu Item 1</a>
                <a href="#" className="block p-3 rounded-md hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">Menu Item 2</a>
                <a href="#" className="block p-3 rounded-md hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle">Menu Item 3</a>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-light-surface dark:bg-dark-surface border border-light-border-subtle dark:border-dark-border-subtle rounded-lg shadow-floating-light dark:shadow-floating-dark p-4 min-w-[300px] animate-[slideIn_0.2s_ease]">
            <div className="flex items-start gap-3">
              <span className="text-[20px]">✅</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Success</h4>
                <p className="text-body-s text-light-text-secondary dark:text-dark-text-secondary">Your action was completed successfully.</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
