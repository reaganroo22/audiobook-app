import React, { useState } from 'react';
import './SummaryConfig.css';

const SummaryConfig = ({ config, onChange, totalPages = 1 }) => {
  const [localConfig, setLocalConfig] = useState({
    enablePageSummaries: true,
    pageInterval: 1,
    enableFullSummary: true,
    summaryStyle: 'intelligent', // 'intelligent', 'brief', 'detailed'
    pageRange: 'all', // 'all' or 'custom'
    startPage: 1,
    endPage: Math.max(totalPages || 1, 1),
    premiumAudio: false,
    generateFlashcards: true,
    flashcardCount: 'auto', // 'auto' or number
    customFlashcardCount: 15,
    ...config
  });

  // Update endPage when totalPages changes
  React.useEffect(() => {
    if (totalPages && totalPages > 0) {
      const newEndPage = Math.max(totalPages, 1);
      setLocalConfig(prevConfig => {
        if (newEndPage !== prevConfig.endPage) {
          const newConfig = { ...prevConfig, endPage: newEndPage };
          onChange(newConfig);
          return newConfig;
        }
        return prevConfig;
      });
    }
  }, [totalPages, onChange]);

  // Generate intelligent interval options based on page count
  const getIntervalOptions = () => {
    const options = [1];
    if (totalPages >= 2) options.push(2);
    if (totalPages >= 3) options.push(3);
    if (totalPages >= 5) options.push(5);
    if (totalPages >= 10) options.push(10);
    if (totalPages >= 20) options.push(20);
    if (totalPages >= 50) options.push(50);
    options.push('custom');
    return options;
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="summary-config">
      <div className="config-header">
        <h3>Summary Configuration</h3>
        <p>Customize how your audiobook summaries are generated</p>
      </div>

      {/* 1. Page Range - First logical choice */}
      <div className="config-section">
        <div className="config-option">
          <div className="option-header">
            <span className="option-title">Page Range</span>
            <p className="option-description">Choose which pages to process</p>
          </div>
          
          <div className="style-options">
            <label className="radio-option">
              <input
                type="radio"
                name="pageRange"
                value="all"
                checked={localConfig.pageRange === 'all'}
                onChange={(e) => handleConfigChange('pageRange', e.target.value)}
                className="radio-input"
              />
              <div className="radio-custom">
                <div className="radio-dot"></div>
              </div>
              <div className="radio-content">
                <span className="radio-label">All Pages</span>
                <span className="radio-desc">Process entire document</span>
              </div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="pageRange"
                value="custom"
                checked={localConfig.pageRange === 'custom'}
                onChange={(e) => handleConfigChange('pageRange', e.target.value)}
                className="radio-input"
              />
              <div className="radio-custom">
                <div className="radio-dot"></div>
              </div>
              <div className="radio-content">
                <span className="radio-label">Custom Range</span>
                <span className="radio-desc">Select specific pages</span>
              </div>
            </label>
          </div>
          
          {localConfig.pageRange === 'custom' && (
            <div className="page-range-inputs">
              <div className="input-group">
                <label className="input-label">From page</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={localConfig.startPage}
                  onChange={(e) => handleConfigChange('startPage', parseInt(e.target.value))}
                  className="page-input"
                />
              </div>
              <div className="input-group">
                <label className="input-label">To page</label>
                <input
                  type="number"
                  min={localConfig.startPage}
                  max={totalPages}
                  value={localConfig.endPage}
                  onChange={(e) => handleConfigChange('endPage', parseInt(e.target.value))}
                  className="page-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Summary Configuration */}
      <div className="config-section">
        <div className="config-option">
          <div className="option-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localConfig.enablePageSummaries}
                onChange={(e) => handleConfigChange('enablePageSummaries', e.target.checked)}
                className="config-checkbox"
              />
              <div className="checkbox-custom">
                {localConfig.enablePageSummaries && (
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                )}
              </div>
              <span className="option-title">Page-by-page summaries</span>
            </label>
            <p className="option-description">
              Generate intelligent summaries for individual pages or sections
            </p>
          </div>

          {localConfig.enablePageSummaries && (
            <div className="sub-options">
              <div className="interval-selector">
                <label className="interval-label">
                  Summary interval:
                  <div className="interval-control">
                    <span>Every</span>
                    <select
                      value={localConfig.pageInterval === 'custom' ? 'custom' : localConfig.pageInterval}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'custom') {
                          handleConfigChange('pageInterval', 'custom');
                        } else {
                          handleConfigChange('pageInterval', parseInt(value));
                        }
                      }}
                      className="interval-select"
                    >
                      {getIntervalOptions().map(option => (
                        <option key={option} value={option}>
                          {option === 'custom' ? 'Custom' : option}
                        </option>
                      ))}
                    </select>
                    <span>page{typeof localConfig.pageInterval === 'number' && localConfig.pageInterval > 1 ? 's' : ''}</span>
                  </div>
                </label>
                
                {localConfig.pageInterval === 'custom' && (
                  <div className="custom-interval">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={localConfig.customPageInterval || 1}
                      onChange={(e) => handleConfigChange('customPageInterval', parseInt(e.target.value))}
                      className="custom-interval-input"
                      placeholder="Pages"
                    />
                    <span>pages per summary</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="config-option">
          <div className="option-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localConfig.enableFullSummary}
                onChange={(e) => handleConfigChange('enableFullSummary', e.target.checked)}
                className="config-checkbox"
              />
              <div className="checkbox-custom">
                {localConfig.enableFullSummary && (
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                )}
              </div>
              <span className="option-title">Full document summary</span>
            </label>
            <p className="option-description">
              Generate an overall summary of the entire document
            </p>
          </div>
        </div>

        <div className="config-option">
          <div className="option-header">
            <span className="option-title">Summary style</span>
            <p className="option-description">
              Choose how detailed you want your summaries to be
            </p>
          </div>
          
          <div className="style-options">
            {[
              { value: 'brief', label: 'Brief', desc: 'Concise key points' },
              { value: 'intelligent', label: 'Intelligent', desc: 'Balanced detail and clarity' },
              { value: 'detailed', label: 'Detailed', desc: 'Comprehensive coverage' }
            ].map((style) => (
              <label key={style.value} className="radio-option">
                <input
                  type="radio"
                  name="summaryStyle"
                  value={style.value}
                  checked={localConfig.summaryStyle === style.value}
                  onChange={(e) => handleConfigChange('summaryStyle', e.target.value)}
                  className="radio-input"
                />
                <div className="radio-custom">
                  <div className="radio-dot"></div>
                </div>
                <div className="radio-content">
                  <span className="radio-label">{style.label}</span>
                  <span className="radio-desc">{style.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Audio & Study Features */}
      <div className="config-section">
        <div className="config-option">
          <div className="option-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localConfig.premiumAudio}
                onChange={(e) => handleConfigChange('premiumAudio', e.target.checked)}
                className="config-checkbox"
              />
              <div className="checkbox-custom">
                {localConfig.premiumAudio && (
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                )}
              </div>
              <span className="option-title">Premium Audio</span>
            </label>
            <p className="option-description">
              Use high-quality GPT-4o-mini TTS instead of standard Deepgram audio
            </p>
          </div>
        </div>

        <div className="config-option">
          <div className="option-header">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localConfig.generateFlashcards}
                onChange={(e) => handleConfigChange('generateFlashcards', e.target.checked)}
                className="config-checkbox"
              />
              <div className="checkbox-custom">
                {localConfig.generateFlashcards && (
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                )}
              </div>
              <span className="option-title">Generate Flashcards</span>
            </label>
            <p className="option-description">
              Create study flashcards and quiz questions from the content
            </p>
          </div>
          
          {localConfig.generateFlashcards && (
            <div className="sub-options">
              <div className="flashcard-config">
                <label className="flashcard-count-label">
                  Number of flashcards:
                  <div className="flashcard-control">
                    <select
                      value={localConfig.flashcardCount}
                      onChange={(e) => handleConfigChange('flashcardCount', e.target.value)}
                      className="flashcard-select"
                    >
                      <option value="auto">Auto (AI decides)</option>
                      <option value="custom">Custom amount</option>
                    </select>
                  </div>
                </label>
                
                {localConfig.flashcardCount === 'custom' && (
                  <div className="custom-flashcard-count">
                    <input
                      type="number"
                      min="5"
                      max="200"
                      value={localConfig.customFlashcardCount}
                      onChange={(e) => handleConfigChange('customFlashcardCount', parseInt(e.target.value))}
                      className="flashcard-count-input"
                      placeholder="Number of flashcards"
                    />
                    <span>flashcards (5-200)</span>
                  </div>
                )}
                
                <div className="flashcard-hint">
                  {localConfig.flashcardCount === 'auto' ? 
                    '📚 AI will determine optimal count based on content length' :
                    `📚 Will generate ${localConfig.customFlashcardCount} flashcards from your document`
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Configuration Preview */}
      <div className="config-preview">
        <div className="preview-header">
          <h4>Configuration Preview</h4>
        </div>
        <div className="preview-content">
          <div className="preview-item">
            ✓ Pages {localConfig.pageRange === 'all' ? 'All' : `${localConfig.startPage}-${localConfig.endPage}`}
          </div>
          {localConfig.enablePageSummaries && (
            <div className="preview-item">
              ✓ Page summaries every {localConfig.pageInterval} page{localConfig.pageInterval > 1 ? 's' : ''}
            </div>
          )}
          {localConfig.enableFullSummary && (
            <div className="preview-item">
              ✓ Full document summary
            </div>
          )}
          <div className="preview-item">
            ✓ {localConfig.summaryStyle.charAt(0).toUpperCase() + localConfig.summaryStyle.slice(1)} style summaries (GPT-5-mini)
          </div>
          {localConfig.premiumAudio && (
            <div className="preview-item">
              ✓ Premium audio quality (OpenAI TTS)
            </div>
          )}
          {localConfig.generateFlashcards && (
            <div className="preview-item">
              ✓ Study flashcards & quiz included
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryConfig;