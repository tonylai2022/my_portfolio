/* ─── Firebase services ──────────────────────────────────────── */
const db = isFirebaseConfigured() ? firebase.firestore() : null;
const auth = isFirebaseConfigured() ? firebase.auth() : null;
const storage = isFirebaseConfigured() ? firebase.storage() : null;

/* ─── Auth ───────────────────────────────────────────────────── */
function isLoggedIn() {
    return !!(auth && auth.currentUser && auth.currentUser.email === ADMIN_EMAIL);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim().toLowerCase();
    const pw = document.getElementById('pw-input').value;
    const error = document.getElementById('login-error');
    if (!email || !pw) return;

    if (!auth || !isFirebaseConfigured()) {
        error.textContent = 'Configure Firebase before signing in.';
        return;
    }

    if (email !== ADMIN_EMAIL) {
        error.textContent = 'This email is not authorized for admin access.';
        return;
    }

    try {
        const credential = await auth.signInWithEmailAndPassword(email, pw);
        if (credential.user.email !== ADMIN_EMAIL) {
            await auth.signOut();
            error.textContent = 'This email is not authorized for admin access.';
            return;
        }
        showPanel();
    } catch (err) {
        error.textContent = 'Incorrect email or password.';
    }
}

function logout() {
    if (auth) {
        auth.signOut();
    }
    location.reload();
}

/* ─── Default Data ───────────────────────────────────────────── */
const DEFAULT_DATA = {
    profile: {
        name: 'Tony Lai',
        title: 'Software Engineer',
        email: 'tonytennisworld@gmail.com',
        linkedin: 'https://www.linkedin.com/in/tony-lai-mingwa/',
        github: 'https://github.com/tonylai2022',
        instagram: '',
        threads: '',
        facebook: '',
        tiktok: '',
        wechat: '',
        rednote: ''
    },
    site: {
        brand: "Tony's Portfolio",
        profileImage: './assets/tony-propic.png',
        aboutHeading: 'About Me',
        skillsHeading: 'Technical Skills',
        projectsHeading: 'Projects',
        copyrightYear: '2026',
        experienceTitle: 'Experience',
        experienceCopy: ['2+ years | Software Development and Data Analytics in Sports and Trading', '12+ years | Fitness and Racquet Sports Lover'],
        educationTitle: 'Education',
        educationCopy: ['B.Ed in Sports Science and PE', '- The Chinese University of Hong Kong', 'Dip. in Computer Systems Technology', '- British Columbia Institute of Technology'],
        skills: {
            frontend: ['HTML', 'CSS', 'ReactJs', 'JavaScript', 'TypeScript', 'Next JS'],
            backend: ['PostgreSQL', 'Node JS', 'Express JS', 'Firebase', 'Docker', 'MongoDB'],
            analytics: ['Python', 'SQL', 'PowerBI', 'Tableau', 'Jupyter', 'Excel']
        },
        skillHeadings: { frontend: 'Frontend Development', backend: 'Backend Development', analytics: 'Data Analytics' }
    },
    projects: [
        {
            id: 'p1',
            title: 'AI-Powered Recipe Manager',
            linkText: 'Github',
            linkUrl: 'https://github.com/Inez-y/2800-2024410-DTC08',
            images: [
                './assets/ReciPT_logo.png',
                './assets/ReciPT_landing.png',
                './assets/ReciPT_chatbot.png',
                './assets/ReciPT_camera.png'
            ]
        },
        {
            id: 'p2',
            title: 'Backtesting Stock Moving Average Trading Strategy',
            linkText: 'Github',
            linkUrl: 'https://github.com/tonylai2022/aapl_backtest_sample_ma_diff',
            images: [
                './assets/apple-stock2.png',
                './assets/equity_curve.png',
                './assets/heatmap.png',
                './assets/sorted_opt_df.png'
            ]
        },
        {
            id: 'p3',
            title: 'Visualizing World Cup 2018 live viewer response on sponsored logos',
            linkText: 'Kaggle',
            linkUrl: 'https://www.kaggle.com/datasets/laimingwa/viewersresponses',
            images: [
                './assets/wc2018_herojpg.jpg',
                './assets/worldcup.png'
            ]
        },
        {
            id: 'p4',
            title: 'Using OpenAI API as a specific search engine',
            linkText: 'Github',
            linkUrl: 'https://github.com/tonylai2022/ExplainPedia-Project',
            images: [
                './assets/openai.jpg',
                './assets/ExplainPedia.png'
            ]
        }
    ]
};

/* ─── Data persistence ───────────────────────────────────────── */
async function getPortfolioData() {
    if (db) {
        try {
            const document = await db.collection('portfolio').doc('main').get();
            if (document.exists) {
                const parsed = document.data();
                return {
                    profile: Object.assign({}, DEFAULT_DATA.profile, parsed.profile || {}),
                    site: Object.assign({}, DEFAULT_DATA.site, parsed.site || {}, { skills: Object.assign({}, DEFAULT_DATA.site.skills, (parsed.site || {}).skills || {}), skillHeadings: Object.assign({}, DEFAULT_DATA.site.skillHeadings, (parsed.site || {}).skillHeadings || {}) }),
                    projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_DATA.projects
                };
            }
        } catch (error) {
            console.error('Unable to load portfolio data from Firebase:', error);
        }
    }
    try {
        const s = localStorage.getItem('portfolioData');
        if (s) {
            const parsed = JSON.parse(s);
            return {
                profile: Object.assign({}, DEFAULT_DATA.profile, parsed.profile || {}),
                site: Object.assign({}, DEFAULT_DATA.site, parsed.site || {}, { skills: Object.assign({}, DEFAULT_DATA.site.skills, (parsed.site || {}).skills || {}), skillHeadings: Object.assign({}, DEFAULT_DATA.site.skillHeadings, (parsed.site || {}).skillHeadings || {}) }),
                projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_DATA.projects
            };
        }
    } catch (_) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

async function savePortfolioData(data) {
    if (db) {
        await db.collection('portfolio').doc('main').set(data);
    }
    localStorage.setItem('portfolioData', JSON.stringify(data));
}

/* ─── Panel init ─────────────────────────────────────────────── */
let currentData = null;

async function showPanel() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    currentData = await getPortfolioData();
    loadProfileForm(currentData.profile);
    loadContentForm(currentData.site);
    renderProjectsList();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.tab === tabName));
    document.querySelectorAll('.tab-pane').forEach(pane =>
        pane.classList.toggle('active', pane.id === 'tab-' + tabName));
}

/* ─── Profile tab ────────────────────────────────────────────── */
const SOCIAL_FIELDS = ['linkedin', 'github', 'instagram', 'threads', 'facebook', 'tiktok', 'wechat', 'rednote'];

function loadProfileForm(profile) {
    document.getElementById('pf-name').value = profile.name || '';
    document.getElementById('pf-title').value = profile.title || '';
    document.getElementById('pf-email').value = profile.email || '';
    SOCIAL_FIELDS.forEach(key => {
        const el = document.getElementById('pf-' + key);
        if (el) el.value = profile[key] || '';
    });
}

async function saveProfile() {
    currentData.profile.name = document.getElementById('pf-name').value.trim();
    currentData.profile.title = document.getElementById('pf-title').value.trim();
    currentData.profile.email = document.getElementById('pf-email').value.trim();
    SOCIAL_FIELDS.forEach(key => {
        const el = document.getElementById('pf-' + key);
        if (el) currentData.profile[key] = el.value.trim();
    });
    try {
        await savePortfolioData(currentData);
        showToast('Profile saved to Firebase!');
    } catch (error) {
        console.error('Profile save failed:', error);
        showToast('Save failed. Check Firestore is enabled and its rules allow this admin email.');
    }
}

/* ─── Content tab ────────────────────────────────────────────── */
function textLines(value) {
    return String(value || '').split('\n').map(line => line.trim()).filter(Boolean);
}

function loadContentForm(site) {
    document.getElementById('ct-brand').value = site.brand || '';
    document.getElementById('ct-copyright').value = site.copyrightYear || '';
    document.getElementById('ct-profile-image').value = site.profileImage || '';
    document.getElementById('ct-about-heading').value = site.aboutHeading || '';
    document.getElementById('ct-skills-heading').value = site.skillsHeading || '';
    document.getElementById('ct-projects-heading').value = site.projectsHeading || '';
    document.getElementById('ct-experience-title').value = site.experienceTitle || '';
    document.getElementById('ct-experience-copy').value = (site.experienceCopy || []).join('\n');
    document.getElementById('ct-education-title').value = site.educationTitle || '';
    document.getElementById('ct-education-copy').value = (site.educationCopy || []).join('\n');
    document.getElementById('ct-frontend-skills').value = (site.skills.frontend || []).join('\n');
    document.getElementById('ct-backend-skills').value = (site.skills.backend || []).join('\n');
    document.getElementById('ct-analytics-skills').value = (site.skills.analytics || []).join('\n');
    document.getElementById('ct-frontend-heading').value = site.skillHeadings.frontend || '';
    document.getElementById('ct-backend-heading').value = site.skillHeadings.backend || '';
    document.getElementById('ct-analytics-heading').value = site.skillHeadings.analytics || '';
}

async function saveContent() {
    currentData.site = {
        brand: document.getElementById('ct-brand').value.trim(),
        copyrightYear: document.getElementById('ct-copyright').value.trim(),
        profileImage: document.getElementById('ct-profile-image').value.trim(),
        aboutHeading: document.getElementById('ct-about-heading').value.trim(),
        skillsHeading: document.getElementById('ct-skills-heading').value.trim(),
        projectsHeading: document.getElementById('ct-projects-heading').value.trim(),
        experienceTitle: document.getElementById('ct-experience-title').value.trim(),
        experienceCopy: textLines(document.getElementById('ct-experience-copy').value),
        educationTitle: document.getElementById('ct-education-title').value.trim(),
        educationCopy: textLines(document.getElementById('ct-education-copy').value),
        skills: {
            frontend: textLines(document.getElementById('ct-frontend-skills').value),
            backend: textLines(document.getElementById('ct-backend-skills').value),
            analytics: textLines(document.getElementById('ct-analytics-skills').value)
        },
        skillHeadings: {
            frontend: document.getElementById('ct-frontend-heading').value.trim(),
            backend: document.getElementById('ct-backend-heading').value.trim(),
            analytics: document.getElementById('ct-analytics-heading').value.trim()
        }
    };
    try {
        await savePortfolioData(currentData);
        showToast('Site content saved to Firebase!');
    } catch (error) {
        console.error('Content save failed:', error);
        showToast('Save failed. Check Firestore permissions.');
    }
}

function storageErrorMessage(error) {
    const messages = {
        'storage/unauthorized': 'Upload blocked. Publish Firebase Storage rules that allow tonytennisworld@gmail.com to write to /assets.',
        'storage/project-not-found': 'Firebase Storage is not enabled for this project. Open Firebase Console → Storage → Get started.',
        'storage/bucket-not-found': 'The Firebase Storage bucket was not found. Confirm Storage is enabled and the bucket name in firebase-config.js is correct.',
        'storage/retry-limit-exceeded': 'Upload timed out. Check your connection and Firebase Storage setup, then try again.',
        'storage/canceled': 'Upload was canceled because it did not complete in time.',
        'storage/unauthenticated': 'Your admin session expired. Log out, sign in again, then retry the upload.'
    };
    return messages[error && error.code] || (error && error.message) || 'Upload failed. Check Firebase Storage configuration.';
}

function uploadFileWithProgress(path, file, onProgress) {
    return new Promise((resolve, reject) => {
        const task = storage.ref(path).put(file);
        const timeout = setTimeout(() => {
            task.cancel();
            reject({ code: 'storage/canceled' });
        }, 60000);

        task.on('state_changed', snapshot => {
            const progress = snapshot.totalBytes
                ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                : 0;
            onProgress(progress);
        }, error => {
            clearTimeout(timeout);
            reject(error);
        }, () => {
            clearTimeout(timeout);
            resolve(task.snapshot);
        });
    });
}

async function uploadProfileImage(file) {
    if (!file) return;
    const status = document.getElementById('profile-upload-status');
    if (location.protocol === 'file:') {
        status.className = 'msg-error';
        status.textContent = 'Firebase uploads cannot run from a file:// page. Open http://127.0.0.1:5500/admin.html instead.';
        return;
    }
    if (!storage) {
        showToast('Configure Firebase Storage before uploading media.');
        return;
    }
    try {
        if (file.size > 10 * 1024 * 1024) throw new Error('Profile photo exceeds the 10 MB limit.');
        status.className = 'msg-success';
        status.textContent = 'Preparing upload…';
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const snapshot = await uploadFileWithProgress('assets/profile-' + Date.now() + '-' + safeName, file, progress => {
            status.textContent = 'Uploading ' + file.name + '… ' + progress + '%';
        });
        document.getElementById('ct-profile-image').value = await snapshot.ref.getDownloadURL();
        await saveContent();
        status.textContent = 'Profile photo uploaded and published to Firebase.';
    } catch (error) {
        status.className = 'msg-error';
        status.textContent = storageErrorMessage(error);
    }
}

/* ─── Projects tab ───────────────────────────────────────────── */
function esc(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderProjectsList() {
    const list = document.getElementById('projects-admin-list');
    list.innerHTML = '';
    const total = currentData.projects.length;

    currentData.projects.forEach((project, idx) => {
        const card = document.createElement('div');
        card.className = 'proj-card';

        const upBtn = idx > 0
            ? `<button class="btn-muted" onclick="moveProject(${idx},-1)" title="Move up">↑</button>`
            : '';
        const downBtn = idx < total - 1
            ? `<button class="btn-muted" onclick="moveProject(${idx},1)" title="Move down">↓</button>`
            : '';

        card.innerHTML = `
      <div class="proj-card-header">
        <span class="proj-num">Project ${idx + 1} of ${total}</span>
        <div class="proj-actions">
          ${upBtn}${downBtn}
          <button class="btn-danger-sm" onclick="removeProject(${idx})" title="Delete project">✕ Delete</button>
        </div>
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" data-proj="${idx}" data-field="title" value="${esc(project.title)}" placeholder="Project title" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Button Label</label>
          <input type="text" data-proj="${idx}" data-field="linkText" value="${esc(project.linkText)}" placeholder="e.g. Github" />
        </div>
        <div class="form-group" style="flex:2">
          <label>Link URL</label>
          <input type="url" data-proj="${idx}" data-field="linkUrl" value="${esc(project.linkUrl)}" placeholder="https://..." />
        </div>
      </div>
      <div class="form-group">
        <label>Image Paths / URLs <small>— one per line; use relative paths like <code>./assets/image.png</code> or full URLs</small></label>
        <textarea data-proj="${idx}" data-field="images" rows="4">${(project.images || []).map(esc).join('\n')}</textarea>
        </div>
        <div class="form-group">
          <label>Upload Photos or Short Videos <small>— image or video files, up to 100 MB each</small></label>
          <input type="file" data-upload-project="${idx}" accept="image/*,video/*" multiple />
          <p id="upload-status-${idx}" class="msg-success"></p>
        </div>`;

        list.appendChild(card);
    });

    const saveBar = document.createElement('div');
    saveBar.className = 'save-bar';
    saveBar.innerHTML = `<button onclick="saveProjects()" class="btn-a btn-primary">Save All Projects</button>`;
    list.appendChild(saveBar);
}

function readProjectsFromForm() {
    return currentData.projects.map((proj, idx) => {
        const get = field => {
            const el = document.querySelector(`[data-proj="${idx}"][data-field="${field}"]`);
            return el ? el.value.trim() : '';
        };
        const imagesRaw = get('images');
        return {
            id: proj.id || ('p' + idx),
            title: get('title'),
            linkText: get('linkText'),
            linkUrl: get('linkUrl'),
            images: imagesRaw.split('\n').map(s => s.trim()).filter(Boolean),
            media: Array.isArray(proj.media) ? proj.media : []
        };
    });
}

async function saveProjects() {
    currentData.projects = readProjectsFromForm();
    try {
        await savePortfolioData(currentData);
        renderProjectsList();
        showToast('Projects saved to Firebase!');
    } catch (error) {
        console.error('Projects save failed:', error);
        showToast('Save failed. Check Firestore is enabled and its rules allow this admin email.');
    }
}

async function uploadProjectFiles(index, files) {
    if (!files.length) return;
    if (location.protocol === 'file:') {
        showToast('Open http://127.0.0.1:5500/admin.html to upload files.');
        return;
    }
    if (!storage) {
        showToast('Configure Firebase Storage before uploading media.');
        return;
    }

    currentData.projects = readProjectsFromForm();
    const status = document.getElementById('upload-status-' + index);
    const media = [];

    try {
        for (const file of files) {
            if (file.size > 100 * 1024 * 1024) throw new Error(file.name + ' exceeds the 100 MB limit.');
            status.textContent = 'Preparing upload…';
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = 'assets/' + Date.now() + '-' + safeName;
            const snapshot = await uploadFileWithProgress(path, file, progress => {
                status.textContent = 'Uploading ' + file.name + '… ' + progress + '%';
            });
            media.push({
                url: await snapshot.ref.getDownloadURL(),
                type: file.type.startsWith('video/') ? 'video' : 'image'
            });
        }
        currentData.projects[index].media = (currentData.projects[index].media || []).concat(media);
        await savePortfolioData(currentData);
        renderProjectsList();
        showToast('Upload complete!');
    } catch (error) {
        status.className = 'msg-error';
        status.textContent = storageErrorMessage(error);
    }
}

function addNewProject() {
    currentData.projects = readProjectsFromForm();
    currentData.projects.push({
        id: 'p' + Date.now(),
        title: 'New Project',
        linkText: 'Github',
        linkUrl: '',
        images: []
    });
    renderProjectsList();
    document.getElementById('projects-admin-list')
        .lastElementChild.previousElementSibling
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function removeProject(idx) {
    const name = currentData.projects[idx] ? currentData.projects[idx].title : 'this project';
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
    currentData.projects = readProjectsFromForm();
    currentData.projects.splice(idx, 1);
    await savePortfolioData(currentData);
    renderProjectsList();
}

function moveProject(idx, dir) {
    currentData.projects = readProjectsFromForm();
    const other = idx + dir;
    const temp = currentData.projects[idx];
    currentData.projects[idx] = currentData.projects[other];
    currentData.projects[other] = temp;
    renderProjectsList();
    // Scroll to the moved card
    const cards = document.querySelectorAll('.proj-card');
    if (cards[other]) cards[other].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── Settings tab ───────────────────────────────────────────── */
async function changePassword() {
    const currentPw = document.getElementById('set-current-pw').value;
    const newPw = document.getElementById('set-new-pw').value;
    const confirmPw = document.getElementById('set-confirm-pw').value;
    const msg = document.getElementById('settings-msg');

    msg.className = 'msg-error';

    if (!currentPw || !newPw || !confirmPw) {
        msg.textContent = 'Please fill in all fields.'; return;
    }
    if (newPw !== confirmPw) {
        msg.textContent = 'New passwords do not match.'; return;
    }
    if (newPw.length < 6) {
        msg.textContent = 'New password must be at least 6 characters.'; return;
    }

    if (!auth || !auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
        msg.textContent = 'Please sign in with the designated admin email first.';
        return;
    }

    try {
        const credential = firebase.auth.EmailAuthProvider.credential(ADMIN_EMAIL, currentPw);
        await auth.currentUser.reauthenticateWithCredential(credential);
        await auth.currentUser.updatePassword(newPw);
        msg.className = 'msg-success';
        msg.textContent = 'Password updated successfully.';
        document.getElementById('set-current-pw').value = '';
        document.getElementById('set-new-pw').value = '';
        document.getElementById('set-confirm-pw').value = '';
    } catch (error) {
        msg.textContent = 'Unable to update the password. Verify your current password and try again.';
    }
}

function exportData() {
    const json = JSON.stringify(currentData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function resetData() {
    if (!confirm('Reset ALL portfolio data to defaults? This cannot be undone.')) return;
    localStorage.removeItem('portfolioData');
    currentData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await savePortfolioData(currentData);
    loadProfileForm(currentData.profile);
    renderProjectsList();
    showToast('Data reset to defaults.');
}

/* ─── Toast helper ───────────────────────────────────────────── */
function showToast(message) {
    const el = document.getElementById('global-toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    if (/\/admin\.html$/.test(location.pathname)) {
        history.replaceState(null, '', location.pathname.replace(/admin\.html$/, 'admin') + location.search + location.hash);
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', logout);

    document.querySelectorAll('.tab-btn').forEach(btn =>
        btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    document.getElementById('projects-admin-list').addEventListener('change', event => {
        if (event.target.matches('[data-upload-project]')) {
            uploadProjectFiles(Number(event.target.dataset.uploadProject), event.target.files);
        }
    });

    document.getElementById('ct-profile-upload').addEventListener('change', event => {
        uploadProfileImage(event.target.files[0]);
    });

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user && user.email === ADMIN_EMAIL) showPanel();
        });
    }
});
