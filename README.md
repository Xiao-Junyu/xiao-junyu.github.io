# 阳朔 3天2晚 · 一家三口攻略网站

一个可直接托管在 GitHub Pages 的纯静态单页网站，内容基于《阳朔3天2晚一家三口攻略》（2026-08-17 至 08-19）。

## 功能

- 📱 手机优先设计，旅行途中随手打开就能看
- 🗓 三天行程时间轴（Day 1 / 2 / 3 标签页切换）
- 🎯 竹筏抢票专题卡（含放票前准备清单）
- ✅ 行前必办 / 抢票准备 / 打包清单可勾选，进度自动保存在浏览器本地（localStorage）
- 🧮 预算表、住宿价格判断表、雨天备用方案
- ⏳ 首屏出发倒计时
- 🚀 自带 GitHub Actions 工作流，push 即自动部署

## 项目结构

```
yangshuo-trip/
├── index.html                    # 整个网站（单文件、零依赖）
├── .nojekyll                     # 告诉 GitHub Pages 不要按 Jekyll 处理
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Pages 自动部署工作流
```

## 本地预览

直接双击 `index.html` 用浏览器打开即可；或者：

```bash
cd yangshuo-trip
python -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 部署方式一：GitHub Actions 自动部署（推荐）

利用仓库里的 `.github/workflows/deploy.yml`，每次 push 到 `main` 分支自动发布。

### 1. 新建仓库并推送代码

在 GitHub 新建一个**公开仓库**（免费账号 Pages 需要公开仓库），例如 `yangshuo-trip`，然后：

```bash
cd yangshuo-trip
git init
git add .
git commit -m "阳朔攻略网站 + Actions 部署"
git branch -M main
git remote add origin https://github.com/<你的用户名>/yangshuo-trip.git
git push -u origin main
```

> 注意要推整个文件夹（包含 `.github/workflows/deploy.yml` 和 `.nojekyll` 这两个隐藏路径），不要只上传 `index.html`。

<details>
<summary>不想装 Git？用网页上传也可以（点开看步骤）</summary>

1. 仓库页面 **Add file → Create new file**，文件名输入 `.github/workflows/deploy.yml`（输入斜杠会自动建目录），把 [deploy.yml](.github/workflows/deploy.yml) 的内容粘贴进去提交。
2. 同样方式再建一个空文件 `.nojekyll`。
3. **Add file → Upload files** 上传 `index.html`，提交。
</details>

### 2. 把 Pages 的来源切换为 GitHub Actions（只需一次）

仓库 **Settings → Pages** → **Build and deployment** → Source 一栏选择 **GitHub Actions**。

> 不做这一步的话，工作流最后的 Deploy 阶段会报错。切换来源不影响最终网址。

### 3. 完成

推送后到仓库的 **Actions** 页签可以看到 "Deploy to GitHub Pages" 工作流在跑，绿勾后约 1 分钟访问：

```
https://<你的用户名>.github.io/yangshuo-trip/
```

之后每次修改 `index.html` 并 push，网站自动更新；也可以在 Actions 页面选该工作流手动 **Run workflow**。

## 部署方式二：分支部署（不使用 Actions）

1. 只把 `index.html` 上传到仓库 `main` 分支根目录。
2. **Settings → Pages** → Source 选 **Deploy from a branch** → Branch 选 **main** / **(root)** → Save。
3. 等 1–2 分钟，访问同样的网址。

两种方式的最终网址相同，任选其一；想从方式二切回方式一，把 Source 改回 **GitHub Actions** 即可。

## 修改内容

所有行程内容都直接写在 `index.html` 里，用编辑器搜索相应文字（如"工农桥"、"¥650"）改完保存、push，网站约 1 分钟后自动更新。

> 行程车次、天气、竹筏开放状态，以 12306 与景区官方当天信息为准。
