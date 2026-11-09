# Major Mapping

**A more thoughtful path to college.**

Major Mapping is an early cross-platform college-planning prototype built with Expo and React Native. Its visual identity uses a luxury-academic style: forest green, warm cream, ivory, and antique-gold accents.

## Current prototype

- Responsive app shell for iOS, Android, and web
- Home dashboard and getting-started flow
- College Explorer with search and sample listings
- Student profile fields for GPA, SAT score, and activities
- My Matches overview explaining planned admissions comparisons
- Admissions language designed to avoid guaranteed outcomes or fabricated acceptance odds

> **Important:** The colleges currently shown are fictional sample listings. This prototype does not yet contain verified admissions data, calculate admission probabilities, or save student profiles to an account. Do not use the sample listings to make application decisions.

## Run locally

### Requirements

- Node.js LTS
- npm

### Install and start

```bash
npm install
npx expo start
```

Then:

- Press `w` in the terminal to open the web version.
- Scan the QR code with Expo Go to preview on a phone.
- Use `npx expo start --android` or `npx expo start --ios` when the corresponding development environment is configured.

## Project structure

```text
major-mapping/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── constants/
│   └── theme.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Before using real admissions information

A production version should use dated, verifiable information from official college admissions pages and authoritative datasets. It should distinguish minimum eligibility rules from admitted-student ranges and explain uncertainty in any competitiveness assessment. It should also add secure account storage, privacy controls, and clear consent before collecting student information.

## Contributing

Issues and pull requests are welcome. Please do not add personal student data, passwords, API keys, or other secrets to the repository.

## License

No open-source license has been selected yet. Unless a license is added, normal copyright restrictions apply.
