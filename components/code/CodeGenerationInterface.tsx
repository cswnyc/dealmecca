'use client';

import { useState, useEffect } from 'react';
import { Monaco } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import { 
  Code2, 
  Play, 
  Copy, 
  Download, 
  Settings, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Sandpack } from '@codesandbox/sandpack-react';

interface CodeGenerationInterfaceProps {
  onCodeGenerated?: (code: string, language: string) => void;
  initialPrompt?: string;
  initialLanguage?: string;
  initialFramework?: string;
}

interface GeneratedCode {
  code: string;
  explanation: string;
  language: string;
  suggestions: string[];
  dependencies: string[];
  tests: string;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' }
];

const FRAMEWORKS = {
  javascript: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js'],
  typescript: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'NestJS'],
  python: ['Django', 'Flask', 'FastAPI', 'Streamlit', 'Pandas', 'NumPy'],
  java: ['Spring Boot', 'Spring MVC', 'Hibernate', 'Maven', 'Gradle'],
  csharp: ['ASP.NET Core', '.NET Framework', 'Entity Framework', 'Blazor'],
  go: ['Gin', 'Echo', 'Fiber', 'GORM'],
  rust: ['Actix', 'Rocket', 'Warp', 'Tokio'],
  php: ['Laravel', 'Symfony', 'CodeIgniter', 'WordPress'],
  ruby: ['Ruby on Rails', 'Sinatra', 'Hanami'],
  swift: ['SwiftUI', 'UIKit', 'Vapor'],
  kotlin: ['Spring Boot', 'Ktor', 'Android'],
  sql: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB']
};

const CODE_TYPES = [
  { value: 'component', label: 'UI Component', icon: '🎨' },
  { value: 'function', label: 'Function/Method', icon: '⚙️' },
  { value: 'api', label: 'API Endpoint', icon: '🌐' },
  { value: 'schema', label: 'Database Schema', icon: '🗄️' },
  { value: 'utility', label: 'Utility/Helper', icon: '🔧' },
  { value: 'test', label: 'Unit Tests', icon: '🧪' }
];

const COMPLEXITY_LEVELS = [
  { value: 'simple', label: 'Simple', description: 'Basic functionality, minimal features' },
  { value: 'intermediate', label: 'Intermediate', description: 'Error handling, optimization' },
  { value: 'advanced', label: 'Advanced', description: 'Comprehensive features, patterns' }
];

export function CodeGenerationInterface({ 
  onCodeGenerated, 
  initialPrompt = '', 
  initialLanguage = 'typescript',
  initialFramework = 'React' 
}: CodeGenerationInterfaceProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [language, setLanguage] = useState(initialLanguage);
  const [framework, setFramework] = useState(initialFramework);
  const [codeType, setCodeType] = useState('function');
  const [complexity, setComplexity] = useState('intermediate');
  const [context, setContext] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'explanation' | 'tests' | 'preview'>('code');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableFrameworks = FRAMEWORKS[language as keyof typeof FRAMEWORKS] || [];

  useEffect(() => {
    // Reset framework if not available for selected language
    if (!availableFrameworks.includes(framework)) {
      setFramework(availableFrameworks[0] || '');
    }
  }, [language, availableFrameworks, framework]);

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/claude-code/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          language,
          framework: framework || undefined,
          complexity,
          type: codeType,
          context: context || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedCode(result);
      setActiveTab('code');
      
      if (onCodeGenerated) {
        onCodeGenerated(result.code, result.language);
      }
    } catch (err) {
      console.error('Code generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode?.code) {
      try {
        await navigator.clipboard.writeText(generatedCode.code);
        // TODO: Show success toast
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode?.code) return;

    const fileExtensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      sql: 'sql'
    };

    const ext = fileExtensions[generatedCode.language as keyof typeof fileExtensions] || 'txt';
    const filename = `generated-code.${ext}`;
    
    const blob = new Blob([generatedCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCodePreview = () => {
    if (!generatedCode) return null;

    // For JavaScript/TypeScript React components, show Sandpack preview
    if ((generatedCode.language === 'javascript' || generatedCode.language === 'typescript') && 
        framework === 'React' && codeType === 'component') {
      return (
        <div className="h-96">
          <Sandpack
            template="react-ts"
            files={{
              '/App.tsx': generatedCode.code,
            }}
            options={{
              showNavigator: true,
              showTabs: true,
              closableTabs: true,
            }}
          />
        </div>
      );
    }

    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground text-sm">
          Live preview not available for this code type. Use the code tab to view the generated code.
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-foreground">Code Generation</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
            {showSettings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 py-4 bg-muted border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={availableFrameworks.length === 0}
              >
                <option value="">None</option>
                {availableFrameworks.map(fw => (
                  <option key={fw} value={fw}>
                    {fw}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Code Type</label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CODE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Complexity</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COMPLEXITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context/Additional Info */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional context, constraints, or specific requirements..."
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="p-6">
        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Describe what you want to build
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a React component for displaying user profiles with avatar, name, and bio. Include hover effects and responsive design."
            className="w-full px-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleGenerateCode}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Code'}</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Generated Code Display */}
        {generatedCode && (
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === 'code' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('explanation')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === 'explanation' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Explanation
                </button>
                {generatedCode.tests && (
                  <button
                    onClick={() => setActiveTab('tests')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeTab === 'tests' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tests
                  </button>
                )}
                {(generatedCode.language === 'javascript' || generatedCode.language === 'typescript') && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeTab === 'preview' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Preview
                  </button>
                )}
              </div>

              {activeTab === 'code' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="flex items-center space-x-1 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="bg-white">
              {activeTab === 'code' && (
                <div className="h-96">
                  <Editor
                    height="100%"
                    language={generatedCode.language}
                    value={generatedCode.code}
                    theme="vs"
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              )}

              {activeTab === 'explanation' && (
                <div className="p-4">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{generatedCode.explanation}</p>
                  </div>

                  {/* Dependencies */}
                  {generatedCode.dependencies.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Dependencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedCode.dependencies.map((dep, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {generatedCode.suggestions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
                        Suggestions
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {generatedCode.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && generatedCode.tests && (
                <div className="h-96">
                  <Editor
                    height="100%"
                    language={generatedCode.language}
                    value={generatedCode.tests}
                    theme="vs"
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              )}

              {activeTab === 'preview' && renderCodePreview()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}