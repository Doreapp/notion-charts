# Notion charts

Proof-of-concept a system to embed charts in Notion, using data from Notion databases.

## Features

- Embbeded widget in notion
- Chart synchronization
- Chart based on notion data

## Example

![Configuration](./docs/config.png)

---

![Graph](./docs/graph.png)

## Deployment

We suggest deploying your own instance on Vercel.

Here is an how to guide for that.

### 1. Create a GitHub repository

Let's name it `notion-charts-deploy`, for the example.

### 2. Clone and setup the repo

- First, clone it locally.
- Then, add `notion-charts` as a submodule

  ```bash
  git submodule add https://github.com/Doreapp/notion-charts notion-charts
  ```

- And commit your changes

  ```bash
  git add .
  git commit -m "Add notion-charts as submodule"
  git push origin main
  ```

- Then, add a specific script that will be used to setup deployment.\
  Let's name it `setup-vercel.sh`.
  Here is its content:

  ```bash
  # setup-vercel.sh
  git submodule update --init --recursive
  cp -R notion-charts/* .
  npm install
  ```

- Make it executable

  ```bash
  chmod +x setup-vercel.sh
  ```

- Commit it

  ```bash
  git add setup-vercel.sh
  git commit -m "Add deployment script"
  git push origin main
  ```

### 3. Create a project on Vercel

- Login or create an account on Vercel
- Then, create a new project based on the GitHub repository you just created
- Select `Next.js` as Framework preset
- Within "Build and Output Settings"
  - Override "Build command" to `npm run build`
  - Override "Install command" to `./setup-vercel.sh`
- Under "Environment Variables"
  - Add `NOTION_INTEGRATION_SECRET` variable, setted to your Notion intergration's secret
  - Add `API_SECRET` setted to a custom secret key (its recommended to randomly generate it). Save it somewhere, you'll need to prompt it when you first access the app.
- Press "Deploy"

## Development

### 1. Clone this repository

```bash
git clone git@github.com:Doreapp/notion-charts.git
cd notion-charts
```

### 2. Create a Notion integration

1. Open https://www.notion.so/profile/integrations/
2. Press "New integration"
3. Choose a name and a workspace
4. Select "Internal" as Type
5. Save
6. Display and copy the integration's secret

### 3. Configure the app

```bash
cp .env.example .env.local
```

Then open `.env.local` and:

- Paste the integration secret as `NOTION_INTEGRATION_SECRET`
- Set `API_SECRET` to a secure random string (this will be used to protect API routes)

### 4. Start the app

```bash
npm install
npm run dev
```

### 5. Access the app

Open `http://localhost:3000` to test in a full web page.

**Note:** When you first access the app, you'll be prompted to enter the API secret. Use the same value you set for `API_SECRET` in your `.env.local` file.

#### Test in an actual Notion page

1. Create a new embed block, with url `https://localhost:3000`
2. Open browser dev tools and locate the corresponding iframe
3. Update the `src` attribute of the iframe to set it to `https://localhost:3000` (without the `s` at `http`)
4. It will work until you refresh the page.

NB: You can setup a custom user script (GreaseMonkey-like) to automatically update
iframes' src attribute in notion.so pages when the `src` matches `^https://localhost:\d+`.
