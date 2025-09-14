// Global variables
let currentTrackingData = null;
// Active Firestore collection for tracking docs (matches your console screenshot)
const COLLECTION_NAME = 'couriers';

// DOM Elements
const trackingForm = document.getElementById('trackingId');
const trackBtn = document.getElementById('trackBtn');
const newSearchBtn = document.getElementById('newSearchBtn');
const trackingResults = document.getElementById('trackingResults');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorModal = document.getElementById('errorModal');
const contactForm = document.getElementById('contactForm');

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle - simplified approach
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    console.log('Script loaded');
    console.log('Hamburger element:', hamburger);
    console.log('Mobile menu element:', mobileMenu);
    
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked!');
            
            if (mobileMenu) {
                const isActive = mobileMenu.classList.contains('active');
                console.log('Current active state:', isActive);
                
                if (isActive) {
                    mobileMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    console.log('Menu closed');
                } else {
                    mobileMenu.classList.add('active');
                    hamburger.classList.add('active');
                    console.log('Menu opened');
                }
            }
        });
    } else {
        console.error('Hamburger button not found!');
    }
    
    if (!mobileMenu) {
        console.error('Mobile menu not found!');
    }

    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && hamburger) {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Initialize tracking functionality if on homepage
    if (trackBtn) {
        initializeTracking();
    }

    // Initialize contact form if on contact page
    if (contactForm) {
        initializeContactForm();
    }

    // Close modal functionality
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', hideError);
    }

    // Close modal when clicking outside
    if (errorModal) {
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                hideError();
            }
        });
    }
});

// Tracking functionality
function initializeTracking() {
    if (!trackBtn || !trackingForm) return;

    trackBtn.addEventListener('click', handleTrackingSearch);
    trackingForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTrackingSearch();
        }
    });

    if (newSearchBtn) {
        newSearchBtn.addEventListener('click', resetSearch);
    }
}

async function handleTrackingSearch() {
    const trackingId = trackingForm.value.trim();
    
    if (!trackingId) {
        showError('Please enter a tracking ID');
        return;
    }

    // Validate tracking ID format (basic validation)
    if (trackingId.length < 6) {
        showError('Please enter a valid tracking ID');
        return;
    }

    // Clear any previous error states
    hideError();
    
    showLoading();
    
    // Add delay to simulate loading
    setTimeout(async () => {
        try {
            console.log('Starting to fetch tracking data for:', trackingId);
            const trackingData = await fetchTrackingData(trackingId);
            console.log('Tracking data received:', trackingData);
            
            hideLoading();
            
            if (trackingData) {
                console.log('Displaying tracking results...');
                displayTrackingResults(trackingData);
            } else {
                console.log('No tracking data found, showing error');
                showError('Tracking ID not found. Please check your tracking number and try again.');
            }
        } catch (error) {
            console.error('Caught error in handleTrackingSearch:', error);
            hideLoading();
            if (error && (error.code === 'permission-denied' || /insufficient permissions/i.test(error.message))) {
                const msg = `Access denied by Firestore rules for the '${COLLECTION_NAME}' collection.\n\nFix one of these: \n1) Add rule: match /${COLLECTION_NAME}/{id} { allow get: if id.matches('([0-9]{6,20})|(SKY[0-9A-Z]{4,20})'); allow list, write: if false; } \n2) Rename collection in Firestore to match your rules. \n3) (Dev only) Temporarily: allow read: if true; (then tighten).`;
                showError(msg);
            } else {
                showError('Unable to fetch tracking information. Please try again later.');
            }
        }
    }, 1000);
}

async function fetchTrackingData(trackingId) {
    console.log('[fetchTrackingData] Request:', trackingId);

    // Allow demo fallbacks for specific sample IDs when Firestore empty
    const demoLookup = getDemoTrackingData(trackingId);
    
    try {
        // Wait for auth if available
    // Auth wait skipped (public read rules). If you later require auth, re-enable.
        if (typeof firebase === 'undefined' || !window.db || !window.db.collection) {
            if (demoLookup) {
                console.info('[fetchTrackingData] Firebase not ready. Serving demo data.');
                return demoLookup; 
            }
            throw new Error('firebase_unavailable');
        }

        const colRef = window.db.collection(COLLECTION_NAME);
        const docRef = colRef.doc(trackingId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.warn('[fetchTrackingData] No document with that ID. (No fallback query to preserve security)');
            if (demoLookup) return demoLookup;
            return null;
        }

        const data = normalizeFirestoreData(doc.data() || {});
        console.log('[fetchTrackingData] Normalized payload:', data);
        return data;
    } catch (error) {
    console.error('[fetchTrackingData] Error:', error, 'code:', error.code);
        if (error.message === 'firebase_unavailable' && demoLookup) {
            return demoLookup;
        }
        throw error;
    }
}

function latestStatus(data){
    if(Array.isArray(data.history) && data.history.length){
        return data.history[data.history.length-1].status;
    }
    if(Array.isArray(data.updates) && data.updates.length){
        return data.updates[data.updates.length-1].status;
    }
    return null;
}
function currentLocationFromHistory(data){
    if(Array.isArray(data.history) && data.history.length){
        return data.history[data.history.length-1].location;
    }
    return null;
}
function lastUpdateFromHistory(data){
    if(Array.isArray(data.history) && data.history.length){
        return data.history[data.history.length-1].timestamp || data.history[data.history.length-1].date;
    }
    return null;
}

// Demo data generator for offline / testing
function getDemoTrackingData(id){
    const samples = {
        'SKY1001': {
            trackingId:'SKY1001', status:'in-transit', currentLocation:'Delhi Hub', lastUpdated:new Date().toISOString(), recipient:'Amit Verma', destination:'Mumbai', estimatedDelivery:addDays(2),
            history:[
                {timestamp:addDays(-3), status:'picked-up', location:'Ranchi', isCurrent:false},
                {timestamp:addDays(-2), status:'in-transit', location:'Patna Facility', isCurrent:false},
                {timestamp:addDays(-1), status:'in-transit', location:'Delhi Hub', isCurrent:true}
            ]
        },
        'SKY2045': {
            trackingId:'SKY2045', status:'out-for-delivery', currentLocation:'Bangalore Local Center', lastUpdated:new Date().toISOString(), recipient:'Priya Nair', destination:'Bangalore', estimatedDelivery:addDays(0),
            history:[
                {timestamp:addDays(-4), status:'picked-up', location:'Chennai', isCurrent:false},
                {timestamp:addDays(-2), status:'in-transit', location:'Bangalore Hub', isCurrent:false},
                {timestamp:addDays(-1), status:'in-transit', location:'Bangalore Local Center', isCurrent:true}
            ]
        },
        'SKY8899': {
            trackingId:'SKY8899', status:'delivered', currentLocation:'Kolkata', lastUpdated:addDays(-1), recipient:'Rahul Das', destination:'Kolkata', estimatedDelivery:addDays(-1),
            history:[
                {timestamp:addDays(-5), status:'picked-up', location:'Jaipur', isCurrent:false},
                {timestamp:addDays(-3), status:'in-transit', location:'Lucknow', isCurrent:false},
                {timestamp:addDays(-2), status:'out-for-delivery', location:'Kolkata Facility', isCurrent:false},
                {timestamp:addDays(-1), status:'delivered', location:'Kolkata', isCurrent:true}
            ]
        }
    };
    return samples[id] || null;
}

function addDays(d){
    const date = new Date();
    date.setDate(date.getDate()+Number(d));
    return date.toISOString();
}

function transformFirestoreHistory(data) {
    // If there's a history array in the document, use it
    const rawHistory = data.history || data.History; // handle possible capitalized field
    if (rawHistory && Array.isArray(rawHistory)) {
        return rawHistory.map((item, index) => {
            const ts = item.timestamp || item.date;
            const iso = firestoreTimestampToISO(ts);
            const rawStatus = (item.status || 'unknown').toString().trim();
            const status = normalizeStatus(rawStatus);
            return {
                date: iso,
                timestamp: iso,
                status,
                location: item.location || 'Unknown',
                isCurrent: index === rawHistory.length - 1
            };
        });
    }
    
    // Otherwise, create a single history entry from the main document data
    return [{
        date: data.lastUpdate || data.timestamp || new Date().toISOString(),
        status: data.status || 'Unknown',
        location: data.location || 'Unknown',
        isCurrent: true
    }];
}

// Normalize root-level doc into unified shape our UI expects
function normalizeFirestoreData(raw){
    const history = transformFirestoreHistory(raw);
    const last = history[history.length-1] || {};
    const rootStatus = raw.status || last.status || 'pending';
    const status = normalizeStatus(rootStatus);
    const normalizedLastUpdate = firestoreTimestampToISO(raw.lastUpdate || raw.lastupdate || raw.last_updated || last.timestamp || raw.timestamp);
    return {
        trackingId: raw.trackingId || raw.id || 'UNKNOWN',
        status,
        currentLocation: raw.location || last.location || 'Processing Center',
        lastUpdated: normalizedLastUpdate,
        recipient: raw.recipient || raw.customer || 'Customer',
        destination: raw.destination || raw.to || 'Unknown',
        estimatedDelivery: raw.estimatedDelivery || null,
        history
    };
}

function normalizeStatus(s){
    return s.toLowerCase().replace(/\s+/g,'-');
}

// Convert Firestore Timestamp / Date / string to ISO string
function firestoreTimestampToISO(val){
    if(!val) return new Date().toISOString();
    // Firestore Timestamp object
    if (typeof val === 'object') {
        if (typeof val.toDate === 'function') {
            try { return val.toDate().toISOString(); } catch(e) {}
        }
        // Seconds/nanoseconds shape
        if (typeof val.seconds === 'number') {
            try { return new Date(val.seconds * 1000 + (val.nanoseconds||0)/1e6).toISOString(); } catch(e) {}
        }
    }
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') {
        const parsed = Date.parse(val);
        if (!isNaN(parsed)) return new Date(parsed).toISOString();
    }
    return new Date().toISOString();
}


function displayTrackingResults(data) {
    currentTrackingData = data;
    
    // Hide any previous error modals
    hideError();
    
    // Update package details
    document.getElementById('resultTrackingId').textContent = data.trackingId;
    document.getElementById('currentStatus').textContent = data.status.replace('-', ' ').toUpperCase();
    document.getElementById('currentStatus').className = `value status ${data.status}`;
    document.getElementById('currentLocation').textContent = data.currentLocation;
    document.getElementById('lastUpdated').textContent = formatLastUpdated(data.lastUpdated);
    
    // Update additional fields if they exist
    if (document.getElementById('recipient')) {
        document.getElementById('recipient').textContent = data.recipient || 'N/A';
    }
    if (document.getElementById('destination')) {
        document.getElementById('destination').textContent = data.destination || 'N/A';
    }
    if (document.getElementById('estimatedDelivery')) {
        const deliveryDate = data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString() : 'N/A';
        document.getElementById('estimatedDelivery').textContent = deliveryDate;
    }
    
    // Load package image
    loadPackageImage(data.trackingId);
    
    // Ensure hero remains (do not hard-hide entire hero if redesign uses panel). Optionally scroll to results.
    if (trackingResults) {
        trackingResults.classList.remove('hidden');
        trackingResults.style.display = 'block';
        trackingResults.scrollIntoView({behavior:'smooth', block:'start'});
    }
    
}

// Package Image Loading Functions
async function loadPackageImage(trackingId) {
    const packageImageCard = document.getElementById('packageImageCard');
    const imageLoading = document.getElementById('imageLoading');
    const packageImage = document.getElementById('packageImage');
    const imageError = document.getElementById('imageError');
    
    if (!packageImageCard || !imageLoading || !packageImage || !imageError) {
        console.warn('Image display elements not found');
        return;
    }
    
    // Show the image card and loading state
    packageImageCard.classList.remove('hidden');
    imageLoading.classList.remove('hidden');
    packageImage.classList.add('hidden');
    imageError.classList.add('hidden');
    
    try {
        const imageUrl = await fetchPackageImageUrl(trackingId);
        
        if (imageUrl) {
            // Load the image
            packageImage.src = imageUrl;
            packageImage.onload = () => {
                imageLoading.classList.add('hidden');
                packageImage.classList.remove('hidden');
                console.log('Package image loaded successfully');
            };
            packageImage.onerror = () => {
                showImageError();
            };
        } else {
            showImageError();
        }
    } catch (error) {
        console.error('Error loading package image:', error);
        showImageError();
    }
}

async function fetchPackageImageUrl(trackingId) {
    try {
        // Check if Firebase Storage is available
        if (typeof window.storage === 'undefined' || !window.storage) {
            console.warn('Firebase Storage not available');
            return null;
        }
        
        // Create storage reference - using the pattern: courier_images/{trackingId}_{timestamp}.jpg
        // Based on your screenshot, the image naming pattern appears to be trackingId_timestamp.jpg
        const storageRef = window.storage.ref();
        const imagesRef = storageRef.child('courier_images');
        
        // List all files in the courier_images folder to find the one matching our tracking ID
        const listResult = await imagesRef.listAll();
        
        // Find the image file that starts with our tracking ID
        const matchingItem = listResult.items.find(item => 
            item.name.startsWith(trackingId) && 
            (item.name.toLowerCase().endsWith('.jpg') || 
             item.name.toLowerCase().endsWith('.jpeg') || 
             item.name.toLowerCase().endsWith('.png'))
        );
        
        if (matchingItem) {
            // Get the download URL
            const downloadUrl = await matchingItem.getDownloadURL();
            console.log('Found package image:', matchingItem.name);
            return downloadUrl;
        } else {
            console.log('No image found for tracking ID:', trackingId);
            return null;
        }
        
    } catch (error) {
        console.error('Error fetching package image URL:', error);
        return null;
    }
}

function showImageError() {
    const imageLoading = document.getElementById('imageLoading');
    const packageImage = document.getElementById('packageImage');
    const imageError = document.getElementById('imageError');
    
    if (imageLoading && packageImage && imageError) {
        imageLoading.classList.add('hidden');
        packageImage.classList.add('hidden');
        imageError.classList.remove('hidden');
    }
}

function formatTimelineDate(val){
    try { return new Date(val).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});} catch(e){ return val; }
}


function resetSearch() {
    // Reset form
    trackingForm.value = '';
    currentTrackingData = null;
    
    // Show form and hide results
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.display = 'block';
    }
    const trackingFormContainer = document.querySelector('.tracking-form-container');
    if (trackingFormContainer) {
        trackingFormContainer.style.display = 'block';
    }
    
    // Hide image card and reset image states
    const packageImageCard = document.getElementById('packageImageCard');
    if (packageImageCard) {
        packageImageCard.classList.add('hidden');
    }
    
    trackingResults.classList.add('hidden');
}

// Contact form functionality
function initializeContactForm() {
    contactForm.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        subject: formData.get('subject'),
        trackingId: formData.get('trackingId') || '',
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on',
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
        showContactError('Please fill in all required fields.');
        return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        await submitContactForm(contactData);
        showContactSuccess();
        contactForm.reset();
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showContactError('Failed to send message. Please try again or contact us directly.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function submitContactForm(data) {
    try {
        // Check if Firebase is available
        if (typeof db !== 'undefined') {
            // Store in Firestore
            await db.collection('contact-messages').add(data);
        } else {
            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Contact form data (demo):', data);
        }
    } catch (error) {
        console.error('Error saving contact message:', error);
        throw error;
    }
}

function showContactSuccess() {
    const successElement = document.getElementById('formSuccess');
    const errorElement = document.getElementById('formError');
    
    if (successElement && errorElement) {
        errorElement.classList.add('hidden');
        successElement.classList.remove('hidden');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 5000);
    }
}

function showContactError(message) {
    const successElement = document.getElementById('formSuccess');
    const errorElement = document.getElementById('formError');
    const errorText = document.getElementById('errorText');
    
    if (successElement && errorElement && errorText) {
        successElement.classList.add('hidden');
        errorText.textContent = message;
        errorElement.classList.remove('hidden');
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

// Utility functions
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage && errorModal) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    }
}

function hideError() {
    if (errorModal) {
        errorModal.classList.add('hidden');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatLastUpdated(val) {
    // Accept Firestore Timestamp, Date, ISO, or already formatted string
    try {
        if (!val) return 'N/A';
        // Firestore Timestamp object
        if (typeof val === 'object' && typeof val.toDate === 'function') {
            val = val.toDate();
        }
        if (typeof val === 'object' && typeof val.seconds === 'number') {
            val = new Date(val.seconds * 1000 + (val.nanoseconds||0)/1e6);
        }
        if (typeof val === 'string') {
            // If already a readable Firestore console string (contains UTC or GMT) keep it
            if (/UTC|GMT|AM|PM|\bat\b/i.test(val) && isNaN(Date.parse(val)) ) return val;
            const parsed = Date.parse(val);
            if (!isNaN(parsed)) val = new Date(parsed);
        }
        if (val instanceof Date) {
            return val.toLocaleString('en-US', {
                year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true
            });
        }
    } catch(e) {
        return 'N/A';
    }
    return 'N/A';
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'picked-up': 'Picked Up',
        'in-transit': 'In Transit',
        'out-for-delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'exception': 'Exception',
        'returned': 'Returned'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchTrackingData,
        getDemoTrackingData,
        formatDate,
        formatStatus
    };
}
