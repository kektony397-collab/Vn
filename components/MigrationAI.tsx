
import React, { useState } from 'react';
import { migrateHtmlToReact } from '../services/geminiService';
import { Sparkles, Terminal, Copy, Check, Code } from 'lucide-react';

const MigrationAI: React.FC = () => {
  const [legacyHtml, setLegacyHtml] = useState('');
  const [transformedCode, setTransformedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMigrate = async () => {
    if (!legacyHtml) return;
    setLoading(true);
    try {
      const result = await migrateHtmlToReact(legacyHtml);
      setTransformedCode(result);
    } catch (error) {
      console.error(error);
      setTransformedCode('// Error migrating snippet. Ensure API Key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transformedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const placeholderSnippet = `<div class="btn-group" onclick="doSomething()">
  <button type="submit" for="username">Submit Form</button>
  <br>
  <img src="logo.png" class="responsive">
</div>

<script>
  function doSomething() {
    alert('Legacy Action');
  }
</script>`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal size={20} className="text-slate-500" />
          <h3 className="text-lg font-semibold">Legacy HTML Input</h3>
        </div>
        <textarea
          value={legacyHtml}
          onChange={(e) => setLegacyHtml(e.target.value)}
          placeholder={placeholderSnippet}
          className="flex-1 w-full bg-slate-900 text-emerald-400 font-mono text-sm p-6 rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none shadow-2xl"
        />
        <button
          onClick={handleMigrate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Synthesize React Component</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles size={20} className="text-amber-500" />
            <h3 className="text-lg font-semibold">Vite-Ready JSX Component</h3>
          </div>
          {transformedCode && (
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
          )}
        </div>
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-auto relative group">
           {transformedCode ? (
             <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
               {transformedCode}
             </pre>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Code size={32} />
                </div>
                <p className="text-center max-w-xs">
                  Paste legacy HTML and click synthesize to transform imperative scripts into declarative hooks.
                </p>
             </div>
           )}
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
           <p className="text-xs text-amber-700 leading-relaxed font-medium">
             <strong>Architectural Tip:</strong> Modern React components use <code className="bg-amber-100 px-1 rounded">useEffect</code> for side effects instead of inline <code className="bg-amber-100 px-1 rounded">&lt;script&gt;</code> tags. Global state is managed via hooks or context providers.
           </p>
        </div>
      </div>
    </div>
  );
};

export default MigrationAI;
