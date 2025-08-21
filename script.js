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

    // Theme Management
    let currentTheme = 'dark';
    const themeOptions = document.querySelectorAll('.theme-option');
    const body = document.body;

    function setTheme(theme) {
        body.classList.remove('theme-dark', 'theme-blue', 'theme-green');
        body.classList.add(`theme-${theme}`);
        currentTheme = theme;

        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });

        // Save theme preference
        localStorage.setItem('preferred-theme', theme);
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
        const themes = ['dark', 'blue', 'green'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
    });

    // Preview Update
    function updatePreview() {
        showLoading('Updating preview...');
        
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

        // Hide loading after a small delay to ensure preview has loaded
        setTimeout(hideLoading, 500);
    }

    // Manual preview refresh with loading animation
    document.querySelector('.refresh-preview').addEventListener('click', () => {
        showLoading('Refreshing preview...');
        setTimeout(updatePreview, 300);
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

    previewSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            previewSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            previewFrame.dataset.size = button.dataset.size;
            updatePreview();
        });
    });

    // Modal Management
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'translateY(0)';
            }
        }, 10);
    }

    function hideModal(modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateY(20px)';
        }
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Settings Modal
    document.querySelector('.settings-btn').addEventListener('click', () => {
        showModal('settings-modal');
    });

    // Keyboard Shortcuts Modal
    document.querySelector('.shortcuts-btn').addEventListener('click', () => {
        showModal('shortcuts-modal');
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
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }

    document.querySelector('.copy-html').addEventListener('click', () => {
        copyToClipboard(htmlEditor.getValue());
    });

    document.querySelector('.copy-css').addEventListener('click', () => {
        copyToClipboard(cssEditor.getValue());
    });

    document.querySelector('.copy-js').addEventListener('click', () => {
        copyToClipboard(jsEditor.getValue());
    });

    document.querySelector('.copy-all').addEventListener('click', () => {
        const allCode = `<!-- HTML -->
${htmlEditor.getValue()}

/* CSS */
${cssEditor.getValue()}

// JavaScript
${jsEditor.getValue()}`;
        copyToClipboard(allCode);
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

    // Settings
    document.querySelector('.settings-btn').addEventListener('click', () => {
        showModal('settings-modal');
    });

    document.querySelector('.shortcuts-btn').addEventListener('click', () => {
        showModal('shortcuts-modal');
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
            document.querySelector('.settings-btn').click();
        }
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.querySelector('.shortcuts-btn').click();
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
            alert('Please enter a project name');
            return;
        }

        showLoading('Saving project...');

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
            hideLoading();
        }, 500);
    });

    // Download Files
    document.querySelector('.download-files').addEventListener('click', async () => {
        showLoading('Preparing download...');

        // Create a zip file
        const zip = new JSZip();
        
        // Add files to the zip
        zip.file('index.html', htmlEditor.getValue());
        zip.file('styles.css', cssEditor.getValue());
        zip.file('script.js', jsEditor.getValue());

        try {
            // Generate the zip file
            const content = await zip.generateAsync({ type: 'blob' });
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'web-project.zip';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            hideLoading();
        } catch (error) {
            console.error('Error creating zip file:', error);
            hideLoading();
            alert('Error creating zip file. Please try again.');
        }
    });

    // Load Projects List
    function loadProjectsList() {
        showLoading('Loading projects...');
        const projectsList = document.querySelector('.projects-list');
        projectsList.innerHTML = '';

        setTimeout(() => {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('project_')) {
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
                        }
                    });

                    projectsList.appendChild(projectItem);
                }
            }

            if (projectsList.children.length === 0) {
                projectsList.innerHTML = '<div class="no-projects">No saved projects found</div>';
            }

            hideLoading();
        }, 500);
    }

    // Load Project
    function loadProject(projectName) {
        showLoading('Loading project...');
        
        setTimeout(() => {
            const project = JSON.parse(localStorage.getItem(`project_${projectName}`));
            if (!project) return;

            htmlEditor.setValue(project.html);
            cssEditor.setValue(project.css);
            jsEditor.setValue(project.js);
            updatePreview();
            
            hideLoading();
        }, 500);
    }

    // Initial preview update
    updatePreview();
});
