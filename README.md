# React + TypeScript + Vite Project

A modern React application built with TypeScript, Vite, Tailwind CSS v4, and shadcn/ui components.

It is a drone tracing system, it shows all the drones live in space and
classify them based on their registration number as allowed to fly (green) or not (red).

You can Find it Live on :

```bash
https://sager-space-task-eta.vercel.app/
```

## 🙏 Acknowledgment

This project was developed as part of a technical assessment for a position opportunity. I would like to express my sincere gratitude to the company for providing this opportunity to demonstrate my technical skills and for considering my application. This task has been an excellent learning experience and a great way to showcase modern React development practices.

## 🚀 Tech Stack

- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS v4** - Next-generation utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Mapbox** - Interactive maps and geolocation services
- **Prettier** - Code formatting
- **ESLint** - Code linting and quality

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 19 or higher)
- **npm** or **yarn** or **pnpm**

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```bash
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   VITE_REACT_APP_BACKEND_URL=your_backend_url_here
   ```

   **Getting your Mapbox Access Token:**
   - Visit [Mapbox](https://www.mapbox.com/)
   - Sign up for a free account
   - Go to your account dashboard
   - Copy your default public token or create a new one

## 🚀 Getting Started

### Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## 🆘 Troubleshooting

**Module not found errors:** Make sure all dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment variable issues:** Ensure your `.env` file is in the root directory and contains the required variables. Restart the development server after adding environment variables.

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Mapbox Documentation](https://docs.mapbox.com/)

---
