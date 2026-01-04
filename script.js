// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial page load animation
    const pageLoad = document.createElement('div');
    pageLoad.className = 'page-load';
    pageLoad.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading DevPad...</div>
    `;
    document.body.appendChild(pageLoad);

    // Hide page load animation after 2 seconds
    setTimeout(() => {
        pageLoad.classList.add('hide');
        setTimeout(() => pageLoad.remove(), 300);
    }, 2000);

    // Initialize CodeMirror Editors
    const htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
        mode: 'xml',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true,
        tabSize: 4,
        scrollbarStyle: 'overlay',
        fixedGutter: true,
        gutters: ["CodeMirror-linenumbers"],
        extraKeys: {"Ctrl-Space": "autocomplete"},
        viewportMargin: Infinity
    });

    const cssEditor = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true,
        tabSize: 4,
        scrollbarStyle: 'overlay',
        fixedGutter: true,
        gutters: ["CodeMirror-linenumbers"],
        extraKeys: {"Ctrl-Space": "autocomplete"},
        viewportMargin: Infinity
    });

    const jsEditor = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        lineWrapping: true,
        tabSize: 4,
        scrollbarStyle: 'overlay',
        fixedGutter: true,
        gutters: ["CodeMirror-linenumbers"],
        extraKeys: {"Ctrl-Space": "autocomplete"},
        viewportMargin: Infinity
    });

    // Loading Animation
    function showLoading(text = 'Loading...') {
        const loading = document.querySelector('.loading-overlay');
        loading.querySelector('.loading-text').textContent = text;
        loading.classList.add('active');
    }

    function hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        loading.classList.remove('active');
    }

    // Tab Switching
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const panelId = `${tab.dataset.tab}-panel`;
            document.getElementById(panelId).classList.add('active');

            switch(tab.dataset.tab) {
                case 'html': htmlEditor.refresh(); break;
                case 'css': cssEditor.refresh(); break;
                case 'js': jsEditor.refresh(); break;
            }
        });
    });

    // Toast Notification System
    function showToast(type, title, message, duration = 4000) {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'ri-checkbox-circle-line',
            error: 'ri-error-warning-line',
            warning: 'ri-alert-line',
            info: 'ri-information-line'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <i class="toast-close ri-close-line"></i>
        `;
        
        toastContainer.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto remove
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    function removeToast(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    // Theme Management
    let currentTheme = 'dark';
    const themeOptions = document.querySelectorAll('.theme-option');
    const body = document.body;

    function setTheme(theme) {
        body.classList.remove('theme-dark', 'theme-blue', 'theme-green', 'theme-light');
        body.classList.add(`theme-${theme}`);
        currentTheme = theme;

        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });

        // Save theme preference
        localStorage.setItem('preferred-theme', theme);
        showToast('success', 'Theme Changed', `Switched to ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`, 2000);
    }

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
        });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // Theme Toggle Button (cycles through themes)
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        const themes = ['dark', 'blue', 'green', 'light'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
    });

    // Resizable Divider
    const divider = document.querySelector('.divider');
    const editorSection = document.querySelector('.editor-section');
    const previewSection = document.querySelector('.preview-section');
    let isDragging = false;
    
    if (divider) {
        divider.addEventListener('mousedown', (e) => {
            isDragging = true;
            divider.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const containerWidth = document.querySelector('.main-content').offsetWidth;
            const newEditorWidth = (e.clientX / containerWidth) * 100;
            
            if (newEditorWidth > 20 && newEditorWidth < 80) {
                editorSection.style.width = `${newEditorWidth}%`;
                previewSection.style.flex = '1';
            }

            if (resizeAnimationFrame) {
                cancelAnimationFrame(resizeAnimationFrame);
            }

            resizeAnimationFrame = requestAnimationFrame(() => {
                autoAdjustPreviewMode({ triggerUpdate: false });
            });
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                divider.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Refresh editors after resize
                setTimeout(() => {
                    htmlEditor.refresh();
                    cssEditor.refresh();
                    jsEditor.refresh();
                }, 100);

                const modeChanged = autoAdjustPreviewMode({ triggerUpdate: false });
                if (modeChanged) {
                    updatePreview();
                }
            }
        });
    }

    // Preview Update
    function updatePreview() {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.classList.add('active');
        
        const preview = document.getElementById('preview');
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        // Create a new iframe
        const newFrame = document.createElement('iframe');
        newFrame.id = 'preview';
        
        // Replace the old iframe with the new one
        preview.parentNode.replaceChild(newFrame, preview);
        
        // Write content to the new iframe
        const previewContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        /* Reset default styles */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        /* User's CSS */
                        ${css}
                    </style>
                </head>
                <body>
                    ${html}
                    <script>${js}<\/script>
                </body>
            </html>
        `;

        const previewFrame = newFrame.contentDocument || newFrame.contentWindow.document;
        previewFrame.open();
        previewFrame.write(previewContent);
        previewFrame.close();

        // Hide progress bar after preview has loaded
        setTimeout(() => {
            progressBar.classList.remove('active');
        }, 500);
    }

    // Manual preview refresh
    document.querySelector('.refresh-preview').addEventListener('click', () => {
        updatePreview();
        showToast('info', 'Preview Refreshed', 'Your preview has been updated', 2000);
    });

    // Auto-update preview (debounced)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedUpdate = debounce(updatePreview, 500);

    // Listen for changes in all editors
    htmlEditor.on('change', debouncedUpdate);
    cssEditor.on('change', debouncedUpdate);
    jsEditor.on('change', debouncedUpdate);

    // Responsive Preview
    const previewSizeButtons = document.querySelectorAll('.preview-size');
    const previewFrame = document.querySelector('.preview-frame');
    let currentPreviewMode = 'desktop';
    let resizeAnimationFrame = null;

    const normalizePreviewMode = (mode) => {
        return ['desktop', 'tablet', 'mobile'].includes(mode) ? mode : 'desktop';
    };

    const setPreviewMode = (mode, { triggerUpdate = true } = {}) => {
        if (!previewFrame) return false;
        const normalizedMode = normalizePreviewMode(mode);
        const modeChanged = currentPreviewMode !== normalizedMode;
        currentPreviewMode = normalizedMode;

        previewFrame.dataset.size = normalizedMode;
        previewSizeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === normalizedMode);
        });

        if (modeChanged && triggerUpdate) {
            updatePreview();
        }

        return modeChanged;
    };

    const detectPreviewModeFromWidth = (width) => {
        if (width <= 560) return 'mobile';
        if (width <= 960) return 'tablet';
        return 'desktop';
    };

    const autoAdjustPreviewMode = ({ triggerUpdate = false } = {}) => {
        if (!previewFrame) return false;
        const { width } = previewFrame.getBoundingClientRect();
        const detectedMode = detectPreviewModeFromWidth(width);
        return setPreviewMode(detectedMode, { triggerUpdate });
    };

    previewSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            setPreviewMode(button.dataset.size);
        });
    });

    setPreviewMode(currentPreviewMode, { triggerUpdate: false });

    // Modal Management Helpers
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'translateY(0)';
            }
        });
    }

    function hideModal(modal) {
        if (!modal) return;
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateY(20px)';
        }
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Settings Popover
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const closeSettingsPopoverBtn = document.querySelector('.close-settings-popover');

    const openSettingsPopover = () => {
        if (!settingsPopover) return;
        settingsPopover.classList.add('open');
        settingsPopover.setAttribute('aria-hidden', 'false');
        settingsBtn?.classList.add('active');
    };

    const closeSettingsPopover = () => {
        if (!settingsPopover) return;
        settingsPopover.classList.remove('open');
        settingsPopover.setAttribute('aria-hidden', 'true');
        settingsBtn?.classList.remove('active');
    };

    const toggleSettingsPopover = () => {
        if (!settingsPopover) return;
        const isOpen = settingsPopover.classList.contains('open');
        if (isOpen) {
            closeSettingsPopover();
        } else {
            openSettingsPopover();
        }
    };

    settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettingsPopover();
    });

    closeSettingsPopoverBtn?.addEventListener('click', () => {
        closeSettingsPopover();
    });

    document.addEventListener('click', (event) => {
        if (!settingsPopover || !settingsPopover.classList.contains('open')) return;
        if (settingsPopover.contains(event.target) || settingsBtn?.contains(event.target)) return;
        closeSettingsPopover();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsPopover?.classList.contains('open')) {
            closeSettingsPopover();
        }
    });

    // Share Modal
    document.querySelector('.share-project').addEventListener('click', () => {
        showModal('share-modal');
    });

    // Close buttons for all modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.closest('.modal'));
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Share functionality
    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('success', 'Copied!', `${label} copied to clipboard`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            showToast('error', 'Copy Failed', 'Failed to copy to clipboard');
        });
    }

    document.querySelector('.copy-html').addEventListener('click', () => {
        copyToClipboard(htmlEditor.getValue(), 'HTML code');
    });

    document.querySelector('.copy-css').addEventListener('click', () => {
        copyToClipboard(cssEditor.getValue(), 'CSS code');
    });

    document.querySelector('.copy-js').addEventListener('click', () => {
        copyToClipboard(jsEditor.getValue(), 'JavaScript code');
    });

    document.querySelector('.copy-all').addEventListener('click', () => {
        const allCode = `<!-- HTML -->
${htmlEditor.getValue()}

/* CSS */
${cssEditor.getValue()}

// JavaScript
${jsEditor.getValue()}`;
        copyToClipboard(allCode, 'All code');
    });

    // Open in new window
    document.querySelector('.open-preview').addEventListener('click', () => {
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        const previewContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}<\/script>
                </body>
            </html>
        `;

        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(previewContent);
        previewWindow.document.close();
    });

    // Project Save/Load
    document.querySelector('.save-project').addEventListener('click', () => {
        showModal('save-modal');
    });

    document.querySelector('.load-project').addEventListener('click', () => {
        showModal('load-modal');
        loadProjectsList();
    });

    // Editor Settings
    const fontSizeSelect = document.getElementById('font-size');
    const tabSizeSelect = document.getElementById('tab-size');
    const autoSaveToggle = document.getElementById('auto-save');
    const lineNumbersToggle = document.getElementById('line-numbers');
    const wordWrapToggle = document.getElementById('word-wrap');

    // Load saved settings
    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('editor-settings') || '{}');
        
        // Font size
        fontSizeSelect.value = settings.fontSize || '14';
        updateFontSize(fontSizeSelect.value);
        
        // Tab size
        tabSizeSelect.value = settings.tabSize || '4';
        updateTabSize(tabSizeSelect.value);
        
        // Auto save
        autoSaveToggle.checked = settings.autoSave || false;
        
        // Line numbers
        lineNumbersToggle.checked = settings.lineNumbers !== false;
        updateLineNumbers(lineNumbersToggle.checked);
        
        // Word wrap
        wordWrapToggle.checked = settings.wordWrap !== false;
        updateWordWrap(wordWrapToggle.checked);
    };

    // Save settings
    const saveSettings = () => {
        const settings = {
            fontSize: fontSizeSelect.value,
            tabSize: tabSizeSelect.value,
            autoSave: autoSaveToggle.checked,
            lineNumbers: lineNumbersToggle.checked,
            wordWrap: wordWrapToggle.checked
        };
        localStorage.setItem('editor-settings', JSON.stringify(settings));
    };

    // Update editor settings
    const updateFontSize = (size) => {
        [htmlEditor, cssEditor, jsEditor].forEach(editor => {
            editor.getWrapperElement().style.fontSize = `${size}px`;
            editor.refresh();
        });
    };

    const updateTabSize = (size) => {
        [htmlEditor, cssEditor, jsEditor].forEach(editor => {
            editor.setOption('tabSize', parseInt(size));
            editor.setOption('indentUnit', parseInt(size));
        });
    };

    const updateLineNumbers = (show) => {
        [htmlEditor, cssEditor, jsEditor].forEach(editor => {
            editor.setOption('lineNumbers', show);
        });
    };

    const updateWordWrap = (wrap) => {
        [htmlEditor, cssEditor, jsEditor].forEach(editor => {
            editor.setOption('lineWrapping', wrap);
        });
    };

    // Settings event listeners
    fontSizeSelect.addEventListener('change', () => {
        updateFontSize(fontSizeSelect.value);
        saveSettings();
    });

    tabSizeSelect.addEventListener('change', () => {
        updateTabSize(tabSizeSelect.value);
        saveSettings();
    });

    autoSaveToggle.addEventListener('change', saveSettings);

    lineNumbersToggle.addEventListener('change', () => {
        updateLineNumbers(lineNumbersToggle.checked);
        saveSettings();
    });

    wordWrapToggle.addEventListener('change', () => {
        updateWordWrap(wordWrapToggle.checked);
        saveSettings();
    });

    // Auto save functionality
    const autoSave = debounce(() => {
        if (autoSaveToggle.checked) {
            const projectName = 'autosave_' + new Date().toISOString().split('T')[0];
            const project = {
                html: htmlEditor.getValue(),
                css: cssEditor.getValue(),
                js: jsEditor.getValue(),
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(`project_${projectName}`, JSON.stringify(project));
        }
    }, 1000);

    // Add auto save to editor change events
    [htmlEditor, cssEditor, jsEditor].forEach(editor => {
        editor.on('change', autoSave);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // General shortcuts
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.querySelector('.save-project').click();
        }
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            document.querySelector('.load-project').click();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            document.querySelector('.share-project').click();
        }
        if (e.altKey && e.key === ',') {
            e.preventDefault();
            toggleSettingsPopover();
        }
        if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            toggleSettingsPopover();
        }
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            document.querySelector('.theme-toggle').click();
        }

        // Editor shortcuts
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            document.querySelector('[data-tab="html"]').click();
        }
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            document.querySelector('[data-tab="css"]').click();
        }
        if (e.altKey && e.key === '3') {
            e.preventDefault();
            document.querySelector('[data-tab="js"]').click();
        }

        // Preview shortcuts
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            document.querySelector('.refresh-preview').click();
        }
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            document.querySelector('[data-size="desktop"]').click();
        }
        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            document.querySelector('[data-size="tablet"]').click();
        }
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            document.querySelector('[data-size="mobile"]').click();
        }
    });

    // Load settings on startup
    loadSettings();

    // Save Project
    document.querySelector('.save-confirm').addEventListener('click', () => {
        const projectName = document.getElementById('project-name').value;
        if (!projectName) {
            showToast('warning', 'Name Required', 'Please enter a project name');
            return;
        }

        const progressBar = document.querySelector('.progress-bar');
        progressBar.classList.add('active');

        const project = {
            html: htmlEditor.getValue(),
            css: cssEditor.getValue(),
            js: jsEditor.getValue(),
            lastModified: new Date().toISOString()
        };

        setTimeout(() => {
            localStorage.setItem(`project_${projectName}`, JSON.stringify(project));
            hideModal(document.getElementById('save-modal'));
            document.getElementById('project-name').value = '';
            progressBar.classList.remove('active');
            showToast('success', 'Project Saved', `"${projectName}" has been saved successfully`);
        }, 500);
    });

    document.querySelector('.download-files').addEventListener('click', async () => {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.classList.add('active');
        showToast('info', 'Preparing Download', 'Creating zip file...');

        const zip = new JSZip();
        zip.file('index.html', htmlEditor.getValue());
        zip.file('styles.css', cssEditor.getValue());
        zip.file('script.js', jsEditor.getValue());

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'web-project.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            progressBar.classList.remove('active');
            showToast('success', 'Download Ready', 'Your project has been downloaded');
        } catch (error) {
            console.error('Error creating zip file:', error);
            progressBar.classList.remove('active');
            showToast('error', 'Download Failed', 'Error creating zip file. Please try again.');
        }
    });

    function loadProjectsList() {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.classList.add('active');
        const projectsList = document.querySelector('.projects-list');
        projectsList.innerHTML = '';

        setTimeout(() => {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key.startsWith('project_')) continue;

                const projectName = key.replace('project_', '');
                const project = JSON.parse(localStorage.getItem(key));
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                projectItem.innerHTML = `
                    <div class="project-info">
                        <div class="project-name">${projectName}</div>
                        <div class="project-date">Last modified: ${new Date(project.lastModified).toLocaleDateString()}</div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-secondary delete-project" title="Delete Project">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        <button class="btn btn-primary load-project-btn">
                            <i class="ri-folder-open-line"></i>
                            Load
                        </button>
                    </div>
                `;

                projectItem.querySelector('.load-project-btn').addEventListener('click', () => {
                    loadProject(projectName);
                    hideModal(document.getElementById('load-modal'));
                });

                projectItem.querySelector('.delete-project').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${projectName}"?`)) {
                        localStorage.removeItem(`project_${projectName}`);
                        projectItem.remove();
                        showToast('success', 'Project Deleted', `"${projectName}" has been deleted`);
                    }
                });

                projectsList.appendChild(projectItem);
            }

            if (projectsList.children.length === 0) {
                projectsList.innerHTML = '<div class="no-projects">No saved projects found</div>';
            }

            progressBar.classList.remove('active');
        }, 500);
    }

    function loadProject(projectName) {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.classList.add('active');

        setTimeout(() => {
            const project = JSON.parse(localStorage.getItem(`project_${projectName}`));
            if (!project) {
                progressBar.classList.remove('active');
                showToast('warning', 'Project Missing', 'Could not find the selected project');
                return;
            }

            htmlEditor.setValue(project.html || '');
            cssEditor.setValue(project.css || '');
            jsEditor.setValue(project.js || '');
            updatePreview();

            progressBar.classList.remove('active');
            showToast('success', 'Project Loaded', `"${projectName}" loaded successfully`);
        }, 500);
    }

    // Initial preview update
    updatePreview();
});
