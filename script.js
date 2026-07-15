function toggleMenu() {
  const menu = document.querySelector('.menu-links');
  const icon = document.querySelector('.hamburger-icon');
  menu.classList.toggle('open');
  icon.classList.toggle('open');
}

/* ─── HTML escaping ──────────────────────────────────────────── */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ─── Default portfolio data ─────────────────────────────────── */
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

async function getPortfolioData() {
  if (isFirebaseConfigured()) {
    try {
      const document = await firebase.firestore().collection('portfolio').doc('main').get();
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
  return DEFAULT_DATA;
}

/* ─── Social icons ───────────────────────────────────────────── */
const SOCIAL_CONFIG = [
  { key: 'linkedin', faClass: 'fa-brands fa-linkedin', label: 'LinkedIn' },
  { key: 'github', faClass: 'fa-brands fa-github', label: 'GitHub' },
  { key: 'instagram', faClass: 'fa-brands fa-instagram', label: 'Instagram' },
  { key: 'threads', faClass: 'fa-brands fa-threads', label: 'Threads' },
  { key: 'facebook', faClass: 'fa-brands fa-facebook', label: 'Facebook' },
  { key: 'tiktok', faClass: 'fa-brands fa-tiktok', label: 'TikTok' },
  { key: 'wechat', faClass: 'fa-brands fa-weixin', label: 'WeChat' },
  { key: 'rednote', faClass: null, label: 'RedNote' }
];

function renderSocials(profile) {
  const container = document.getElementById('socials-container');
  if (!container) return;
  container.innerHTML = '';

  SOCIAL_CONFIG.forEach(({ key, faClass, label }) => {
    const value = (profile[key] || '').trim();
    if (!value) return; // only render configured socials

    const a = document.createElement('a');
    a.className = 'social-link';
    a.setAttribute('aria-label', label);

    if (key === 'wechat') {
      a.href = '#';
      a.addEventListener('click', e => {
        e.preventDefault();
        navigator.clipboard && navigator.clipboard.writeText(value).catch(() => { });
        showToast('WeChat ID: ' + value + ' (copied!)');
      });
    } else {
      a.href = value;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    if (key === 'rednote') {
      const span = document.createElement('span');
      span.className = 'rednote-icon';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = '小红书';
      a.appendChild(span);
    } else {
      const i = document.createElement('i');
      i.className = faClass;
      i.setAttribute('aria-hidden', 'true');
      a.appendChild(i);
    }

    container.appendChild(a);
  });
}

/* ─── Projects ───────────────────────────────────────────────── */
function renderProjects(projects) {
  const container = document.getElementById('projects-list');
  if (!container) return;
  container.innerHTML = '';

  projects.forEach((project, idx) => {
    const carouselId = 'proj-carousel-' + idx;
    const card = document.createElement('div');
    card.className = 'details-container color-container';

    const assets = (project.media && project.media.length)
      ? project.media
      : (project.images || []).map(url => ({ url, type: 'image' }));

    const indicators = assets.map((_, i) => {
      const active = i === 0 ? 'class="active" aria-current="true" ' : '';
      return '<button type="button" data-bs-target="#' + carouselId + '" data-bs-slide-to="' + i + '" ' + active + 'aria-label="Slide ' + (i + 1) + '"></button>';
    }).join('');

    const items = assets.map((asset, i) =>
      '<div class="carousel-item' + (i === 0 ? ' active' : '') + '">' +
      (asset.type === 'video'
        ? '<video controls preload="metadata" class="d-block w-100"><source src="' + escapeHtml(asset.url) + '">Your browser does not support video.</video>'
        : '<img src="' + escapeHtml(asset.url) + '" alt="' + escapeHtml(project.title) + '" class="d-block w-100">') +
      '</div>'
    ).join('');

    card.innerHTML =
      '<div class="article-container">' +
      '<div id="' + carouselId + '" class="carousel slide" data-bs-ride="carousel">' +
      '<div class="carousel-indicators">' + indicators + '</div>' +
      '<div class="carousel-inner">' + items + '</div>' +
      '<button class="carousel-control-prev" type="button" data-bs-target="#' + carouselId + '" data-bs-slide="prev">' +
      '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
      '<span class="visually-hidden">Previous</span>' +
      '</button>' +
      '<button class="carousel-control-next" type="button" data-bs-target="#' + carouselId + '" data-bs-slide="next">' +
      '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
      '<span class="visually-hidden">Next</span>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '<h2 class="experience-sub-title project-title">' + escapeHtml(project.title) + '</h2>' +
      '<div class="btn-container">' +
      '<button class="btn btn-color-2 project-btn">' + escapeHtml(project.linkText || 'View') + '</button>' +
      '</div>';

    card.querySelector('.project-btn').addEventListener('click', () => {
      if (project.linkUrl) window.open(project.linkUrl, '_blank', 'noopener,noreferrer');
    });

    container.appendChild(card);
  });
}

/* ─── Contact section ────────────────────────────────────────── */
function renderProfile(profile) {
  const name = document.getElementById('profile-name');
  if (name) name.textContent = profile.name || DEFAULT_DATA.profile.name;

  const title = document.getElementById('profile-title');
  if (title) title.textContent = profile.title || DEFAULT_DATA.profile.title;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderParagraphs(id, lines) {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = '';
  (lines || []).forEach(line => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    container.appendChild(paragraph);
  });
}

function renderSkills(groups, headings) {
  const container = document.getElementById('skills-list');
  if (!container) return;
  const categories = [
    { title: headings.frontend, skills: groups.frontend },
    { title: headings.backend, skills: groups.backend },
    { title: headings.analytics, skills: groups.analytics }
  ];
  container.innerHTML = categories.map(category =>
    '<div class="details-container">' +
    '<h2 class="experience-sub-title">' + escapeHtml(category.title) + '</h2>' +
    '<div class="article-container">' +
    (category.skills || []).map(skill =>
      '<article><img src="./assets/checkmark.png" alt="" class="icon"><div><h3>' + escapeHtml(skill) + '</h3></div></article>'
    ).join('') +
    '</div>' +
    '</div>'
  ).join('');
}

function renderSite(site, profile) {
  setText('site-brand', site.brand || DEFAULT_DATA.site.brand);
  setText('mobile-site-brand', site.brand || DEFAULT_DATA.site.brand);
  setText('about-heading', site.aboutHeading || DEFAULT_DATA.site.aboutHeading);
  setText('skills-heading', site.skillsHeading || DEFAULT_DATA.site.skillsHeading);
  setText('projects-heading', site.projectsHeading || DEFAULT_DATA.site.projectsHeading);
  setText('experience-card-title', site.experienceTitle || DEFAULT_DATA.site.experienceTitle);
  setText('education-card-title', site.educationTitle || DEFAULT_DATA.site.educationTitle);
  renderParagraphs('experience-card-copy', site.experienceCopy || DEFAULT_DATA.site.experienceCopy);
  renderParagraphs('education-card-copy', site.educationCopy || DEFAULT_DATA.site.educationCopy);
  renderSkills(site.skills || DEFAULT_DATA.site.skills, Object.assign({}, DEFAULT_DATA.site.skillHeadings, site.skillHeadings || {}));

  const image = document.getElementById('profile-image');
  if (image && site.profileImage) image.src = site.profileImage;
  setText('copyright', 'Copyright © ' + (site.copyrightYear || DEFAULT_DATA.site.copyrightYear) + ' ' + (profile.name || DEFAULT_DATA.profile.name) + '. All Rights Reserved.');
}

/* ─── Toast ──────────────────────────────────────────────────── */
function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* ─── Boot ───────────────────────────────────────────────────── */
function renderPortfolio(data) {
  renderProfile(data.profile);
  renderSite(data.site || DEFAULT_DATA.site, data.profile);
  renderSocials(data.profile);
  renderProjects(data.projects);
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getPortfolioData();
  renderPortfolio(data);

  if (isFirebaseConfigured()) {
    firebase.firestore().collection('portfolio').doc('main').onSnapshot(document => {
      if (!document.exists) return;
      const remoteData = document.data();
      renderPortfolio({
        profile: Object.assign({}, DEFAULT_DATA.profile, remoteData.profile || {}),
        site: Object.assign({}, DEFAULT_DATA.site, remoteData.site || {}, { skills: Object.assign({}, DEFAULT_DATA.site.skills, (remoteData.site || {}).skills || {}), skillHeadings: Object.assign({}, DEFAULT_DATA.site.skillHeadings, (remoteData.site || {}).skillHeadings || {}) }),
        projects: Array.isArray(remoteData.projects) ? remoteData.projects : DEFAULT_DATA.projects
      });
    });
  }
});
