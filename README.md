# User Node.js CRUD Seeder

A polished Node.js user management app built with **Express**, **MySQL**, **EJS**, and **Faker**.

Use it to practice full CRUD workflows, seed demo users quickly, and present a clean modern UI for local demos.

## Features

- Dashboard with live user count
- Full user CRUD
  - Create user
  - List users
  - Edit username (password confirmation required)
  - Delete user
- Database seeder powered by `@faker-js/faker`
- Shared modern dark UI (responsive cards, table, forms, alerts)
- Environment-based MySQL configuration
- Parameterized SQL queries to avoid injection from request values
- Friendly error page for missing routes and common failures

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Server | Express |
| Views | EJS |
| Database | MySQL (`mysql2`) |
| Seeding | Faker + UUID |
| Config | dotenv |
| HTTP verbs in forms | method-override |

## Project Structure

```text
.
├── index.js                 # Express app and routes
├── seed.js                  # Faker seeder script
├── schema.sql               # Database/table setup
├── package.json
├── .env.example             # Sample environment variables
├── public/
│   └── css/
│       └── style.css        # Shared UI styles
└── views/
    ├── home.ejs
    ├── users.ejs
    ├── new.ejs
    ├── edit.ejs
    ├── error.ejs
    └── partials/
        ├── header.ejs
        └── footer.ejs
```

## Prerequisites

- Node.js 18+ recommended
- MySQL server running locally
- npm

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy the example env file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=delta_app
SEED_COUNT=50
```

### 3) Create the database

Run the SQL schema in MySQL:

```bash
mysql -u root -p < schema.sql
```

Or execute `schema.sql` manually in MySQL Workbench / CLI.

### 4) Start the server

Development (auto-restart):

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Open: [http://localhost:8080](http://localhost:8080)

### 5) Seed sample users (optional)

```bash
npm run seed
```

This inserts `SEED_COUNT` fake users (default `50`).

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Dashboard with total user count |
| `GET` | `/user` | List all users |
| `GET` | `/user/new` | Create-user form |
| `POST` | `/user` | Create user |
| `GET` | `/user/:id/edit` | Edit-user form |
| `PATCH` | `/user/:id` | Update username (requires password) |
| `DELETE` | `/user/:id` | Delete user |

## UI Notes

- Sticky navigation for quick access to Dashboard / Users / Add User
- Dark gradient theme with card-based layout
- Success and error alerts for create/update/delete feedback
- Mobile-friendly table and form spacing

## Security Notes (Learning Project)

This project is designed for learning and demos:

- Passwords are stored in plain text for simplicity (do **not** use this pattern in production)
- Prefer hashing (for example bcrypt) before any real deployment
- Keep real credentials only in `.env` (never commit secrets)
- Queries now use placeholders (`?`) instead of string-concatenated SQL

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| Start | `npm start` | Run server |
| Dev | `npm run dev` | Run with nodemon |
| Seed | `npm run seed` | Insert fake users |

## Troubleshooting

**MySQL connection failed**
- Confirm MySQL is running
- Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`
- Ensure the `user` table exists (`schema.sql`)

**Duplicate username/email**
- Create/update operations enforce unique username and email
- Choose different values or clear conflicting rows

**Port already in use**
- Change `PORT` in `.env`

## Author

**Dipanshu Ambilkar**

## License

ISC
