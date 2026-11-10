# Major Mapping

A responsive college-planning web app starter built with plain HTML, CSS, and JavaScript. It is designed to publish directly with **GitHub Pages**, so the published URL opens the app itself rather than a repository README.

## Features

- College explorer with search and school-type filters
- Student profile form for GPA, SAT/ACT, course rigor, activities, and awards
- Save colleges to a personal list
- Admissions comparison view with transparent limitations
- Side-by-side comparison of up to three saved colleges
- College roadmap checklist
- Application deadline tracker for applications, scholarships, financial aid, and housing
- Add custom colleges and enter verified admissions information
- Responsive layout for desktop, tablet, and mobile
- Progressive Web App (PWA) support for adding the site to a phone home screen, with basic offline caching
- Local browser storage for this starter version (no account or server)

## Important data notice

The built-in colleges are **fictional sample records** used to demonstrate the interface. Their admissions ranges are illustrative, not real requirements or statistics. Do not use them to make admissions decisions. Add actual schools and verify every requirement, statistic, testing policy, and deadline on the institution's official admissions website. The personalized comparison checks available student GPA/SAT/ACT information against ranges entered for a college and labels whether the entered values are below or within/above those ranges. It is not an acceptance-probability calculator and does not predict admission.

## Publish with GitHub Pages

1. Create a GitHub repository named `major-mapping`.
2. Upload the contents of this folder to the **root** of the repository. `index.html`, `styles.css`, `app.js`, and `favicon.svg` must be at the top level, not hidden inside another folder.
3. Open the repository's **Settings** tab.
4. Select **Pages** in the left sidebar.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Set the branch to `main` and the folder to `/(root)`, then click **Save**.
7. Wait for GitHub Pages to finish publishing. The website address will look like `https://YOUR-USERNAME.github.io/major-mapping/`.
8. Open that Pages address to use the app. The address `https://github.com/YOUR-USERNAME/major-mapping` is the repository page, not the app.

If your repository uses a different name, the published URL will use that name instead of `major-mapping`.

## Add to a phone home screen

After the GitHub Pages site is published over HTTPS, open the published app URL on your phone. On iPhone, use Safari → Share → Add to Home Screen. On Android, use Chrome → menu → Install app (or Add to Home screen). This installs the web app shortcut; it is not the same as publishing a native app in the Apple App Store or Google Play.

## Run locally

Open `index.html` in a browser, or serve this folder with a local static web server. No build step or package installation is required.

## Privacy and storage

This starter stores the profile, saved colleges, and roadmap checklist in the browser's `localStorage` on the current device. There is no login, cloud sync, database, or server-side security yet. Do not enter sensitive personal information. Clearing browser site data may erase saved information. A production release should add secure authentication, database storage, privacy controls, accessibility testing, and a reviewed data source.
