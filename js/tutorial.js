/**
 * 新手引导系统
 */
const TutorialSystem = {
    steps: [
        {
            id: 'welcome',
            title: '欢迎来到文明放置！',
            content: '这是一个从原始部落开始，逐步发展文明的放置游戏。小克将指导你开始这段旅程。',
            target: null,
            action: '点击"开始"继续'
        },
        {
            id: 'resources',
            title: '第一步：了解资源',
            content: '你目前有 100 食物和 50 木材。食物用来招募人口，木材用来建造建筑。资源会自动增长（如果有工人）。',
            target: '#resources-panel',
            action: '点击"人口"标签'
        },
        {
            id: 'recruit',
            title: '第二步：招募村民',
            content: '点击"招募村民"按钮，花费 10 食物招募你的第一个村民。人口是发展的基础！',
            target: '#recruit-btn',
            action: '点击"招募村民"按钮'
        },
        {
            id: 'assign_job',
            title: '第三步：分配工作',
            content: '招募村民后，需要给他们分配工作。点击采集者的"+"按钮，让他为你采集食物和木材。',
            target: '#jobs-list .job-item:first-child',
            action: '点击采集者右侧的 + 按钮'
        },
        {
            id: 'buildings',
            title: '第四步：建造建筑',
            content: '有了足够资源后，切换到"建筑"标签，建造帐篷增加人口上限，或建造农场自动生产食物。',
            target: '#tabs .tab-btn[data-tab="buildings"]',
            action: '点击"建筑"标签'
        },
        {
            id: 'tech',
            title: '第五步：研究科技',
            content: '切换到"科技"标签，研究新科技解锁更多建筑和职业。科技需要学者生产科研点。',
            target: '#tabs .tab-btn[data-tab="tech"]',
            action: '点击"科技"标签'
        },
        {
            id: 'explore',
            title: '第六步：探索世界',
            content: '切换到"世界"标签，消耗食物探索周边，发现资源点获得奖励。',
            target: '#tabs .tab-btn[data-tab="world"]',
            action: '点击"世界"标签'
        },
        {
            id: 'done',
            title: '你已经掌握了基础！',
            content: '游戏会自动保存。关闭页面后资源仍会增长（离线挂机）。祝你的文明繁荣昌盛！',
            target: null,
            action: '点击"完成"开始游戏'
        }
    ],

    currentStep: 0,
    isActive: false,
    hasShown: false,

    // 检查是否首次游戏
    shouldShow() {
        return !localStorage.getItem('civ_idle_tutorial_shown');
    },

    // 开始教程
    start() {
        if (!this.shouldShow() || this.hasShown) return;
        this.isActive = true;
        this.currentStep = 0;
        this.render();
    },

    // 跳过教程
    skip() {
        this.isActive = false;
        this.hasShown = true;
        localStorage.setItem('civ_idle_tutorial_shown', 'true');
        this.hideOverlay();
    },

    // 下一步
    next() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.skip();
            return;
        }
        this.render();
    },

    // 渲染当前步骤
    render() {
        const step = this.steps[this.currentStep];
        const overlay = document.getElementById('tutorial-overlay') || this.createOverlay();
        
        overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-box" style="${this.getPosition(step.target)}">
                <h3>${step.title}</h3>
                <p>${step.content}</p>
                ${step.action ? `<div class="tutorial-action">👉 ${step.action}</div>` : ''}
                <div class="tutorial-buttons">
                    <button onclick="TutorialSystem.skip()" class="tutorial-skip">跳过</button>
                    <button onclick="TutorialSystem.next()" class="tutorial-next">
                        ${this.currentStep === this.steps.length - 1 ? '完成' : '下一步'}
                    </button>
                </div>
                <div class="tutorial-progress">${this.currentStep + 1} / ${this.steps.length}</div>
            </div>
        `;

        // 高亮目标元素
        if (step.target) {
            this.highlightTarget(step.target);
        }
    },

    // 创建遮罩层
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';
        document.body.appendChild(overlay);
        return overlay;
    },

    // 获取提示框位置
    getPosition(target) {
        if (!target) return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        
        const el = document.querySelector(target);
        if (!el) return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        
        const rect = el.getBoundingClientRect();
        const boxTop = rect.bottom + 20;
        const boxLeft = rect.left + rect.width / 2;
        
        return `top: ${boxTop}px; left: ${boxLeft}px; transform: translateX(-50%);`;
    },

    // 高亮目标元素
    highlightTarget(target) {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
        const el = document.querySelector(target);
        if (el) {
            el.classList.add('tutorial-highlight');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    // 隐藏遮罩
    hideOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.remove();
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    }
};

// 快捷提示系统
const QuickTips = {
    tips: [
        '💡 点击"招募村民"增加人口，人口越多生产越快',
        '💡 分配采集者可以自动获得食物和木材',
        '💡 建造帐篷增加人口上限',
        '💡 研究科技解锁更多建筑和职业',
        '💡 离线后资源仍会增长，最多24小时全额收益',
        '💡 人口需要食物维持，食物不足人口会下降',
        '💡 学者消耗食物但能产生科研点',
        '💡 探索世界可以发现资源点获得奖励'
    ],

    show() {
        const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
        const div = document.createElement('div');
        div.className = 'quick-tip';
        div.textContent = tip;
        document.body.appendChild(div);
        
        setTimeout(() => div.classList.add('show'), 100);
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 500);
        }, 5000);
    }
};
