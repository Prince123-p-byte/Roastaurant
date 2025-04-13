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
        }
    }
    
    updateTabIndicator();
    setupEventListeners();
    setupScrollAnimations();
    renderPosts();
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

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
