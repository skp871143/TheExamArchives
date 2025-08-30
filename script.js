document.addEventListener('DOMContentLoaded', () => {
    // --- THEME SWITCHER LOGIC ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    // Function to apply the theme based on what's saved
    const applyTheme = (theme) => {
        if (theme === 'dark-mode') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    };

    // On page load, check for a saved theme in localStorage or system preference
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode');
    applyTheme(savedTheme);

    // Add a click event listener to the theme switcher button
    themeSwitcher.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        // Save the new theme preference to localStorage
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
    });

    // --- DYNAMIC CONTENT & ROUTING LOGIC ---
    const mainContainer = document.querySelector('main');
    const contextMenu = document.getElementById('context-menu');

    // State for clipboard and context menu target
    let clipboard = { action: null, data: null, sourceKey: null, parentKey: null };
    let contextTarget = { element: null, key: null, parentKey: null };

    // Data for the folders and their subfolders
    const folderData = {
        'NDA & NA': {
            subfolders: [
                { name: 'Maths PYQ', url: 'https://drive.google.com/drive/folders/1EPEqZbooXpgBCQHZ29NfxlJAT0gFjbmP?usp=sharing' },
                { name: 'GAT PYQ', url: 'https://drive.google.com/drive/folders/1ESNYKlSkYBIFZeOc1N-sB1072JxbGKBB?usp=sharing' },
                { name: 'Current Affairs', url: 'https://drive.google.com/drive/folders/1ETyWZW66zWdfc_csERtZM5qDGJYIWvaB?usp=drive_link' }
            ]
        },
        'CDS': {
            subfolders: [
                { name: 'English PYQ', url: 'PASTE_YOUR_GOOGLE_DRIVE_LINK_HERE' },
                { name: 'GK PYQ', url: 'PASTE_YOUR_GOOGLE_DRIVE_LINK_HERE' },
                { name: 'Maths PYQ', url: 'PASTE_YOUR_GOOGLE_DRIVE_LINK_HERE' }
            ]
        },
        // --- IMPORTANT ---
        // Replace the placeholder URLs for all other folders as well.
        // I've left the rest as-is for brevity, but you should update them
        // in the same format as NDA & NA and CDS above.
        'AFCAT': { subfolders: [{ name: 'General Awareness', url: '#' }, { name: 'Verbal Ability', url: '#' }, { name: 'Numerical Ability', url: '#' }] },
        'CAPF': { subfolders: [{ name: 'Paper I', url: '#' }, { name: 'Paper II', url: '#' }, { name: 'Essays', url: '#' }] },
        'SSC-CHSL': { subfolders: [{ name: 'Tier I', url: '#' }, { name: 'Tier II', url: '#' }, { name: 'Typing Material', url: '#' }] },
        'SSC-MTS': { subfolders: [{ name: 'Reasoning', url: '#' }, { name: 'Numerical Ability', url: '#' }, { name: 'General Awareness', url: '#' }] },
        'SSC-JE': { subfolders: [{ name: 'Civil', url: '#' }, { name: 'Mechanical', url: '#' }, { name: 'Electrical', url: '#' }] },
        'SSC-CGL': { subfolders: [{ name: 'Tier I', url: '#' }, { name: 'Tier II', url: '#' }, { name: 'Syllabus', url: '#' }] },
        'NEET': { subfolders: [{ name: 'Physics', url: '#' }, { name: 'Chemistry', url: '#' }, { name: 'Biology', url: '#' }] },
        'JEE': { subfolders: [{ name: 'Mains', url: '#' }, { name: 'Advanced', url: '#' }, { name: 'Formula Sheets', url: '#' }] },
        'BANKING': { subfolders: [{ name: 'IBPS PO', url: '#' }, { name: 'SBI Clerk', url: '#' }, { name: 'RBI Assistant', url: '#' }] },
        'RAILWAYS': { subfolders: [{ name: 'NTPC', url: '#' }, { name: 'Group D', url: '#' }, { name: 'ALP', url: '#' }] }
    };

    // SVG for the folder icon
    const folderIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="folder-icon">
            <path d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.25a3 3 0 01-2.65-1.5L9.75 1.5a3 3 0 00-2.65-1.5H4.5a3 3 0 00-3 3v15a3 3 0 003 3h15z" />
        </svg>
    `;

    // Function to generate the main grid of folders
    const generateFoldersGrid = () => {
        mainContainer.className = ''; // Ensure main has no specific class for consistency
        const folderNames = Object.keys(folderData);
        const allFoldersHtml = folderNames.map(name => {
            const isCut = clipboard.action === 'cut' && clipboard.sourceKey === name && clipboard.parentKey === null;
            const folderId = name.replace(/ & /g, '-').replace(/ /g, '-');
            return `
                <a href="#${folderId}" class="folder-box ${isCut ? 'is-cut' : ''}" data-folder-name="${name}">
                    <div class="folder-header">
                        ${folderIconSvg}
                        <h3>${name}</h3>
                    </div>
                </a>
            `;
        }).join('');
        // Wrap the folders in a .grid-container to be consistent with the subfolder view structure
        mainContainer.innerHTML = `<div class="grid-container">${allFoldersHtml}</div>`;
    };

    // Function to generate the view for subfolders
    const generateSubfolderView = (folderName) => {
        mainContainer.className = ''; // Clear class from main container so it doesn't conflict
        const folder = folderData[folderName];
        if (!folder) {
            window.location.hash = ''; // Go home if folder not found
            return;
        }

        const subfoldersHtml = folder.subfolders.map(subfolder => {
            const isCut = clipboard.action === 'cut' && clipboard.sourceKey === subfolder.name && clipboard.parentKey === folderName;
            return `
            <a href="${subfolder.url}" class="folder-box ${isCut ? 'is-cut' : ''}" data-folder-name="${subfolder.name}" target="_blank" rel="noopener noreferrer">
                <div class="folder-header">
                    ${folderIconSvg}
                    <h3>${subfolder.name}</h3>
                </div>
            </a>
        `}).join('');

        mainContainer.innerHTML = `
            <div class="subfolder-view">
                <div class="subfolder-view-header">
                    <a href="#" class="back-button">&larr; Back</a>
                    <h2>${folderName}</h2>
                </div>
                <div class="grid-container">${subfoldersHtml}</div>
            </div>
        `;
    };

    // Main render function to decide which view to show
    const render = () => {
        const hash = window.location.hash.substring(1);
        // Find the folder name that matches the URL hash
        const folderName = Object.keys(folderData).find(name => name.replace(/ & /g, '-').replace(/ /g, '-') === hash);
        
        if (folderName) {
            generateSubfolderView(folderName);
        } else {
            generateFoldersGrid();
        }
    };

    // Listen for hash changes (user clicks a folder or uses browser back/forward)
    window.addEventListener('hashchange', render);

    // Listen for backspace key to go back
    window.addEventListener('keydown', (e) => {
        // Only go back if not typing in an input field
        if (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault(); // Prevent default browser action
            window.history.back();
        }
    });

    // Initial render on page load
    if (mainContainer) {
        render();
    }

    // --- CONTEXT MENU LOGIC ---

    // Hide context menu on any click outside of it
    window.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });

    // Main logic for showing the context menu
    mainContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        const clickedFolder = e.target.closest('.folder-box');
        const clickedContainer = e.target.closest('.grid-container, .subfolder-view');

        // Determine the current view (main or subfolder)
        const hash = window.location.hash.substring(1);
        const parentKey = Object.keys(folderData).find(name => name.replace(/ & /g, '-').replace(/ /g, '-') === hash);

        if (clickedFolder) {
            // Right-clicked on a folder
            contextTarget = {
                element: clickedFolder,
                key: clickedFolder.dataset.folderName,
                parentKey: parentKey // will be undefined for main folders, which is correct
            };
            showContextMenu(e.clientX, e.clientY, { isFolder: true });
        } else if (clickedContainer) {
            // Right-clicked on the background
            contextTarget = {
                element: clickedContainer,
                key: null,
                parentKey: parentKey
            };
            showContextMenu(e.clientX, e.clientY, { isFolder: false });
        }
    });

    function showContextMenu(x, y, { isFolder }) {
        // Show/hide menu items based on context
        document.querySelector('[data-action="copy"]').style.display = isFolder ? 'block' : 'none';
        document.querySelector('[data-action="cut"]').style.display = isFolder ? 'block' : 'none';
        document.querySelector('[data-action="delete"]').style.display = isFolder ? 'block' : 'none';
        document.querySelector('[data-action="paste"]').style.display = !isFolder && clipboard.action ? 'block' : 'none';

        // Position and display menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }

    // Handle actions from the context menu
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        const { key, parentKey } = contextTarget;

        switch (action) {
            case 'copy':
            case 'cut':
                if (parentKey) { // It's a subfolder
                    const subfolderData = folderData[parentKey].subfolders.find(sf => sf.name === key);
                    clipboard = { action, data: { ...subfolderData }, sourceKey: key, parentKey: parentKey };
                } else { // It's a main folder
                    clipboard = { action, data: { ...folderData[key] }, sourceKey: key, parentKey: null };
                }
                render(); // Re-render to show 'is-cut' style if needed
                break;

            case 'delete':
                if (confirm(`Are you sure you want to delete "${key}"?`)) {
                    if (parentKey) { // Delete subfolder
                        folderData[parentKey].subfolders = folderData[parentKey].subfolders.filter(sf => sf.name !== key);
                    } else { // Delete main folder
                        delete folderData[key];
                    }
                    render();
                }
                break;

            case 'paste':
                if (!clipboard.action) return;

                const targetParentKey = parentKey; // The view we are currently in

                // Prevent pasting main folders into sub-views and vice-versa
                if ((clipboard.parentKey === null && targetParentKey) || (clipboard.parentKey !== null && !targetParentKey)) {
                    alert("Cannot paste here. Folders must be pasted in a container of the same type.");
                    return;
                }

                let newName = clipboard.data.name || clipboard.sourceKey;
                const targetList = targetParentKey ? folderData[targetParentKey].subfolders.map(f => f.name) : Object.keys(folderData);
                while (targetList.includes(newName)) { newName += " (Copy)"; }

                if (targetParentKey) { // Pasting a subfolder
                    folderData[targetParentKey].subfolders.push({ ...clipboard.data, name: newName });
                } else { // Pasting a main folder
                    folderData[newName] = { ...clipboard.data };
                }

                if (clipboard.action === 'cut') {
                    if (clipboard.parentKey) { folderData[clipboard.parentKey].subfolders = folderData[clipboard.parentKey].subfolders.filter(sf => sf.name !== clipboard.sourceKey); } 
                    else { delete folderData[clipboard.sourceKey]; }
                }
                
                clipboard = { action: null, data: null, sourceKey: null, parentKey: null };
                render();
                break;
        }
    });
});