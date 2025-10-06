# eKaty - Local Restaurant Discovery Platform

A modern web application for discovering restaurants in Katy, Texas, featuring AI-powered search, user reviews, and the signature "Grub Roulette" random restaurant picker.

## Features

- 🍽️ **Restaurant Discovery**: Search and filter local restaurants by cuisine, price, ratings
- 🎲 **Grub Roulette**: Random restaurant picker when you can't decide
- 👤 **User Accounts**: Save favorites, write reviews, track spin history
- 📱 **Responsive Design**: Works great on desktop and mobile
- 🗺️ **Location-Based**: Find restaurants near you in Katy, Texas
- 💼 **Business Portal**: Restaurant advertising and partnership opportunities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)
- **Icons**: Lucide React

## Quick Start

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Update the values in `.env.local` with your Supabase credentials.

3. **Set up the database**
   - Create a new Supabase project
   - Run the SQL in `lib/supabase/schema.sql` in your Supabase SQL editor
   - Update your environment variables with the project URL and keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── contact/           # Contact page
│   ├── discover/          # Restaurant search/browse
│   ├── restaurant/[id]/   # Restaurant detail pages
│   ├── spinner/           # Grub Roulette page
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── home/             # Homepage components
│   ├── layout/           # Layout components (nav, footer)
│   ├── discover/         # Search and filter components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   └── supabase/         # Database configuration and queries
└── public/               # Static assets
```

## Database Schema

The application uses Supabase with the following main tables:
- `users` - User profiles
- `restaurants` - Restaurant data
- `reviews` - User reviews
- `favorites` - User favorites
- `spins` - Grub Roulette spin history

See `lib/supabase/schema.sql` for the complete schema.

## Deployment

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set your environment variables in the Vercel dashboard
3. Deploy!

The app is optimized for Vercel deployment with Next.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is proprietary software for Strickland Technology Marketing.

## Support

For questions or support, contact us through the website's contact form or reach out directly.

---

Built with ❤️ for the Katy, Texas community!