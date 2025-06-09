# Sales & Purchases Tracker

A Next.js application for tracking sales and purchases transactions. The system is capable of calculating the cost for each of the sales records based on Weighted Average Cost (WAC).

## Supported features

- Record new purchase transaction.
- Retrieve a list of purchase transactions.
- Record new sales transaction.
- Retrieve a list of sales transactions.
- Allowing creation of transactions in random date order and system to
  automatically adjust costing for affected transactions accordingly.
- Allowing updating / deleting existing transactions.

## Methodology

The system uses Weighted Average Cost (WAC) methodology to calculate the cost of inventory. Here's how different transaction scenarios are handled:

### New Purchase Transaction

1. When a new purchase is added:
   - If it's the first purchase, WAC equals the unit price
   - If there are existing purchases:
     - New WAC = (Total Inventory Value + Current Transaction Value) / (Total Inventory Quantity + Current Transaction Quantity)
     - Total Inventory Value = Previous Total Inventory Quantity × Previous WAC
     - Total Inventory Quantity = Previous Total Inventory Quantity + Current Transaction Quantity

### New Sale Transaction

1. When a new sale is added:
   - WAC remains the same as the previous transaction, sale won't affect wac.
   - Total Inventory Quantity = Previous Total Inventory Quantity - Current Transaction Quantity

### Transaction Updates/Deletions

1. When a transaction is updated or deleted:
   - System identifies all affected transactions (transactions after the modified date)
   - Recalculates WAC and Total Inventory Quantity for all affected transactions in chronological order
   - Each subsequent transaction uses the previous transaction's values for calculations

### Random Date Order Transactions

1. When adding a transaction with a date between existing transactions:
   - System finds the latest transaction before the new transaction's date
   - Calculates WAC and Total Inventory Quantity for the new transaction
   - Recalculates all subsequent transactions to maintain accurate inventory values

This methodology ensures accurate inventory valuation and cost tracking regardless of the order in which transactions are recorded or modified.

## Data Model

### Transaction Model

The system uses the following database schema for transactions:

```typescript
const transactions = pgTable("Transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unitPrice").notNull(),
  type: text({ enum: ["PURCHASE", "SALE"] }).notNull(),
  wac: doublePrecision("wac").notNull(),
  totalInventoryQuantity: integer("totalInventoryQuantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});
```

Key fields explained:

- `id`: UUID primary key, automatically generated
- `quantity`: Integer representing the number of items in the transaction
- `unitPrice`: Double precision number for the price per item
- `type`: Transaction type, either "PURCHASE" or "SALE"
- `wac`: Double precision number for the Weighted Average Cost
- `totalInventoryQuantity`: Integer representing the total inventory after the transaction
- `createdAt`: Timestamp of when the transaction was created, defaults to current time

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database hosting)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yujune/sales-purchases-tracker.git
cd sales-purchases-tracker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=your_supabase_url
```

More info on getting supbase url: https://supabase.com/docs/guides/database/connecting-to-postgres#shared-pooler, make update the [YOUR-PASSWORD] in the supabase url to your supabase password.

4. Run database migrations:

```bash
npm run db:generate #Generate migrations
npm run db:migrate #Migrate generated migrations
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## Using the System

### Adding a New Purhcase Transaction

1. Click "Purchases" on the side bar
2. Click the "New" button on the navigation bar.
3. Fill in the transaction details:
   - Quantity (Number of item purchased)
   - Unit Price (Price per item purchased)
   - Purchase Date (Date of the item purchased)
4. Click "Add Purchase" to create a purchase transaction

### Updating a Purchase Transaction

1. Find the transaction in the list
2. Click the edit (pencil) icon
3. Modify the required fields
4. Click "Update Purchase" to update the transaction

### Deleting a Transaction

1. Find the transaction in the list
2. Click the delete (trash) icon

The same is applied to Sale transaction.

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Drizzle ORM
- PostgreSQL
- Supabase
- Tailwind CSS
- ShadCn
- Jest for testing

## Project Structure

```
app/
├── data/                  # Data layer
│   ├── database/         # Database schema definition (in drizzle)
│   └── repo/            # Repository layer for database operations
├── lib/                  # Core utilities and business logic
│   ├── actions/         # Resuable server actions for data mutations
│   ├── __tests__/       # Test files for utilities
│   ├── transaction-calculation.ts  # Business logic for transactions
│   ├── transaction-validation.ts   # Transaction validation
│   └── utils.ts         # Helper functions
├─- purchases/           # Purchase transaction pages
├── sales/              # Sales transaction pages
├── ui/                 # Reusable UI components
├── globals.css         # Global styles
├── layout.tsx          # Root layout component
└── page.tsx            # Home page component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
