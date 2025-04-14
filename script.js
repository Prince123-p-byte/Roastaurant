// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userActions = document.getElementById('user-actions');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const accountBtn = document.getElementById('account-btn');
const usernameDisplay = document.getElementById('username-display');
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const landingPage = document.getElementById('landing-page');
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

// Add these new variables at the top
let realtimeCheckInterval;
const REAL_TIME_UPDATE_INTERVAL = 5000; // Check for updates every 5 seconds

// App State
let currentUser = null;
let posts = [];
let currentPostId = null;
let currentMedia = null;
let mediaContext = null;

// Initialize the app
function init() {
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    posts = JSON.parse(localStorage.getItem('roastme-posts')) || [];
    
    const loggedInUserId = localStorage.getItem('roastme-current-user');
    if (loggedInUserId) {
        currentUser = users.find(user => user.id === loggedInUserId);
        if (currentUser) {
            showAppContent();
            startRealtimeUpdates(); // Start checking for updates
        }
    }
    
    // Check if a specific post is shared via URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPostId = urlParams.get('postId');
    const urlPost = urlParams.get('post'); // New: Check for encoded post data
    if (urlPost) {
        try {
            const post = JSON.parse(atob(urlPost));
            posts.push(post); // Temporarily add to local storage
            showSharedPostView(post.id);
            return;
        } catch (e) {
            console.error("Invalid post data");
        }
    } else if (sharedPostId) {
        const postExists = posts.some(p => p.id === sharedPostId);
        if (!postExists) {
            window.location.href = window.location.origin + window.location.pathname + '?error=post_not_found';
            return;
        }
        showSharedPostView(sharedPostId);
        return;
    }

    // Handle error messages
    if (urlParams.get('error') === 'post_not_found') {
        showNotification('The post you were looking for was not found', 'error');
    }

    updateTabIndicator();
    setupEventListeners();
    setupScrollAnimations();
    renderPosts();
}

// Show a shared post based on the postId in the URL
function showSharedPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        alert('Post not found!');
        return;
    }

    currentPostId = postId;

    postModalContent.innerHTML = `
        <div class="post-header">
            <h3>${post.username || 'Anonymous'}</h3>
        </div>
        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
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
        <div class="post-comments">
            <h4>Comments</h4>
            <div id="comments-list">
                ${post.comments && post.comments.length > 0 ? post.comments.map(comment => `
                    <div class="comment">
                        <span class="comment-author">${comment.author || 'Anonymous'}</span>
                        <p>${comment.content}</p>
                        <span class="comment-time">${formatDate(comment.timestamp)}</span>
                    </div>
                `).join('') : '<p>No comments yet. Be the first to comment!</p>'}
            </div>
            <form id="comment-form">
                <textarea id="comment-content" placeholder="Write a comment..." required></textarea>
                <button type="submit" class="btn-primary">Post Comment</button>
            </form>
        </div>
    `;

    // Add event listener for the comment form
    document.getElementById('comment-form').addEventListener('submit', handleCommentSubmit);

    showModal('post-modal');
}

// Handle comment submission
function handleCommentSubmit(e) {
    e.preventDefault();

    const commentContent = document.getElementById('comment-content').value.trim();
    if (!commentContent) {
        alert('Please enter a comment');
        return;
    }

    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;

    if (!post.comments) {
        post.comments = [];
    }

    post.comments.push({
        id: Date.now().toString(),
        content: commentContent,
        author: currentUser ? currentUser.username : 'Anonymous',
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    showSharedPost(currentPostId); // Refresh the modal to show the new comment
}

function setupEventListeners() {
    signupBtn.addEventListener('click', showSignup);
    logoutBtn.addEventListener('click', logout);
    accountBtn.addEventListener('click', showAccountModal);
    
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
    
    newPostForm.addEventListener('submit', handlePostSubmit);
    addPhoto.addEventListener('click', () => showMediaModal('post'));
    addVideo.addEventListener('click', () => showMediaModal('post'));
    
    roastForm.addEventListener('submit', handleRoastSubmit);
    complimentForm.addEventListener('submit', handleComplimentSubmit);
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    accountForm.addEventListener('submit', handleAccountUpdate);
    deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    
    uploadBtn.addEventListener('click', () => mediaUpload.click());
    mediaUpload.addEventListener('change', handleMediaUpload);
    confirmMediaBtn.addEventListener('click', confirmMedia);
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    
    modalOverlay.addEventListener('click', hideAllModals);
    window.addEventListener('click', (e) => {
        if (e.target === postModal || e.target === accountModal || e.target === mediaModal) {
            hideAllModals();
        }
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function showLogin() {
    landingPage.classList.remove('hidden');
    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');
    appContent.classList.add('hidden');
}

function showSignup() {
    landingPage.classList.add('hidden');
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
    appContent.classList.add('hidden');
}

function showAppContent() {
    landingPage.classList.add('hidden');
    signupSection.classList.add('hidden');
    appContent.classList.remove('hidden');
    authButtons.classList.add('hidden');
    userActions.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
}

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

function logout() {
    currentUser = null;
    localStorage.removeItem('roastme-current-user');
    authButtons.classList.remove('hidden');
    userActions.classList.add('hidden');
    showLogin();
}

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

// Add a share button to each post
function renderPosts() {
    if (!currentUser) return;
    
    postsContainer.innerHTML = '';
    
    const userPosts = posts.filter(post => post.userId === currentUser.id);
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<p class="no-posts animate-on-scroll">You have no posts yet. Create your first post to get roasted or complimented!</p>';
        setupScrollAnimations();
        return;
    }
    
    userPosts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post animate-on-scroll';
        
        const isTextOnly = post.content && !post.media;
        
        postEl.innerHTML = `
            <div class="post-header">
                <h4>${post.username}</h4>
                <div class="post-actions">
                    <button class="btn-sm edit-post" data-post-id="${post.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm delete-post" data-post-id="${post.id}"><i class="fas fa-trash"></i></button>
                    <button class="btn-sm share-post" data-post-id="${post.id}"><i class="fas fa-share"></i></button>
                </div>
            </div>
            ${isTextOnly ? 
                `<div class="text-post">${post.content}</div>` : 
                `<div class="post-content">${post.content}</div>`}
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
        
        // Add event listeners
        postEl.querySelector('.edit-post').addEventListener('click', (e) => {
            e.stopPropagation();
            editPost(post.id);
        });
        
        postEl.querySelector('.delete-post').addEventListener('click', (e) => {
            e.stopPropagation();
            deletePost(post.id);
        });
        
        postEl.querySelector('.share-post').addEventListener('click', (e) => {
            e.stopPropagation();
            sharePost(post.id);
        });
        
        postEl.querySelectorAll('.view-roasts, .view-compliments').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showPostModal(btn.dataset.postId);
            });
        });
        
        postEl.addEventListener('click', (e) => {
            if (!e.target.closest('.post-actions') && !e.target.closest('.post-responses')) {
                showPostModal(post.id);
            }
        });
    });
    
    setupScrollAnimations();
}

function showPostModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    currentPostId = postId;
    
    postModalContent.innerHTML = `
        <div class="post-header">
            <h3>${post.username}</h3>
        </div>
        ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
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

function updateTabIndicator() {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        tabIndicator.style.width = `${activeTab.offsetWidth}px`;
        tabIndicator.style.left = `${activeTab.offsetLeft}px`;
    }
}

function handleRoastSubmit(e) {
    e.preventDefault();
    submitResponse('roasts', roastContent);
}

function handleComplimentSubmit(e) {
    e.preventDefault();
    submitResponse('compliments', complimentContent);
}

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

function showAccountModal() {
    if (!currentUser) return;
    
    editUsername.value = currentUser.username;
    editPassword.value = '';
    showModal('account-modal');
}

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
    
    posts.forEach(post => {
        if (post.userId === currentUser.id) {
            post.username = currentUser.username;
        }
    });
    
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    hideAllModals();
    renderPosts();
}

function handleAccountDeletion() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('roastme-users')) || [];
    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    const updatedPosts = posts.filter(post => post.userId !== currentUser.id);
    
    localStorage.setItem('roastme-users', JSON.stringify(updatedUsers));
    localStorage.setItem('roastme-posts', JSON.stringify(updatedPosts));
    localStorage.removeItem('roastme-current-user');
    
    currentUser = null;
    posts = updatedPosts;
    
    authButtons.classList.remove('hidden');
    userActions.classList.add('hidden');
    showLogin();
    hideAllModals();
    
    renderPosts();
}

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
    
    // Remove the post being edited
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    
    // Scroll to post form
    newPostForm.scrollIntoView({ behavior: 'smooth' });
    renderPosts();
}

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    renderPosts();
}

// Share post function
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Compress post data into URL
    const postData = btoa(JSON.stringify(post));
    const url = `${window.location.origin}${window.location.pathname}?post=${postData}`;
    
    navigator.clipboard.writeText(url).then(() => {
        alert('Sharable link copied!');
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Post link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy post link: ', err);
        prompt('Copy this link:', text);
    });
}

function showMediaModal(context) {
    mediaContext = context;
    mediaUploadPreview.innerHTML = '';
    showModal('media-modal');
}

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
        
        if (mediaContext === 'post') {
            currentMedia = {
                type: mediaType,
                url: event.target.result
            };
        }
    };
    
    reader.readAsDataURL(file);
}

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

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    });
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function showSharedPostView(postId) {
    // Hide all main sections
    landingPage.classList.add('hidden');
    loginSection.classList.add('hidden');
    signupSection.classList.add('hidden');
    appContent.classList.add('hidden');
    
    // Show shared post view
    const sharedPostView = document.getElementById('shared-post-view');
    sharedPostView.classList.remove('hidden');
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
        // This should never happen since we check in init()
        sharedPostView.innerHTML = '<p class="no-posts">Post not found</p>';
        return;
    }

    renderSharedPostContent(post);
    
    // Set up event listeners for shared post view
    document.getElementById('shared-post-back').addEventListener('click', () => {
        window.location.href = window.location.origin + window.location.pathname;
    });
}

function renderSharedPostContent(post) {
    const sharedPostContainer = document.querySelector('.shared-post-container');
    sharedPostContainer.innerHTML = `
        <div class="post">
            <div class="post-header">
                <h3>${post.username || 'Anonymous'}</h3>
            </div>
            ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
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
        </div>
        
        <div class="shared-comment-form">
            <h3>Leave a response</h3>
            <textarea id="shared-comment-content" placeholder="Write your roast or compliment..."></textarea>
            <div class="shared-comment-buttons">
                <button id="submit-roast" class="btn-primary" style="background-color: var(--roast)">Roast</button>
                <button id="submit-compliment" class="btn-primary" style="background-color: var(--compliment)">Compliment</button>
            </div>
        </div>
        
        <div class="shared-comments">
            <h3>Responses</h3>
            <div id="shared-comments-list">
                ${renderSharedComments(post)}
            </div>
        </div>
    `;
    
    document.getElementById('submit-roast').addEventListener('click', (e) => {
        e.preventDefault();
        submitSharedResponse(post.id, 'roasts');
    });
    
    document.getElementById('submit-compliment').addEventListener('click', (e) => {
        e.preventDefault();
        submitSharedResponse(post.id, 'compliments');
    });
}

function renderSharedComments(post) {
    if ((!post.roasts || post.roasts.length === 0) && (!post.compliments || post.compliments.length === 0)) {
        return '<p>No responses yet. Be the first!</p>';
    }
    
    let html = '';
    
    if (post.roasts && post.roasts.length > 0) {
        html += '<h4>Roasts</h4>';
        post.roasts.forEach(roast => {
            html += `
                <div class="shared-comment roast">
                    <div class="shared-comment-header">
                        <span>Anonymous</span>
                        <span>${formatDate(roast.timestamp)}</span>
                    </div>
                    <div class="shared-comment-content">${roast.content}</div>
                </div>
            `;
        });
    }
    
    if (post.compliments && post.compliments.length > 0) {
        html += '<h4>Compliments</h4>';
        post.compliments.forEach(compliment => {
            html += `
                <div class="shared-comment compliment">
                    <div class="shared-comment-header">
                        <span>Anonymous</span>
                        <span>${formatDate(compliment.timestamp)}</span>
                    </div>
                    <div class="shared-comment-content">${compliment.content}</div>
                </div>
            `;
        });
    }
    
    return html;
}

function submitSharedResponse(postId, type) {
    const content = document.getElementById('shared-comment-content').value.trim();
    if (!content) {
        alert(`Please enter a ${type === 'roasts' ? 'roast' : 'compliment'}`);
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (!post[type]) {
        post[type] = [];
    }
    
    post[type].push({
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('roastme-posts', JSON.stringify(posts));
    document.getElementById('shared-comment-content').value = '';
    showSharedPostView(postId); // Refresh the view
}

function startRealtimeUpdates() {
    // Clear any existing interval
    if (realtimeCheckInterval) clearInterval(realtimeCheckInterval);
    
    // Check for updates periodically
    realtimeCheckInterval = setInterval(() => {
        const oldPosts = [...posts];
        const newPosts = JSON.parse(localStorage.getItem('roastme-posts')) || [];
        
        // Find posts with new comments
        const updatedPosts = newPosts.filter(newPost => {
            const oldPost = oldPosts.find(p => p.id === newPost.id);
            if (!oldPost) return false;
            
            // Check if roasts or compliments have changed
            const roastsChanged = JSON.stringify(newPost.roasts) !== JSON.stringify(oldPost.roasts);
            const complimentsChanged = JSON.stringify(newPost.compliments) !== JSON.stringify(oldPost.compliments);
            
            return roastsChanged || complimentsChanged;
        });
        
        if (updatedPosts.length > 0) {
            posts = newPosts;
            renderPosts();
            
            // Show notification for each updated post
            updatedPosts.forEach(post => {
                const totalNewResponses = 
                    (post.roasts?.length || 0) + (post.compliments?.length || 0) - 
                    (oldPosts.find(p => p.id === post.id)?.roasts?.length || 0) - 
                    (oldPosts.find(p => p.id === post.id)?.compliments?.length || 0);
                
                if (totalNewResponses > 0) {
                    showNotification(`New ${totalNewResponses} response(s) on your post!`, 'success');
                }
            });
        }
    }, REAL_TIME_UPDATE_INTERVAL);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `realtime-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.display = 'block';
    }, 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
