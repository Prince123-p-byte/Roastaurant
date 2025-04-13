// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userActions = document.getElementById('user-actions');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const accountBtn = document.getElementById('account-btn');
const usernameDisplay = document.getElementById('username-display');
const authForms = document.getElementById('auth-forms');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const appContent = document.getElementById('app-content');
const newPostForm = document.getElementById('new-post-form');
const postContent = document.getElementById('post-content');
const mediaPreview = document.getElementById('media-preview');
const addPhoto = document.getElementById('add-photo');
const addVideo = document.getElementById('add-video');
const postsContainer = document.getElementById('posts-container');
const postModal = document.getElementById('post-modal');
const postModalContent = document.getElementById('post-modal-content');
const closeModals = document.querySelectorAll('.close-modal');
const roastsTab = document.getElementById('roasts-tab');
const complimentsTab = document.getElementById('compliments-tab');
const roastsCount = document.getElementById('roasts-count');
const complimentsCount = document.getElementById('compliments-count');
const roastForm = document.getElementById('roast-form');
const complimentForm = document.getElementById('compliment-form');
const roastContent = document.getElementById('roast-content');
const complimentContent = document.getElementById('compliment-content');
const roastsList = document.getElementById('roasts-list');
const complimentsList = document.getElementById('compliments-list');
const tabs = document.querySelectorAll('.tab');
const tabIndicator = document.getElementById('tab-indicator');
const accountModal = document.getElementById('account-modal');
const accountForm = document.getElementById('account-form');
const editUsername = document.getElementById('edit-username');
const editPassword = document.getElementById('edit-password');
const deleteAccountBtn = document.getElementById('delete-account');
const mediaModal = document.getElementById('media-modal');
const mediaUpload = document.getElementById('media-upload');
const uploadBtn = document.getElementById('upload-btn');
const mediaUploadPreview = document.getElementById('media-upload-preview');
const confirmMediaBtn = document.getElementById('confirm-media');
const modalOverlay = document.querySelector('.modal-overlay');

// App State
let currentUser = null;
let posts = [];
let currentPostId = null;
let currentMedia = null;
let mediaContext = null; // 'post' or 'comment'

// Initialize the app
function init() {
    // Load data from localStorage
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    posts = JSON.parse(localStorage.getItem('roastme-posts')) || [];
    
    // Check if user is logged in
    const loggedInUserId = localStorage.getItem('roastme-current-user');
    if (loggedInUserId) {
        currentUser = users.find(user => user.id === loggedInUserId);
        if (currentUser) {
            showAppContent();
        }
    }
    
    // Set up tab indicator
    updateTabIndicator();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render posts
    renderPosts();
}

// Set up event listeners
function setupEventListeners() {
    // Auth buttons
    loginBtn.addEventListener('click', showLogin);
    signupBtn.addEventListener('click', showSignup);
    logoutBtn.addEventListener('click', logout);
    accountBtn.addEventListener('click', showAccountModal);
    
    // Auth forms
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Post form
    newPostForm.addEventListener('submit', handlePostSubmit);
    addPhoto.addEventListener('click', () => showMediaModal('post'));
    addVideo.addEventListener('click', () => showMediaModal('post'));
    
    // Response forms
    roastForm.addEventListener('submit', handleRoastSubmit);
    complimentForm.addEventListener('submit', handleComplimentSubmit);
    
    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Account form
    accountForm.addEventListener('submit', handleAccountUpdate);
    deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    
    // Media upload
    uploadBtn.addEventListener('click', () => mediaUpload.click());
    mediaUpload.addEventListener('change', handleMediaUpload);
    confirmMediaBtn.addEventListener('click', confirmMedia);
    
    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    
    // Close modals when clicking outside
    modalOverlay.addEventListener('click', hideAllModals);
    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            postModal.classList.add('hidden');
        }
        if (e.target === accountModal) {
            accountModal.classList.add('hidden');
        }
        if (e.target === mediaModal) {
            mediaModal.classList.add('hidden');
        }
    });
}

// Show login form
function showLogin() {
    authForms.classList.remove('hidden');
    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');
    appContent.classList.add('hidden');
}

// Show signup form
function showSignup() {
    authForms.classList.remove('hidden');
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
    appContent.classList.add('hidden');
}

// Show app content
function showAppContent() {
    authForms.classList.add('hidden');
    appContent.classList.remove('hidden');
    authButtons.classList.add('hidden');
    userActions.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('roastme-current-user', user.id);
        showAppContent();
        renderPosts();
    } else {
        alert('Invalid username or password');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        password
    };
    
    users.push(newUser);
    localStorage.setItem('roastme-users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('roastme-current-user', newUser.id);
    showAppContent();
    renderPosts();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('roastme-current-user');
    authButtons.classList.remove('hidden');
    userActions.classList.add('hidden');
    authForms.classList.add('hidden');
    appContent.classList.add('hidden');
}

// Handle post submission
function handlePostSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showLogin();
        return;
    }
    
    const content = postContent.value.trim();
    if (!content && !currentMedia) {
        alert('Please enter content or add media');
        return;
    }
    
    const newPost = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        content,
        media: currentMedia,
        timestamp: new Date().toISOString(),
        roasts: [],
        compliments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    postContent.value = '';
    mediaPreview.innerHTML = '';
    currentMedia = null;
    
    renderPosts();
}

// Render posts
function renderPosts() {
    if (!currentUser) return;
    
    postsContainer.innerHTML = '';
    
    const userPosts = posts.filter(post => post.userId === currentUser.id);
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<p class="no-posts">You have no posts yet. Create your first post to get roasted or complimented!</p>';
        return;
    }
    
    userPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
            <div class="post-header">
                <h4>${post.username}</h4>
                <div class="post-actions">
                    <button class="btn-sm edit-post" data-post-id="${post.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm delete-post" data-post-id="${post.id}"><i class="fas fa-trash"></i></button>
                    <button class="btn-sm share-btn" data-post-id="${post.id}"><i class="fas fa-share"></i></button>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.media ? `
                <div class="post-media">
                    ${post.media.type === 'image' ? 
                        `<img src="${post.media.url}" alt="Post media">` : 
                        `<video controls><source src="${post.media.url}"></video>`}
                </div>
            ` : ''}
            <div class="post-footer">
                <div class="post-time">${formatDate(post.timestamp)}</div>
                <div class="post-responses">
                    <span class="view-roasts" data-post-id="${post.id}">Roasts (${post.roasts.length})</span>
                    <span class="view-compliments" data-post-id="${post.id}">Compliments (${post.compliments.length})</span>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postEl);
    });
    
    // Add event listeners to post actions
    document.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editPost(btn.dataset.postId);
        });
    });
    
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePost(btn.dataset.postId);
        });
    });
    
    document.querySelectorAll('.view-roasts, .view-compliments').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPostModal(btn.dataset.postId);
        });
    });
    
    document.querySelectorAll('.post').forEach(post => {
        post.addEventListener('click', (e) => {
            if (!e.target.closest('.post-actions') && !e.target.closest('.post-responses')) {
                showPostModal(post.querySelector('[data-post-id]').dataset.postId);
            }
        });
    });
    
    // Add event listeners to share buttons
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.dataset.postId;
            handleShare(postId);
        });
    });
}

// Show post modal
function showPostModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    currentPostId = postId;
    
    postModalContent.innerHTML = `
        <div class="post-header">
            <h3>${post.username}</h3>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.media ? `
            <div class="post-media">
                ${post.media.type === 'image' ? 
                    `<img src="${post.media.url}" alt="Post media">` : 
                    `<video controls><source src="${post.media.url}"></video>`}
            </div>
        ` : ''}
        <div class="post-footer">
            <div class="post-time">${formatDate(post.timestamp)}</div>
        </div>
    `;
    
    roastsCount.textContent = post.roasts.length;
    complimentsCount.textContent = post.compliments.length;
    
    renderResponses('roasts', post.roasts);
    renderResponses('compliments', post.compliments);
    
    showModal('post-modal');
}

// Render responses (roasts or compliments)
function renderResponses(type, responses) {
    const container = type === 'roasts' ? roastsList : complimentsList;
    container.innerHTML = '';
    
    if (responses.length === 0) {
        container.innerHTML = `<p class="no-responses">No ${type} yet. Be the first to ${type === 'roasts' ? 'roast' : 'compliment'} this post!</p>`;
        return;
    }
    
    responses.forEach(response => {
        const responseEl = document.createElement('div');
        responseEl.className = `response ${type}`;
        responseEl.innerHTML = `
            <div class="response-header">
                <span>Anonymous</span>
                <span>${formatDate(response.timestamp)}</span>
            </div>
            <div class="response-content">${response.content}</div>
            <div class="response-actions">
                <button class="btn-sm reply-btn" data-response-id="${response.id}">Reply</button>
            </div>
            <div class="reply-form hidden" id="reply-form-${response.id}">
                <input type="text" placeholder="Write a reply..." class="reply-input">
                <button class="btn-sm submit-reply" data-response-id="${response.id}">Post</button>
            </div>
            ${response.replies && response.replies.length > 0 ? `
                <div class="replies">
                    ${response.replies.map(reply => `
                        <div class="response">
                            <div class="response-header">
                                <span>Anonymous</span>
                                <span>${formatDate(reply.timestamp)}</span>
                            </div>
                            <div class="response-content">${reply.content}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        container.appendChild(responseEl);
    });
    
    // Add event listeners to reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const form = document.getElementById(`reply-form-${btn.dataset.responseId}`);
            form.classList.toggle('hidden');
        });
    });
    
    document.querySelectorAll('.submit-reply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const responseId = btn.dataset.responseId;
            const input = document.querySelector(`#reply-form-${responseId} .reply-input`);
            const content = input.value.trim();
            
            if (!content) {
                alert('Please enter a reply');
                return;
            }
            
            const post = posts.find(p => p.id === currentPostId);
            if (!post) return;
            
            const responseType = btn.closest('.tab-content').id.includes('roasts') ? 'roasts' : 'compliments';
            const response = post[responseType].find(r => r.id === responseId);
            
            if (!response.replies) {
                response.replies = [];
            }
            
            response.replies.push({
                id: Date.now().toString(),
                content,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('roastme-posts', JSON.stringify(posts));
            renderResponses(responseType, post[responseType]);
            input.value = '';
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    roastsTab.classList.toggle('active', tabName === 'roasts');
    complimentsTab.classList.toggle('active', tabName === 'compliments');
    
    updateTabIndicator();
}

// Update tab indicator position
function updateTabIndicator() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        tabIndicator.style.width = `${activeTab.offsetWidth}px`;
        tabIndicator.style.left = `${activeTab.offsetLeft}px`;
    }
}

// Handle roast submission
function handleRoastSubmit(e) {
    e.preventDefault();
    submitResponse('roasts', roastContent);
}

// Handle compliment submission
function handleComplimentSubmit(e) {
    e.preventDefault();
    submitResponse('compliments', complimentContent);
}

// Submit response (roast or compliment)
function submitResponse(type, inputElement) {
    if (!currentPostId) return;
    
    const content = inputElement.value.trim();
    if (!content) {
        alert(`Please enter a ${type === 'roasts' ? 'roast' : 'compliment'}`);
        return;
    }
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    post[type].push({
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        replies: []
    });
    
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    inputElement.value = '';
    renderPosts();
    showPostModal(currentPostId);
    switchTab(type);
}

// Show account modal
function showAccountModal() {
    if (!currentUser) return;
    
    editUsername.value = currentUser.username;
    editPassword.value = '';
    showModal('account-modal');
}

// Handle account update
function handleAccountUpdate(e) {
    e.preventDefault();
    
    const newUsername = editUsername.value.trim();
    const newPassword = editPassword.value.trim();
    
    if (!newUsername) {
        alert('Please enter a username');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    // Check if username is already taken by another user
    if (users.some((u, index) => u.username === newUsername && index !== userIndex)) {
        alert('Username already taken');
        return;
    }
    
    users[userIndex].username = newUsername;
    if (newPassword) {
        users[userIndex].password = newPassword;
    }
    
    localStorage.setItem('roastme-users', JSON.stringify(users));
    currentUser = users[userIndex];
    usernameDisplay.textContent = currentUser.username;
    
    // Update posts with new username
    posts.forEach(post => {
        if (post.userId === currentUser.id) {
            post.username = currentUser.username;
        }
    });
    
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    hideAllModals();
    renderPosts();
}

// Handle account deletion
function handleAccountDeletion() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    
    // Remove user's posts
    const updatedPosts = posts.filter(post => post.userId !== currentUser.id);
    
    localStorage.setItem('roastme-users', JSON.stringify(updatedUsers));
    localStorage.setItem('roastme-posts', JSON.stringify(updatedPosts));
    localStorage.removeItem('roastme-current-user');
    
    currentUser = null;
    posts = updatedPosts;
    
    authButtons.classList.remove('hidden');
    userActions.classList.add('hidden');
    authForms.classList.add('hidden');
    appContent.classList.add('hidden');
    hideAllModals();
    
    renderPosts();
}

// Edit post
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    postContent.value = post.content;
    mediaPreview.innerHTML = '';
    
    if (post.media) {
        currentMedia = post.media;
        mediaPreview.innerHTML = `
            ${post.media.type === 'image' ? 
                `<img src="${post.media.url}" alt="Post media">` : 
                `<video controls><source src="${post.media.url}"></video>`}
            <button class="btn-sm remove-media" data-post-id="${postId}">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        
        document.querySelector('.remove-media').addEventListener('click', (e) => {
            e.preventDefault();
            currentMedia = null;
            mediaPreview.innerHTML = '';
        });
    }
    
    // Remove the post being edited
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    // Scroll to post form
    newPostForm.scrollIntoView({ behavior: 'smooth' });
    renderPosts();
}

// Delete post
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    renderPosts();
}

// Show media modal
function showMediaModal(context) {
    mediaContext = context;
    mediaUploadPreview.innerHTML = '';
    showModal('media-modal');
}

// Handle media upload
function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        let mediaHtml = '';
        let mediaType = '';
        
        if (file.type.startsWith('image/')) {
            mediaType = 'image';
            mediaHtml = `<img src="${event.target.result}" alt="Uploaded media">`;
        } else if (file.type.startsWith('video/')) {
            mediaType = 'video';
            mediaHtml = `<video controls><source src="${event.target.result}"></video>`;
        } else {
            alert('Unsupported file type. Please upload an image or video.');
            return;
        }
        
        mediaUploadPreview.innerHTML = mediaHtml;
        
        // Store the media data temporarily
        if (mediaContext === 'post') {
            currentMedia = {
                type: mediaType,
                url: event.target.result
            };
        }
    };
    
    reader.readAsDataURL(file);
}

// Confirm media selection
function confirmMedia() {
    if (!currentMedia) {
        alert('Please upload media first');
        return;
    }
    
    if (mediaContext === 'post') {
        mediaPreview.innerHTML = `
            ${currentMedia.type === 'image' ? 
                `<img src="${currentMedia.url}" alt="Post media">` : 
                `<video controls><source src="${currentMedia.url}"></video>`}
            <button class="btn-sm remove-media">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        
        document.querySelector('.remove-media').addEventListener('click', (e) => {
            e.preventDefault();
            currentMedia = null;
            mediaPreview.innerHTML = '';
        });
    }
    
    hideAllModals();
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to show a modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modalOverlay.classList.add('active'); // Show the overlay
        document.body.classList.add('modal-open'); // Prevent scrolling
    }
}

// Function to hide all modals
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    modalOverlay.classList.remove('active'); // Hide the overlay
    document.body.classList.remove('modal-open'); // Allow scrolling
}

// Function to generate a shareable link
function generateShareLink(postId) {
    const postUrl = `${window.location.origin}/?postId=${postId}`;
    return postUrl;
}

// Function to handle sharing
function handleShare(postId) {
    const shareLink = generateShareLink(postId);

    // Show sharing options
    const shareOptions = `
        <div class="share-options">
            <p>Share this post:</p>
            <input type="text" value="${shareLink}" readonly id="share-link">
            <button class="btn-sm copy-btn" onclick="copyToClipboard('${shareLink}')">Copy Link</button>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}" target="_blank" class="btn-sm twitter-btn">Share on Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}" target="_blank" class="btn-sm facebook-btn">Share on Facebook</a>
        </div>
    `;

    alert(shareOptions); // Replace this with a modal or custom UI for better design
}

// Function to copy the link to clipboard
function copyToClipboard(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy link: ', err);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);