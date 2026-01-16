# Ava Labs - Institutional Custody UI Take-Home Assignment

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9.15.3+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format
```

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI
- **Data Fetching**: Tanstack Query
- **Form Management**: Tanstack Form
- **Schema Validation**: Zod
- **BigInt Utilities**: Viem
- **Code Quality**: Biome (linting & formatting)
- **Testing**: Vitest + Testing Library
- **E2E Testing**: Playwright

## 🏗️ Project Structure

```
src/
├── api/              # API layer with mock services
│   ├── accounts.ts   # Account management
│   ├── addresses.ts # Address validation
│   ├── assets.ts    # Asset data fetching
│   ├── fee.ts       # Fee calculation
│   ├── networks.ts  # Network configuration
│   ├── submit-transfer.ts  # Transfer submission
│   └── vault-balances.ts   # Vault balance queries
│
├── components/       # React components
│   ├── AmountSelector/     # Amount input with balance display
│   ├── AssetSelector/      # Asset selection component
│   ├── Memo/               # Memo field component
│   ├── NavigationControl/  # Form navigation buttons
│   ├── Stepper/            # Step indicator
│   ├── ToVaultSelector/    # Destination vault selector
│   ├── TransferSuccess/    # Success screen
│   ├── VaultSelector/      # Source vault selector
│   └── ui/                 # Reusable UI primitives
│
├── hooks/           # Custom React hooks
│   ├── useAmountCalculations.ts
│   ├── useAmountInput.ts
│   ├── useBalanceDisplay.ts
│   ├── useFormReset.ts
│   ├── useStepNavigation.ts
│   ├── useTransferFormValidation.ts
│   └── useUSDValue.ts
│
├── schemas/          # Zod validation schemas
│   └── transfer.ts
│
├── utils/            # Utility functions
│   ├── balance.ts    # Balance formatting
│   └── prices.ts     # Price calculations
│
└── views/            # Page-level components
    └── Transfer.tsx  # Main transfer form view
```

## 🧪 Testing

### Unit Tests

Unit tests are written with Vitest and React Testing Library, covering:
- Component rendering and interactions
- Form validation logic
- Custom hooks
- Utility functions

```bash
pnpm test              # Run tests in watch mode
```

### E2E Tests

End-to-end tests use Playwright and cover:
- Complete user flows
- Form interactions
- Validation scenarios
- Keyboard accessibility
- Responsive behavior

```bash
pnpm test:e2e          # Run E2E tests
```

## 🚀 Deployment

### GitHub Pages

The application is automatically deployed to GitHub Pages on every push to `main` branch.

**Live Demo**: [View on GitHub Pages](https://sebaseek.github.io/ava-labs-thome/)

The deployment workflow (`.github/workflows/deploy.yml`) handles:
- Building the production bundle
- TypeScript type checking
- Deploying to GitHub Pages