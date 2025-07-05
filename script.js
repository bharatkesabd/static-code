// Dynamic Quote System - Loads from JSON file
let quotes = {}; // Will be populated from JSON file
let quotesMetadata = {};
let favoriteQuotes = []; // User's favorite quotes

// Current state
let currentCategory = 'motivational';
let currentQuoteIndex = 0;
let quotesLoaded = 6;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const modal = document.getElementById('quoteModal');
const modalQuoteText = document.getElementById('modalQuoteText');
const modalAuthor = document.getElementById('modalAuthor');
const quotesGrid = document.getElementById('quotesGrid');
const trendingQuotes = document.getElementById('trendingQuotes');
const heroQuoteText = document.getElementById('heroQuoteText');

// Initialize the website - Enhanced
document.addEventListener('DOMContentLoaded', async function() {
    await loadQuotesFromJSON(); // Load quotes first
    initializeFavorites(); // Load user favorites
    initializeWebsite();
    setupEventListeners();
    loadInitialQuotes();
    loadTrendingQuotes();
    setupScrollToTop();
    rotateDailyQuote();
    updateStatistics();
    showWelcomeMessage();
});

// Load quotes from JSON file
async function loadQuotesFromJSON() {
    const possiblePaths = [
        './data/quotes.json',
        'data/quotes.json',
        '/data/quotes.json'
    ];
    
    try {
        showLoadingState(true);
        let response = null;
        let lastError = null;
        
        // Try different paths until one works
        for (const path of possiblePaths) {
            try {
                console.log(`🔄 Attempting to load quotes from: ${path}`);
                response = await fetch(path);
                
                if (response.ok) {
                    console.log(`✅ Successfully connected to: ${path}`);
                    break;
                } else {
                    console.warn(`❌ Failed to load from ${path}: ${response.status}`);
                    lastError = new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.warn(`❌ Error with path ${path}:`, error.message);
                lastError = error;
                response = null;
            }
        }
        
        if (!response || !response.ok) {
            throw lastError || new Error('Failed to load quotes from any path');
        }
        
        const data = await response.json();
        
        // Store quotes and metadata
        quotes = data;
        quotesMetadata = data.metadata;
        
        // Remove metadata from quotes object for cleaner access
        delete quotes.metadata;
        
        console.log('✅ Quotes loaded successfully:', quotesMetadata);
        showNotification(`📚 ${quotesMetadata.total_quotes} कोट्स लोड हो गए!`);
        
    } catch (error) {
        console.error('❌ Error loading quotes:', error);
        showNotification('कोट्स लोड करने में समस्या हुई। Fallback कोट्स का उपयोग कर रहे हैं।', 'warning');
        
        // Fallback to default quotes if JSON fails
        await loadFallbackQuotes();
    } finally {
        showLoadingState(false);
    }
}

// Fallback quotes in case JSON loading fails
async function loadFallbackQuotes() {
    quotes = {
        motivational: [
            { id: 1, text: "सफलता का सबसे बड़ा राज यह है कि आप कभी हार न मानें।", author: "महात्मा गांधी", category: "motivational", tags: ["success", "persistence"], popularity: 95, date_added: "2025-01-01" },
            { id: 2, text: "जो व्यक्ति कड़ी मेहनत करता है, भाग्य उसका साथ देता है।", author: "ए.पी.जे. अब्दुल कलाम", category: "motivational", tags: ["hard work", "luck"], popularity: 88, date_added: "2025-01-01" },
            { id: 3, text: "आपकी मंजिल आपका इंतजार कर रही है, बस आपको चलते रहना है।", author: "अज्ञात", category: "motivational", tags: ["persistence", "journey"], popularity: 82, date_added: "2025-01-01" },
            { id: 4, text: "हर दिन एक नई शुरुआत है, इसे अपना सबसे अच्छा दिन बनाइए।", author: "अज्ञात", category: "motivational", tags: ["new beginnings", "positivity"], popularity: 79, date_added: "2025-01-01" },
            { id: 5, text: "सपने वो नहीं हैं जो हम सोते समय देखते हैं, सपने तो वो हैं जो हमें सोने नहीं देते।", author: "ए.पी.जे. अब्दुल कलाम", category: "motivational", tags: ["dreams", "ambition"], popularity: 92, date_added: "2025-01-01" }
        ],
        love: [
            { id: 101, text: "प्रेम में दिल की आवाज़ सबसे तेज़ होती है।", author: "कबीर दास", category: "love", tags: ["heart", "voice"], popularity: 85, date_added: "2025-01-01" },
            { id: 102, text: "सच्चा प्यार वो है जो बिना शर्त किया जाए।", author: "अज्ञात", category: "love", tags: ["true love", "unconditional"], popularity: 78, date_added: "2025-01-01" },
            { id: 103, text: "मोहब्बत में जीतना-हारना नहीं होता, बस महसूस करना होता है।", author: "मिर्जा गालिब", category: "love", tags: ["feelings", "emotions"], popularity: 81, date_added: "2025-01-01" }
        ],
        friendship: [
            { id: 201, text: "सच्चा दोस्त वो है जो आपकी गलतियों के बावजूद भी साथ खड़ा रहे।", author: "कृष्ण", category: "friendship", tags: ["true friend", "support"], popularity: 87, date_added: "2025-01-01" },
            { id: 202, text: "दोस्ती वो रिश्ता है जिसमें कोई फर्ज़ नहीं, बस प्यार होता है।", author: "अज्ञात", category: "friendship", tags: ["relationship", "love"], popularity: 76, date_added: "2025-01-01" },
            { id: 203, text: "अच्छे दोस्त सितारों की तरह होते हैं, हमेशा दिखाई नहीं देते लेकिन हमेशा वहाँ होते हैं।", author: "अज्ञात", category: "friendship", tags: ["stars", "presence"], popularity: 84, date_added: "2025-01-01" }
        ]
    };
    
    // Set fallback metadata
    quotesMetadata = {
        total_quotes: 11,
        last_updated: "2025-01-01",
        version: "1.0.0-fallback"
    };
    
    console.log('📁 Fallback quotes loaded successfully');
    showNotification('🔄 Fallback कोट्स लोड किए गए। सभी फीचर्स उपलब्ध हैं!', 'info');
}

// Show/hide loading state
function showLoadingState(isLoading) {
    const existingLoader = document.querySelector('.quotes-loader');
    
    if (isLoading) {
        if (!existingLoader) {
            const loader = document.createElement('div');
            loader.className = 'quotes-loader';
            loader.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: white;
                    font-size: 1.2rem;
                ">
                    <div style="text-align: center;">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border: 3px solid #fff;
                            border-top: 3px solid #ff6b35;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 1rem;
                        "></div>
                        कोट्स लोड हो रहे हैं...
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
    } else {
        if (existingLoader) {
            existingLoader.remove();
        }
    }
}

// Get quotes by category with enhanced features
function getQuotesByCategory(category, options = {}) {
    const {
        sortBy = 'popularity', // 'popularity', 'date_added', 'random'
        limit = null,
        searchTerm = null
    } = options;
    
    let categoryQuotes = quotes[category] || [];
    
    // Filter by search term if provided
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        categoryQuotes = categoryQuotes.filter(quote => 
            quote.text.toLowerCase().includes(term) ||
            quote.author.toLowerCase().includes(term) ||
            (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }
    
    // Sort quotes
    switch (sortBy) {
        case 'popularity':
            categoryQuotes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
        case 'date_added':
            categoryQuotes.sort((a, b) => new Date(b.date_added || 0) - new Date(a.date_added || 0));
            break;
        case 'random':
            categoryQuotes = categoryQuotes.sort(() => Math.random() - 0.5);
            break;
    }
    
    // Limit results if specified
    if (limit && limit > 0) {
        categoryQuotes = categoryQuotes.slice(0, limit);
    }
    
    return categoryQuotes;
}

// Search quotes across all categories
function searchQuotes(searchTerm, options = {}) {
    const { limit = 20 } = options;
    const allQuotes = Object.values(quotes).flat();
    const term = searchTerm.toLowerCase();
    
    const results = allQuotes.filter(quote => 
        quote.text.toLowerCase().includes(term) ||
        quote.author.toLowerCase().includes(term) ||
        (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    
    return results.slice(0, limit);
}

// Initialize website functionality - Enhanced
function initializeWebsite() {
    // Ensure body can scroll properly
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Remove any conflicting scroll prevention
    document.body.style.position = '';
    document.body.style.height = '';
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.category-card, .quote-item, .trending-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Initialize quote of the day
    setQuoteOfTheDay();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Preload random quotes for faster access
    preloadRandomQuotes();
}

// Quote of the Day - Based on current date
function setQuoteOfTheDay() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const allQuotes = Object.values(quotes).flat();
    const quoteOfTheDay = allQuotes[dayOfYear % allQuotes.length];
    
    const heroQuoteText = document.getElementById('heroQuoteText');
    const heroQuoteAuthor = document.querySelector('#heroQuote .quote-author');
    
    if (heroQuoteText && heroQuoteAuthor) {
        heroQuoteText.textContent = `"${quoteOfTheDay.text}"`;
        heroQuoteAuthor.textContent = `- ${quoteOfTheDay.author}`;
    }
}

// Keyboard shortcuts for random quotes
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Spacebar for random quote
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            getRandomQuote();
        }
        
        // 'R' key for random quote
        if (e.code === 'KeyR' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            getRandomQuote();
        }
        
        // 'C' key to copy current hero quote
        if (e.code === 'KeyC' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            const heroQuoteText = document.getElementById('heroQuoteText').textContent;
            const heroQuoteAuthor = document.querySelector('#heroQuote .quote-author').textContent;
            copyToClipboard(`${heroQuoteText} ${heroQuoteAuthor}`);
        }
    });
}

// Preload random quotes for faster generation
let preloadedQuotes = [];
function preloadRandomQuotes() {
    const allQuotes = Object.values(quotes).flat();
    preloadedQuotes = [...allQuotes].sort(() => Math.random() - 0.5).slice(0, 20);
}

// Enhanced random quote with preloaded quotes
let currentPreloadIndex = 0;
function getRandomQuoteOptimized() {
    if (preloadedQuotes.length === 0) {
        preloadRandomQuotes();
    }
    
    const randomQuote = preloadedQuotes[currentPreloadIndex];
    currentPreloadIndex = (currentPreloadIndex + 1) % preloadedQuotes.length;
    
    // Refresh preloaded quotes when we've used them all
    if (currentPreloadIndex === 0) {
        preloadRandomQuotes();
    }
    
    return randomQuote;
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            selectCategory(category);
        });
    });

    // Modal functionality
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Newsletter subscription
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                subscribeNewsletter();
            }
        });
    }

    // Fix smooth scrolling for navigation links
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });
}

// Load initial quotes
function loadInitialQuotes() {
    displayQuotes(currentCategory, 0, quotesLoaded);
}

// Display quotes for a category - Enhanced with dynamic loading
function displayQuotes(category, start = 0, count = 6) {
    const categoryQuotes = getQuotesByCategory(category, { sortBy: 'popularity' });
    const quotesToShow = categoryQuotes.slice(start, start + count);
    
    if (start === 0) {
        quotesGrid.innerHTML = '';
    }

    quotesToShow.forEach((quote, index) => {
        const quoteElement = createQuoteElement(quote, start + index);
        quotesGrid.appendChild(quoteElement);
    });

    // Trigger animation
    setTimeout(() => {
        const newQuotes = quotesGrid.querySelectorAll('.quote-item:not(.animated)');
        newQuotes.forEach((quoteEl, index) => {
            setTimeout(() => {
                quoteEl.classList.add('animated');
                quoteEl.style.opacity = '1';
                quoteEl.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

// Create quote element - Enhanced with favorites and quote ID
function createQuoteElement(quote, index) {
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote-item';
    quoteDiv.setAttribute('data-quote-id', quote.id);
    quoteDiv.style.opacity = '0';
    quoteDiv.style.transform = 'translateY(20px)';
    quoteDiv.style.transition = 'all 0.6s ease';
    
    const isFavorite = favoriteQuotes.some(fav => fav.id === quote.id);
    
    // Escape quotes for HTML attributes
    const escapedText = quote.text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    const escapedAuthor = quote.author.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    
    quoteDiv.innerHTML = `
        <div class="quote-text">${quote.text}</div>
        <div class="quote-author">- ${quote.author}</div>
        ${quote.tags ? `<div class="quote-tags">${quote.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>` : ''}
        <div class="quote-actions">
            <button class="action-btn" onclick="openQuoteModal('${escapedText}', '${escapedAuthor}', ${quote.id})" title="विस्तार से देखें">
                <i class="fas fa-expand"></i>
            </button>
            <button class="action-btn" onclick="copyToClipboard('${escapedText} - ${escapedAuthor}')" title="कॉपी करें">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn" onclick="shareOnWhatsApp('${escapedText}', '${escapedAuthor}')" title="व्हाट्सएप पर शेयर करें">
                <i class="fab fa-whatsapp"></i>
            </button>
            <button class="action-btn favorite-btn ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(${quote.id})" title="पसंदीदा में जोड़ें" data-quote-id="${quote.id}">
                <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn" onclick="shareQuoteAdvanced('${escapedText}', '${escapedAuthor}')" title="और भी शेयर करें">
                <i class="fas fa-share-alt"></i>
            </button>
            ${quote.popularity ? `<div class="quote-popularity" title="लोकप्रियता: ${quote.popularity}%">
                <i class="fas fa-star"></i> ${quote.popularity}%
            </div>` : ''}
        </div>
    `;

    return quoteDiv;
}

// Load trending quotes - Enhanced with random generation
function loadTrendingQuotes() {
    console.log('🔥 Loading trending quotes...');
    
    // Add a small delay to ensure quotes are loaded
    setTimeout(() => {
        generateRandomTrendingQuotes();
        
        // Verify after generation
        setTimeout(() => {
            if (!verifyTrendingSection()) {
                console.warn('⚠️ Trending section verification failed, retrying...');
                forceRefreshTrending();
            }
        }, 1000);
        
        // Refresh trending quotes every 30 seconds
        setInterval(() => {
            generateRandomTrendingQuotes();
        }, 30000);
    }, 500);
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    quotesLoaded = 6;
    
    // Update active category
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Load quotes for selected category
    displayQuotes(category, 0, quotesLoaded);
    
    // Scroll to quotes section
    document.querySelector('.quotes-section').scrollIntoView({
        behavior: 'smooth'
    });
}

// Load more quotes
function loadMoreQuotes() {
    const categoryQuotes = quotes[currentCategory] || quotes.motivational;
    const remainingQuotes = categoryQuotes.length - quotesLoaded;
    
    if (remainingQuotes > 0) {
        const loadCount = Math.min(6, remainingQuotes);
        displayQuotes(currentCategory, quotesLoaded, loadCount);
        quotesLoaded += loadCount;
        
        // Hide load more button if no more quotes
        if (quotesLoaded >= categoryQuotes.length) {
            document.querySelector('.load-more').style.display = 'none';
        }
    }
}

// Get random quote - Enhanced with animation and category cycling
function getRandomQuote() {
    const allQuotes = Object.values(quotes).flat();
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    
    // Add loading animation
    const heroQuoteCard = document.getElementById('heroQuote');
    const heroQuoteText = document.getElementById('heroQuoteText');
    const heroQuoteAuthor = document.querySelector('#heroQuote .quote-author');
    
    // Add shake animation to button
    const randomBtn = event.target;
    randomBtn.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        randomBtn.style.animation = '';
    }, 500);
    
    // Fade out current quote
    heroQuoteCard.style.opacity = '0.5';
    heroQuoteCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        // Update quote content
        heroQuoteText.textContent = `"${randomQuote.text}"`;
        heroQuoteAuthor.textContent = `- ${randomQuote.author}`;
        
        // Fade in new quote with bounce effect
        heroQuoteCard.style.opacity = '1';
        heroQuoteCard.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            heroQuoteCard.style.transform = 'scale(1)';
        }, 200);
        
        // Show notification
        showNotification('नया कोट मिला! 🎉');
        
        // Track event for analytics
        trackEvent('random_quote_generated', {
            quote_text: randomQuote.text.substring(0, 50),
            author: randomQuote.author
        });
        
    }, 300);
    
    // Add sparkle effect
    createSparkleEffect(heroQuoteCard);
}

// Create sparkle effect for random quote
function createSparkleEffect(element) {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: absolute;
                pointer-events: none;
                font-size: 1.5rem;
                z-index: 1000;
                animation: sparkleAnimation 1s ease-out forwards;
            `;
            
            const rect = element.getBoundingClientRect();
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                document.body.removeChild(sparkle);
            }, 1000);
        }, i * 100);
    }
}

// Enhanced random quote for modal
function getRandomQuoteModal() {
    const allQuotes = Object.values(quotes).flat();
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    openQuoteModal(randomQuote.text, randomQuote.author);
    
    // Track event
    trackEvent('random_quote_modal', {
        quote_category: getCategoryByQuote(randomQuote.text)
    });
}

// Get category by quote text
function getCategoryByQuote(quoteText) {
    for (const [category, categoryQuotes] of Object.entries(quotes)) {
        if (categoryQuotes.some(quote => quote.text === quoteText)) {
            return category;
        }
    }
    return 'unknown';
}

// Daily quote rotation with random selection
function rotateDailyQuote() {
    const allQuotes = Object.values(quotes).flat();
    let currentIndex = Math.floor(Math.random() * allQuotes.length);
    
    // Function to update quote
    const updateQuote = () => {
        const quote = allQuotes[currentIndex];
        const heroQuoteText = document.getElementById('heroQuoteText');
        const heroQuoteAuthor = document.querySelector('#heroQuote .quote-author');
        
        if (heroQuoteText && heroQuoteAuthor) {
            // Smooth transition
            heroQuoteText.style.opacity = '0';
            
            setTimeout(() => {
                heroQuoteText.textContent = `"${quote.text}"`;
                heroQuoteAuthor.textContent = `- ${quote.author}`;
                heroQuoteText.style.opacity = '1';
            }, 300);
        }
        
        currentIndex = (currentIndex + 1) % allQuotes.length;
    };
    
    // Update every 8 seconds
    setInterval(updateQuote, 8000);
}

// Random quote with category preference
function getRandomQuoteByCategory(preferredCategory = null) {
    let quotesToChooseFrom;
    
    if (preferredCategory && quotes[preferredCategory]) {
        // 70% chance to pick from preferred category, 30% from all
        quotesToChooseFrom = Math.random() < 0.7 ? 
            quotes[preferredCategory] : 
            Object.values(quotes).flat();
    } else {
        quotesToChooseFrom = Object.values(quotes).flat();
    }
    
    const randomQuote = quotesToChooseFrom[Math.floor(Math.random() * quotesToChooseFrom.length)];
    return randomQuote;
}

// Auto-generate random quotes for trending section
function generateRandomTrendingQuotes() {
    console.log('🔥 Generating trending quotes...');
    
    const trendingContainer = document.getElementById('trendingQuotes');
    if (!trendingContainer) {
        console.error('Trending container not found');
        return;
    }
    
    // Check if quotes are loaded
    if (!quotes || Object.keys(quotes).length === 0) {
        console.error('No quotes available for trending section');
        trendingContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">कोट्स लोड हो रहे हैं...</div>';
        return;
    }
    
    const randomQuotes = [];
    const allQuotes = Object.values(quotes).flat();
    
    console.log(`Total quotes available: ${allQuotes.length}`);
    
    // Check if we have enough quotes
    if (allQuotes.length === 0) {
        console.error('No quotes found in the data');
        trendingContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">कोई कोट्स उपलब्ध नहीं हैं।</div>';
        return;
    }
    
    // Get 4 random quotes
    const quotesToShow = Math.min(4, allQuotes.length);
    while (randomQuotes.length < quotesToShow) {
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        if (!randomQuotes.some(q => q.text === randomQuote.text)) {
            randomQuotes.push(randomQuote);
        }
    }
    
    console.log(`Selected ${randomQuotes.length} trending quotes`);
    
    trendingContainer.innerHTML = '';
    randomQuotes.forEach((quote, index) => {
        console.log(`Adding trending quote ${index + 1}:`, quote.text.substring(0, 50) + '...');
        
        const trendingElement = document.createElement('div');
        trendingElement.className = 'trending-item';
        trendingElement.innerHTML = `
            <div class="quote-text">${quote.text}</div>
            <div class="quote-author">- ${quote.author}</div>
            <div class="trending-actions">
                <button class="action-btn trending-copy" data-quote-id="${index}" title="कॉपी करें">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn trending-whatsapp" data-quote-id="${index}" title="व्हाट्सएप पर शेयर करें">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="action-btn trending-expand" data-quote-id="${index}" title="विस्तार से देखें">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;
        
        // Store quote data for later use
        trendingElement.dataset.quoteText = quote.text;
        trendingElement.dataset.quoteAuthor = quote.author;
        trendingElement.dataset.quoteId = quote.id || index;
        
        trendingContainer.appendChild(trendingElement);
    });
    
    // Add event listeners for trending actions
    setupTrendingActionListeners();
    
    console.log('✅ Trending quotes generated and listeners attached');
}

// Verify trending section functionality
function verifyTrendingSection() {
    const trendingContainer = document.getElementById('trendingQuotes');
    if (!trendingContainer) {
        console.error('❌ Trending container not found');
        return false;
    }
    
    const trendingItems = trendingContainer.querySelectorAll('.trending-item');
    if (trendingItems.length === 0) {
        console.error('❌ No trending items found');
        return false;
    }
    
    const actionButtons = trendingContainer.querySelectorAll('.action-btn');
    if (actionButtons.length === 0) {
        console.error('❌ No action buttons found');
        return false;
    }
    
    console.log(`✅ Trending section verified: ${trendingItems.length} items, ${actionButtons.length} buttons`);
    return true;
}

// Force refresh trending section if needed
function forceRefreshTrending() {
    console.log('🔄 Force refreshing trending section...');
    
    // Clear existing content
    const trendingContainer = document.getElementById('trendingQuotes');
    if (trendingContainer) {
        trendingContainer.innerHTML = '';
    }
    
    // Regenerate after a short delay
    setTimeout(() => {
        generateRandomTrendingQuotes();
    }, 100);
}

// Setup event listeners for trending actions
function setupTrendingActionListeners() {
    const trendingContainer = document.getElementById('trendingQuotes');
    if (!trendingContainer) {
        console.error('Trending container not found');
        return;
    }
    
    console.log('Setting up trending action listeners...');
    
    // Copy button listeners
    const copyButtons = trendingContainer.querySelectorAll('.trending-copy');
    console.log(`Found ${copyButtons.length} copy buttons`);
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Copy button clicked');
            const trendingItem = this.closest('.trending-item');
            const text = trendingItem.dataset.quoteText;
            const author = trendingItem.dataset.quoteAuthor;
            console.log('Copying:', text, author);
            copyToClipboard(`${text} - ${author}`);
        });
    });
    
    // WhatsApp share button listeners
    const whatsappButtons = trendingContainer.querySelectorAll('.trending-whatsapp');
    console.log(`Found ${whatsappButtons.length} WhatsApp buttons`);
    
    whatsappButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('WhatsApp button clicked');
            const trendingItem = this.closest('.trending-item');
            const text = trendingItem.dataset.quoteText;
            const author = trendingItem.dataset.quoteAuthor;
            console.log('Sharing on WhatsApp:', text, author);
            shareOnWhatsApp(text, author);
        });
    });
    
    // Expand button listeners
    const expandButtons = trendingContainer.querySelectorAll('.trending-expand');
    console.log(`Found ${expandButtons.length} expand buttons`);
    
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Expand button clicked');
            const trendingItem = this.closest('.trending-item');
            const text = trendingItem.dataset.quoteText;
            const author = trendingItem.dataset.quoteAuthor;
            const quoteId = trendingItem.dataset.quoteId;
            console.log('Opening modal:', text, author, quoteId);
            openQuoteModal(text, author, quoteId);
        });
    });
    
    console.log('Trending action listeners setup complete');
}

// Open quote modal
// Enhanced modal function
function openQuoteModal(text, author, quoteId = null) {
    console.log('Opening modal:', text, author, quoteId);
    
    try {
        if (modalQuoteText && modalAuthor && modal) {
            modalQuoteText.textContent = text;
            modalAuthor.textContent = `- ${author}`;
            
            // Store quote ID for modal actions
            if (quoteId) {
                modal.setAttribute('data-quote-id', quoteId);
            }
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            showNotification('कोट विस्तार से देखने के लिए खुला! 👁️');
        } else {
            console.error('Modal elements not found');
            showNotification('मोडल खोलने में समस्या हुई!', 'error');
        }
    } catch (err) {
        console.error('Modal open error:', err);
        showNotification('मोडल खोलने में समस्या हुई!', 'error');
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Copy quote to clipboard
function copyQuote() {
    const text = modalQuoteText.textContent;
    const author = modalAuthor.textContent;
    copyToClipboard(`${text} ${author}`);
}

// Enhanced Copy function with better error handling
function copyToClipboard(text) {
    console.log('Attempting to copy:', text);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copy successful via clipboard API');
            showNotification('कॉपी हो गया! 📋');
        }).catch(err => {
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        console.log('Using fallback copy method');
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy function
function fallbackCopyToClipboard(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('Fallback copy successful');
            showNotification('कॉपी हो गया! 📋');
        } else {
            console.error('Fallback copy failed');
            showNotification('कॉपी करने में समस्या हुई!', 'error');
        }
    } catch (err) {
        console.error('Fallback copy error:', err);
        showNotification('कॉपी करने में समस्या हुई!', 'error');
    }
}

// Enhanced WhatsApp share function
function shareOnWhatsApp(text, author) {
    console.log('Sharing on WhatsApp:', text, author);
    
    try {
        const message = encodeURIComponent(`${text}\n\n- ${author}\n\nऔर भी बेहतरीन कोट्स के लिए: https://bharatkeshabd.in`);
        const url = `https://wa.me/?text=${message}`;
        console.log('WhatsApp URL:', url);
        
        window.open(url, '_blank');
        showNotification('व्हाट्सएप पर शेयर करने के लिए खुला! 📱');
    } catch (err) {
        console.error('WhatsApp share error:', err);
        showNotification('व्हाट्सएप शेयर करने में समस्या हुई!', 'error');
    }
}

// Share on Twitter
function shareQuoteTwitter() {
    const text = modalQuoteText.textContent;
    const author = modalAuthor.textContent;
    const message = encodeURIComponent(`${text} ${author}\n\n#BharatKeShabd #HindiQuotes #Motivation`);
    window.open(`https://twitter.com/intent/tweet?text=${message}&url=https://bharatkeshabd.in`, '_blank');
}

// Share quote function
function shareQuote() {
    if (navigator.share) {
        navigator.share({
            title: 'BharatKeShabd.in',
            text: document.getElementById('heroQuoteText').textContent,
            url: window.location.href
        });
    } else {
        copyToClipboard(document.getElementById('heroQuoteText').textContent);
    }
}

// Like quote
function likeQuote(button) {
    button.classList.toggle('liked');
    const icon = button.querySelector('i');
    if (button.classList.contains('liked')) {
        icon.style.color = '#e74c3c';
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    } else {
        icon.style.color = '';
    }
}

// Newsletter subscription
function subscribeNewsletter() {
    const email = document.getElementById('emailInput').value;
    if (email && email.includes('@')) {
        // In a real application, you would send this to your backend
        showNotification('धन्यवाद! आप सफलतापूर्वक सब्सक्राइब हो गए हैं। 🎉');
        document.getElementById('emailInput').value = '';
    } else {
        showNotification('कृपया एक वैध ईमेल एड्रेस डालें। ❌');
    }
}

// Update statistics with animation - Now uses dynamic data
function updateStatistics() {
    const totalQuotes = quotesMetadata ? quotesMetadata.total_quotes : Object.values(quotes).flat().length;
    const dailyViews = Math.floor(Math.random() * 500) + 800; // Simulated
    const happyUsers = Math.floor(Math.random() * 1000) + 4500; // Simulated
    
    animateCounter('totalQuotes', totalQuotes, '+');
    animateCounter('dailyViews', dailyViews, '+');
    animateCounter('happyUsers', happyUsers, '+');
}

// Enhanced quote favorite system with ID-based tracking
favoriteQuotes = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');

function toggleFavorite(quoteId) {
    // Find the quote by ID
    const quote = findQuoteById(quoteId);
    if (!quote) {
        showNotification('कोट नहीं मिला!', 'error');
        return;
    }
    
    const index = favoriteQuotes.findIndex(fav => fav.id === quoteId);
    
    if (index > -1) {
        favoriteQuotes.splice(index, 1);
        showNotification('पसंदीदा से हटाया गया 💔');
    } else {
        favoriteQuotes.push(quote);
        showNotification('पसंदीदा में जोड़ा गया ❤️');
    }
    
    localStorage.setItem('favoriteQuotes', JSON.stringify(favoriteQuotes));
    updateFavoriteButtons();
}

// Find quote by ID across all categories
function findQuoteById(quoteId) {
    for (const [category, categoryQuotes] of Object.entries(quotes)) {
        const quote = categoryQuotes.find(q => q.id === quoteId);
        if (quote) return quote;
    }
    return null;
}

// Update favorite button states - Enhanced for ID-based system
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const quoteId = parseInt(btn.dataset.quoteId);
        const isFavorite = favoriteQuotes.some(fav => fav.id === quoteId);
        btn.innerHTML = isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        btn.classList.toggle('favorited', isFavorite);
    });
}

// API-like functions for external integrations
const QuotesAPI = {
    // Get all quotes
    getAllQuotes: () => Object.values(quotes).flat(),
    
    // Get quotes by category
    getByCategory: (category, options = {}) => getQuotesByCategory(category, options),
    
    // Search quotes
    search: (term, options = {}) => searchQuotes(term, options),
    
    // Get random quote
    getRandom: (category = null) => {
        if (category && quotes[category]) {
            const categoryQuotes = quotes[category];
            return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
        }
        const allQuotes = Object.values(quotes).flat();
        return allQuotes[Math.floor(Math.random() * allQuotes.length)];
    },
    
    // Get quote by ID
    getById: (id) => findQuoteById(id),
    
    // Get popular quotes
    getPopular: (limit = 10) => {
        const allQuotes = Object.values(quotes).flat();
        return allQuotes
            .filter(q => q.popularity)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    },
    
    // Get metadata
    getMetadata: () => quotesMetadata
};

// Make API available globally for debugging and external use
window.QuotesAPI = QuotesAPI;

// Animate counter numbers
function animateCounter(elementId, finalValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentValue = 0;
    const increment = finalValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue) + suffix;
    }, 30);
}

// Show welcome message for new visitors
function showWelcomeMessage() {
    if (!localStorage.getItem('bharatKeShabdVisited')) {
        setTimeout(() => {
            showNotification('BharatKeShabd.in में आपका स्वागत है! 🙏 Space दबाकर रैंडम कोट पाएं।');
            localStorage.setItem('bharatKeShabdVisited', 'true');
        }, 2000);
    }
}

// Enhanced quote sharing with more platforms
function shareQuoteAdvanced(text, author) {
    const quoteFull = `${text}\n\n- ${author}\n\nऔर भी बेहतरीन कोट्स: https://bharatkeshabd.in`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BharatKeShabd.in',
            text: quoteFull,
            url: 'https://bharatkeshabd.in'
        }).catch(console.error);
    } else {
        // Fallback sharing options
        const shareMenu = document.createElement('div');
        shareMenu.className = 'share-menu';
        shareMenu.innerHTML = `
            <div class="share-menu-content">
                <h4>शेयर करें</h4>
                <div class="share-options">
                    <button onclick="shareOnWhatsApp('${text}', '${author}')" class="share-btn whatsapp">
                        <i class="fab fa-whatsapp"></i> व्हाट्सएप
                    </button>
                    <button onclick="shareOnFacebook('${text}', '${author}')" class="share-btn facebook">
                        <i class="fab fa-facebook"></i> फेसबुक
                    </button>
                    <button onclick="shareOnTwitter('${text}', '${author}')" class="share-btn twitter">
                        <i class="fab fa-twitter"></i> ट्विटर
                    </button>
                    <button onclick="copyToClipboard('${quoteFull}')" class="share-btn copy">
                        <i class="fas fa-copy"></i> कॉपी
                    </button>
                </div>
                <button onclick="closeShareMenu()" class="close-share">बंद करें</button>
            </div>
        `;
        document.body.appendChild(shareMenu);
    }
}

// Share on Facebook
function shareOnFacebook(text, author) {
    const url = encodeURIComponent('https://bharatkeshabd.in');
    const quote = encodeURIComponent(`${text} - ${author}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
}

// Share on Twitter  
function shareOnTwitter(text, author) {
    const tweet = encodeURIComponent(`${text}\n\n- ${author}\n\n#BharatKeShabd #HindiQuotes #Motivation`);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}&url=https://bharatkeshabd.in`, '_blank');
}

// Close share menu
function closeShareMenu() {
    const shareMenu = document.querySelector('.share-menu');
    if (shareMenu) {
        shareMenu.remove();
    }
}

// Load favorites from localStorage on startup
function initializeFavorites() {
    favoriteQuotes = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');
}

// Legacy toggleFavorite function for backward compatibility
function toggleFavorite(textOrId, author = null) {
    // Check if first parameter is an ID (number) or text (string)
    if (typeof textOrId === 'number') {
        // New ID-based system
        return toggleFavoriteById(textOrId);
    } else {
        // Legacy text-based system - convert to ID-based
        const quote = Object.values(quotes).flat().find(q => q.text === textOrId && q.author === author);
        if (quote) {
            return toggleFavoriteById(quote.id);
        }
    }
}

// New ID-based toggle function
function toggleFavoriteById(quoteId) {
    const quote = findQuoteById(quoteId);
    if (!quote) {
        showNotification('कोट नहीं मिला!', 'error');
        return;
    }
    
    const index = favoriteQuotes.findIndex(fav => fav.id === quoteId);
    
    if (index > -1) {
        favoriteQuotes.splice(index, 1);
        showNotification('पसंदीदा से हटाया गया 💔');
    } else {
        favoriteQuotes.push(quote);
        showNotification('पसंदीदा में जोड़ा गया ❤️');
    }
    
    localStorage.setItem('favoriteQuotes', JSON.stringify(favoriteQuotes));
    updateFavoriteButtons();
}

// Update favorite button states
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const text = btn.dataset.text;
        const isFavorite = favoriteQuotes.some(fav => fav.text === text);
        btn.innerHTML = isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        btn.classList.toggle('favorited', isFavorite);
    });
}

// Get user's favorite quotes
function showFavoriteQuotes() {
    if (favoriteQuotes.length === 0) {
        showNotification('अभी तक कोई पसंदीदा कोट नहीं है! ❤️ बटन दबाकर कोट्स को पसंदीदा में जोड़ें।');
        return;
    }
    
    const favoriteModal = document.createElement('div');
    favoriteModal.className = 'modal';
    favoriteModal.id = 'favoriteModal';
    favoriteModal.innerHTML = `
        <div class="modal-content favorite-modal-content">
            <span class="close" onclick="document.getElementById('favoriteModal').remove()">&times;</span>
            <h2>आपके पसंदीदा कोट्स ❤️</h2>
            <div class="favorite-quotes-grid">
                ${favoriteQuotes.map(quote => `
                    <div class="favorite-quote-item">
                        <p>"${quote.text}"</p>
                        <div class="quote-author">- ${quote.author}</div>
                        <div class="favorite-actions">
                            <button onclick="shareOnWhatsApp('${quote.text}', '${quote.author}')" class="btn-success">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button onclick="copyToClipboard('${quote.text} - ${quote.author}')" class="btn-secondary">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button onclick="toggleFavorite('${quote.text}', '${quote.author}')" class="btn-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(favoriteModal);
    favoriteModal.style.display = 'block';
}

// Show notification function
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 3s forwards;
        max-width: 300px;
        font-family: inherit;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3500);
}

// Setup scroll to top functionality
function setupScrollToTop() {
    // Create scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        font-size: 1.2rem;
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Analytics tracking function
function trackEvent(eventName, properties = {}) {
    // This would integrate with Google Analytics or other analytics services
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Console log for development
    console.log('Event tracked:', eventName, properties);
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes sparkleAnimation {
        0% { opacity: 1; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
        100% { opacity: 0; transform: scale(1.5) rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .scroll-to-top:hover {
        background: var(--secondary-color) !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(notificationStyles);

/* ...existing code... */
