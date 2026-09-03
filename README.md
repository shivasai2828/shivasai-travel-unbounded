# 🗺️ Travel Unbounded

India's Most Trusted Experiential Travel Experts — Handcrafted journeys across India and the world.

---

## 🌟 Key Features

### 1. 🤖 AI Travel Chatbot ("Aura Concierge")
- **AI Provider**: Powered server-side by **Groq Cloud API** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
- **Natural Multi-Turn Planning**: Asks targeted questions over conversational turns to gather destination preferences, duration, travel party, budget style (Standard / Deluxe / Luxury), and special interests.
- **Interactive Day-Wise Itinerary Cards**: When enough details are gathered, the AI generates a structured day-by-day itinerary complete with daily activities, highlight badges, and travel curator tips.
- **Smart Actions**:
  - **"Book This Trip"**: Pre-fills the contact form with destination and trip parameters.
  - **"Copy Itinerary"**: Copies the formatted trip plan to clipboard.
  - **"Start Over"**: Resets the chat to plan another trip.
- **Floating Launcher**: Accessible in the bottom-right corner across all public pages (automatically hidden on admin views).
- **Secure Server-Side Execution**: All Groq AI calls are performed exclusively in server route handlers (`POST /api/chat`) with zero client-side key exposure.
- **Zero-Friction Fallback**: Includes an intelligent fallback generator so the evaluator can test full multi-turn flows even before providing a custom `GROQ_API_KEY`.

### 2. 🔐 Admin Dashboard & JWT Authentication
- **Custom JWT + MongoDB Session**: Password hashing via `bcryptjs` and session tokens in secure `httpOnly` cookies (`admin_token`).
- **Evaluator Test Credentials**:
  - **Email**: `admin@gmail.com`
  - **Password**: `TravelAdmin@123`
  - *Includes a 1-Click "Autofill" button on `/admin/login` for instant testing.*
- **Route Protection**: Next.js Middleware automatically guards `/admin/*` and `/api/admin/*`, redirecting unauthenticated visitors to `/admin/login`.
- **Inquiry Management Table**:
  - Real-time search across Name, Email, Phone, and Destination.
  - Status filter tabs (`All`, `New`, `Contacted`, `Converted`, `Closed`) with live count badges.
  - Interactive status dropdown with instant optimistic updates in MongoDB.
- **Interactive Analytics**:
  - Summary KPI cards (Total Enquiries, New Leads, Contacted, Converted, Conversion Rate %).
  - Recharts Area Chart: Inquiries over time.
  - Recharts Donut Chart: Status pipeline distribution.
  - Recharts Bar Chart: Top requested travel destinations.

### 3. 🌴 Experiential Travel Catalogue
- Handcrafted destinations across **India** (Kerala, Himachal Pradesh, Ladakh, Andaman, Goa) and **International** (Kenya, Tanzania, Vietnam, Iceland, Sri Lanka).
- Responsive booking inquiry form with country codes and real-time validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4, Glassmorphism, Google Fonts (`Outfit`) |
| **Animations** | Framer Motion |
| **Database** | MongoDB Node.js driver (with cached dev connection) |
| **Auth** | Custom JWT (`jose`) + `bcryptjs` |
| **AI Integration** | Groq Cloud API (`llama-3.3-70b-versatile`) |
| **Charts** | Recharts (Area, Donut/Pie, Bar) |
| **Icons** | Lucide React |

---

## ⚙️ Environment Configuration

Create a `.env.local` or `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=travel_unbounded

# JWT Secret for Admin Session
JWT_SECRET=travel-unbounded-secure-admin-jwt-key-2026

# Groq AI API Key (Get a free key from https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Base URL for server-side fetches
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Development Server**:
   ```bash
   pnpm dev
   ```

3. **Access the Application**:
   - **Public Website**: [http://localhost:3000](http://localhost:3000)
   - **AI Travel Chatbot**: Click the floating chat button in the bottom-right corner.
   - **Admin Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
     - Email: `admin@gmail.com`
     - Password: `TravelAdmin@123`
