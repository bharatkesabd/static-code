// Admin Panel JavaScript for Quote Management
let quotesData = {};
let currentEditingId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    await loadQuotesData();
    updateStatistics();
    loadQuotesList();
    setupEventListeners();
});

// Load quotes data from JSON
async function loadQuotesData() {
    try {
        const response = await fetch('./data/quotes.json');
        quotesData = await response.json();
        console.log('✅ Quotes loaded in admin panel');
    } catch (error) {
        console.error('❌ Error loading quotes:', error);
        alert('कोट्स लोड करने में समस्या हुई। कृपया सुनिश्चित करें कि quotes.json फ़ाइल उपलब्ध है।');
    }
}

// Update statistics dashboard
function updateStatistics() {
    if (!quotesData.metadata) return;
    
    const totalQuotes = quotesData.metadata.total_quotes || 0;
    const totalCategories = quotesData.metadata.categories ? quotesData.metadata.categories.length : 0;
    const popularQuotes = Object.values(quotesData).flat()
        .filter(q => q && q.popularity && q.popularity > 80).length;
    const lastUpdated = quotesData.metadata.last_updated ? 
        new Date(quotesData.metadata.last_updated).toLocaleDateString('hi-IN') : '-';
    
    document.getElementById('totalQuotesAdmin').textContent = totalQuotes;
    document.getElementById('totalCategoriesAdmin').textContent = totalCategories;
    document.getElementById('popularQuotesAdmin').textContent = popularQuotes;
    document.getElementById('lastUpdatedAdmin').textContent = lastUpdated;
}

// Setup event listeners
function setupEventListeners() {
    // Add quote form submission
    document.getElementById('addQuoteForm').addEventListener('submit', handleAddQuote);
    
    // Tags input handling
    document.getElementById('quoteTags').addEventListener('input', updateTagsDisplay);
    
    // File upload handling
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('fileInput');
    
    fileUpload.addEventListener('click', () => fileInput.click());
    fileUpload.addEventListener('dragover', handleDragOver);
    fileUpload.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
}

// Show admin section
function showAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Load quotes list if manage section is selected
    if (sectionName === 'manage') {
        loadQuotesList();
    }
}

// Handle add quote form submission
async function handleAddQuote(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tagsInput = formData.get('tags');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Generate new ID
    const allQuotes = Object.values(quotesData).flat().filter(q => q && q.id);
    const maxId = Math.max(...allQuotes.map(q => q.id), 0);
    const newId = maxId + 1;
    
    const newQuote = {
        id: newId,
        text: formData.get('text').trim(),
        author: formData.get('author').trim(),
        category: formData.get('category'),
        tags: tags,
        date_added: new Date().toISOString().split('T')[0],
        popularity: parseInt(formData.get('popularity')) || 50
    };
    
    // Validate required fields
    if (!newQuote.text || !newQuote.author || !newQuote.category) {
        alert('कृपया सभी आवश्यक फील्ड भरें।');
        return;
    }
    
    // Add quote to appropriate category
    if (!quotesData[newQuote.category]) {
        quotesData[newQuote.category] = [];
    }
    quotesData[newQuote.category].push(newQuote);
    
    // Update metadata
    updateMetadata();
    
    // Save to JSON (in real implementation, this would send to server)
    await saveQuotesToJSON();
    
    // Reset form
    event.target.reset();
    updateTagsDisplay();
    
    // Show success message
    alert('✅ कोट सफलतापूर्वक जोड़ा गया!');
    
    // Update statistics
    updateStatistics();
    
    // Refresh quotes list if manage section is active
    if (document.getElementById('manage-section').classList.contains('active')) {
        loadQuotesList();
    }
}

// Update tags display
function updateTagsDisplay() {
    const tagsInput = document.getElementById('quoteTags');
    const tagsDisplay = document.getElementById('tagsDisplay');
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    tagsDisplay.innerHTML = tags.map(tag => `
        <span class="tag">
            #${tag}
            <button type="button" class="tag-remove" onclick="removeTag('${tag}')">×</button>
        </span>
    `).join('');
}

// Remove tag
function removeTag(tagToRemove) {
    const tagsInput = document.getElementById('quoteTags');
    const currentTags = tagsInput.value.split(',').map(tag => tag.trim());
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    tagsInput.value = updatedTags.join(', ');
    updateTagsDisplay();
}

// Load quotes list for management
function loadQuotesList() {
    const quotesList = document.getElementById('quotesList');
    const filterCategory = document.getElementById('filterCategory').value;
    
    let allQuotes = [];
    
    // Collect quotes from selected category or all categories
    if (filterCategory) {
        allQuotes = quotesData[filterCategory] || [];
    } else {
        allQuotes = Object.values(quotesData).flat().filter(q => q && q.id);
    }
    
    // Sort by popularity
    allQuotes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    quotesList.innerHTML = allQuotes.map(quote => `
        <div class="quote-item-admin" data-quote-id="${quote.id}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <strong>ID: ${quote.id}</strong>
                <span style="background: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem;">
                    ${quote.category}
                </span>
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem; line-height: 1.4;">
                "${quote.text}"
            </div>
            <div style="color: #666; margin-bottom: 0.5rem;">
                - ${quote.author}
            </div>
            ${quote.tags ? `
                <div style="margin-bottom: 0.5rem;">
                    ${quote.tags.map(tag => `<span style="background: #f0f0f0; padding: 0.15rem 0.3rem; border-radius: 10px; font-size: 0.7rem; margin-right: 0.25rem;">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div style="font-size: 0.8rem; color: #888; margin-bottom: 0.5rem;">
                लोकप्रियता: ${quote.popularity || 0}% | जोड़ा गया: ${quote.date_added || 'N/A'}
            </div>
            <div class="quote-actions-admin">
                <button class="btn-admin btn-edit" onclick="editQuote(${quote.id})">
                    <i class="fas fa-edit"></i> संपादित करें
                </button>
                <button class="btn-admin btn-delete" onclick="deleteQuote(${quote.id})">
                    <i class="fas fa-trash"></i> हटाएं
                </button>
            </div>
        </div>
    `).join('');
}

// Filter quotes
function filterQuotes() {
    loadQuotesList();
}

// Edit quote
function editQuote(quoteId) {
    const quote = findQuoteById(quoteId);
    if (!quote) return;
    
    // Switch to add section
    showAdminSection('add');
    document.querySelector('[onclick="showAdminSection(\'add\')"]').classList.add('active');
    
    // Fill form with quote data
    document.getElementById('quoteText').value = quote.text;
    document.getElementById('quoteAuthor').value = quote.author;
    document.getElementById('quoteCategory').value = quote.category;
    document.getElementById('quoteTags').value = quote.tags ? quote.tags.join(', ') : '';
    document.getElementById('quotePopularity').value = quote.popularity || 50;
    
    updateTagsDisplay();
    
    // Store editing ID
    currentEditingId = quoteId;
    
    // Change button text
    const submitBtn = document.querySelector('#addQuoteForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> कोट अपडेट करें';
    submitBtn.style.background = '#2196F3';
}

// Delete quote
function deleteQuote(quoteId) {
    if (!confirm('क्या आप वाकई इस कोट को हटाना चाहते हैं?')) return;
    
    // Find and remove quote
    for (const [category, quotes] of Object.entries(quotesData)) {
        if (category === 'metadata') continue;
        
        const index = quotes.findIndex(q => q && q.id === quoteId);
        if (index > -1) {
            quotes.splice(index, 1);
            break;
        }
    }
    
    // Update metadata
    updateMetadata();
    
    // Save changes
    saveQuotesToJSON();
    
    // Refresh list
    loadQuotesList();
    updateStatistics();
    
    alert('✅ कोट सफलतापूर्वक हटाया गया!');
}

// Find quote by ID
function findQuoteById(quoteId) {
    for (const [category, quotes] of Object.entries(quotesData)) {
        if (category === 'metadata') continue;
        
        const quote = quotes.find(q => q && q.id === quoteId);
        if (quote) return quote;
    }
    return null;
}

// Update metadata
function updateMetadata() {
    const allQuotes = Object.values(quotesData).flat().filter(q => q && q.id);
    const categories = Object.keys(quotesData).filter(key => key !== 'metadata');
    
    quotesData.metadata = {
        last_updated: new Date().toISOString(),
        total_quotes: allQuotes.length,
        version: quotesData.metadata?.version || "1.0.0",
        categories: categories
    };
}

// Save quotes to JSON (simulation - in real app, this would send to server)
async function saveQuotesToJSON() {
    try {
        // In a real application, you would send this data to your server
        // For now, we'll just log it and show a message
        console.log('💾 Saving quotes data:', quotesData);
        
        // You could implement a server endpoint to save the JSON file
        // await fetch('/api/save-quotes', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(quotesData)
        // });
        
        return true;
    } catch (error) {
        console.error('❌ Error saving quotes:', error);
        return false;
    }
}

// Download backup
function downloadBackup() {
    const dataStr = JSON.stringify(quotesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bharatkeshabd-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    alert('✅ बैकअप फ़ाइल डाउनलोड हो गई!');
}

// File upload handling
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (file.type !== 'application/json') {
        alert('कृपया केवल JSON फ़ाइल अपलोड करें।');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate imported data structure
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('Invalid JSON structure');
            }
            
            // Show import preview
            showImportPreview(importedData);
            
        } catch (error) {
            alert('❌ फ़ाइल में समस्या है। कृपया सही JSON फ़ाइल अपलोड करें।');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

function showImportPreview(importedData) {
    const totalQuotes = Object.values(importedData).flat().filter(q => q && q.id).length;
    const categories = Object.keys(importedData).filter(key => key !== 'metadata');
    
    const confirmMessage = `
इंपोर्ट प्रीव्यू:
• कुल कोट्स: ${totalQuotes}
• कैटेगरी: ${categories.join(', ')}

क्या आप इन कोट्स को इंपोर्ट करना चाहते हैं?
(मौजूदा डेटा रिप्लेस हो जाएगा)
    `;
    
    if (confirm(confirmMessage)) {
        quotesData = importedData;
        updateMetadata();
        saveQuotesToJSON();
        updateStatistics();
        loadQuotesList();
        alert('✅ कोट्स सफलतापूर्वक इंपोर्ट हो गए!');
    }
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
