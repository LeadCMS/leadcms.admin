# leadcms.admin

React based Admin UI for LeadCMS (lightweight, extendable headless CMS for product websites)

## Project status

This project is currently in active development

## Requirements

- node >= 18.13.0
- npm >= 9.3.0

This project uses `.nvmrc` config. You can run `nvm use` to install required version of node

## Setup

Install dependencies:

    npm install

Create `.env` file and add configurations as shown in `.env.sample` file. Refer below example:

    CORE_API=http://localhost:45437

Fix any code formatting errors/warnings before do git commit.

- Run `eslint` to list code formatting issues

        npm run lint

- Run `prettier` to automatically fix possible formatting issues:

        npm run format

- Fix any remaining errors/warnings manually before commit.

    Note: If all formatting issues are not fixed, then `git commit` will fail due to husky pre-commit hook.

Start development server:

    npm start

Open the app:

http://localhost:8080
