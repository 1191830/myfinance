# 💰 PersonalFinanceApp

A personal finance management application to track income, expenses, savings, and investments. Designed for local use with a remote PostgreSQL database (Supabase) and a modern graphical user interface built with React.

---

## 📋 Core Features

- Track income and expenses (recurring and one-time)
- Monitor investments and saving goals
- Interactive dashboards and monthly reports
- Budget category breakdowns
- _(Future)_ Export data to Excel or CSV
- _(Optional)_ Budget overrun alerts
- _(Future)_ Automatic investment value tracking (via ticker)

---

## 🧱 Tech Stack

| Layer     | Technology            | Purpose                       |
| --------- | --------------------- | ----------------------------- |
| Frontend  | React (Vite)          | GUI and dashboards            |
| Backend   | Java + Spring Boot    | Business logic + API server   |
| Database  | Supabase (PostgreSQL) | Remote data persistence       |
| Dev Tools | Docker (future)       | Local dev, testing, packaging |

---

## 🧩 Architecture

+------------------+ HTTP +---------------------+ SQL/API +------------------------+
| React Frontend | <----------------> | Spring Boot Backend | <---------------> | Supabase (PostgreSQL) |
| (Local UI) | | (Executable/Local) | | (Cloud DB) |
+------------------+ +---------------------+ +------------------------+

- React communicates with the local Spring Boot backend
- Spring Boot communicates with the Supabase database
- The app runs locally but relies on a cloud database
- Internet connection required for sync

---

## 📁 Project Structure (Proposed)

personal-finance-app/
│
├── backend/ # Spring Boot API
│ └── src/main/java/...
│
├── frontend/ # React App (Vite)
│ └── src/
│ ├── components/
│ ├── pages/
│ └── services/
│
├── docs/ # Documentation, models
├── docker/ # Dockerfiles and docker-compose
└── README.md

---

## 🧾 Domain Model

### 🧾 Transaction

| Field        | Type                          | Description                                          |
| ------------ | ----------------------------- | --------------------------------------------------- |
| id           | UUID                          | Unique identifier                                   |
| type         | ENUM('INCOME', 'EXPENSE')     | Defines the nature of the transaction               |
| frequency    | ENUM('ONE_TIME', 'RECURRING') | One-time or recurring                               |
| category_id  | UUID (FK)                     | Link to category                                    |
| recurring_id | UUID (FK, nullable)           | Link to the `RecurringTransaction` that generated it |
| amount       | DECIMAL                       | Transaction amount                                  |
| date         | DATE                          | Date of transaction                                 |
| description  | TEXT                          | Optional description                                |

---

### 🔁 RecurringTransaction

A template. A generator materializes one concrete `Transaction` per period per active
template (idempotent per template per period, honouring `start_date` day-of-month and
`end_date`). Generated transactions can then be edited or deleted individually.

| Field       | Type                          | Description                          |
| ----------- | ----------------------------- | ----------------------------------- |
| id          | UUID                          | Unique identifier                   |
| type        | ENUM('INCOME', 'EXPENSE')     | Nature of the recurring entry       |
| frequency   | ENUM('ONE_TIME', 'RECURRING') | Always `RECURRING`                  |
| category_id | UUID (FK)                     | Link to category                    |
| amount      | DECIMAL                       | Amount of each occurrence           |
| description | TEXT                          | Optional description                |
| start_date  | DATE                          | First occurrence                    |
| end_date    | DATE (nullable)               | Optional last occurrence            |
| active      | BOOLEAN                       | Cancels future occurrences when off |

---

### 🗂️ Category

| Field | Type | Description         |
| ----- | ---- | ------------------- |
| id    | UUID | Unique identifier   |
| name  | TEXT | Category label name |

---

### 💹 Investment

| Field           | Type      | Description                                             |
| --------------- | --------- | ------------------------------------------------------- |
| id              | UUID      | Unique identifier                                       |
| type            | TEXT      | Investment type (e.g. ETF, Stock, Real Estate)          |
| ticker          | TEXT      | Ticker symbol (e.g. AAPL, BTC) _(optional)_             |
| amount_invested | DECIMAL   | Initial investment amount                               |
| current_value   | DECIMAL   | Most recent known value                                 |
| start_date      | DATE      | Start or purchase date                                  |
| notes           | TEXT      | Optional comments or details                            |
| last_synced     | TIMESTAMP | When value was last updated (future automation support) |

> ⚙️ Future enhancement: fetch latest value via market API using `ticker`

---

### 💰 SavingGoal

| Field          | Type    | Description            |
| -------------- | ------- | ---------------------- |
| id             | UUID    | Unique identifier      |
| name           | TEXT    | Goal name              |
| target_amount  | DECIMAL | Target value to reach  |
| current_amount | DECIMAL | Current progress       |
| start_date     | DATE    | When saving started    |
| end_date       | DATE    | Target completion date |

---

## 🗄️ Supabase Database Structure

### Tables

| Table Name     | Description                                |
| -------------- | ------------------------------------------ |
| `transactions` | All income and expense records             |
| `categories`   | Simple labels for classifying transactions |
| `investments`  | Financial assets and market instruments    |
| `savings`      | Goals and progress toward saving targets   |

### Relationships

- `transactions.category_id → categories.id`
- Transaction type defines the context, not the category

---

## 🐳 Docker (Future Stage)

In later phases, Docker will help with:

- Local environment setup
- Consistent backend/frontend dev environments
- Simplified CI/CD and containerized testing

> Not required during initial development.

---

## 🚀 Development Kickoff

### Phase 1

- Set up Supabase project and tables
- Build Spring Boot API with core endpoints:
  - CRUD for `Transaction`, `Category`, `Investment`, `SavingGoal`
- Create React UI layout and base pages
  - Dashboard, Add/Edit forms

### Phase 2 (Optional)

- Add graphs and monthly summaries
- Export to Excel/CSV
- Filter by period, type, category

---

## 📈 Future Enhancements

- Export data to CSV or Excel
- Automatic syncing of investment values (via `ticker`)
- Budget alerts or limits per category
- Local data cache (offline mode)
- File attachments (e.g. receipts)
- Advanced filtering and reports

---
