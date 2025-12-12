---
name: Notion Charts Integration
overview: Build a Notion integration that embeds interactive charts in Notion pages, fetching data from Notion databases and displaying them using Next.js/React/MUI with real-time synchronization on access.
todos:
  - id: setup
    content: Initialize Next.js project with TypeScript and install dependencies (@notionhq/client, recharts, MUI packages)
    status: completed
  - id: notion-client
    content: Set up Notion API client with integration secret authentication
    status: completed
    dependencies:
      - setup
  - id: widget
    content: Create embeddable widget page (/embed) that accepts configuration via URL params
    status: completed
    dependencies:
      - setup
  - id: config-ui
    content: Build chart configuration UI component for database/field selection and chart type
    status: pending
    dependencies:
      - widget
  - id: data-api
    content: Create /api/chart-data endpoint to fetch and process Notion database data
    status: pending
    dependencies:
      - notion-client
  - id: charts
    content: Implement chart components (Line, Bar, Pie) using recharts with MUI styling
    status: pending
    dependencies:
      - widget
  - id: integration
    content: "Integrate all components: widget fetches data, renders config UI, displays charts with sync on access"
    status: pending
    dependencies:
      - config-ui
      - data-api
      - charts
---

# Notion Charts Integration - Proof of Concept

## Architecture Overview

The integration consists of:

1. **Next.js API routes** for Notion API proxy using integration secret
2. **Embeddable widget** (iframe-compatible React component) that Notion can embed
3. **Chart configuration UI** for selecting database and fields
4. **Chart rendering** using recharts library with MUI styling

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Notion as Notion Page
    participant Widget as Embedded Widget
    participant API as Next.js API
    participant NotionAPI as Notion API

    User->>Notion: Adds /x-chart block
    Notion->>Widget: Loads iframe with config params
    Widget->>API: Request chart data
    API->>NotionAPI: Fetch database data (using integration secret)
    NotionAPI-->>API: Database rows & properties
    API-->>Widget: Processed chart data
    Widget->>Widget: Render chart (recharts)
    Widget-->>Notion: Display chart in page
```

## Implementation Plan

### 1. Project Setup

- Initialize Next.js project with TypeScript
- Install dependencies: `@notionhq/client`, `recharts`, `@mui/material`, `@mui/icons-material`
- Configure environment variables for Notion integration secret

### 2. Notion API Client Setup

- Create Notion API client wrapper using integration secret
- Initialize client with secret from environment variables
- Handle API errors and rate limiting

### 3. Embeddable Widget Component

- Create `/embed` page that renders chart widget
- Accept URL parameters: `database_id`, `chart_type`, `field_mappings`
- Implement responsive iframe-friendly layout
- Add loading and error states

### 4. Chart Configuration UI

- Build configuration panel in widget for:
  - Database selection (list user's databases)
  - Field selection (properties from selected database)
  - Chart type selection (line, bar, pie)
  - Data aggregation options (if needed)
- Save configuration to URL params or localStorage

### 5. Data Fetching & Processing

- Create `/api/chart-data` endpoint that:
  - Uses integration secret to authenticate with Notion API
  - Fetches database from Notion API
  - Processes rows based on field mappings
  - Transforms data for chart library format
  - Returns structured chart data

### 6. Chart Rendering

- Implement chart components using recharts:
  - `LineChart` component
  - `BarChart` component
  - `PieChart` component
- Style with MUI theme
- Add chart interactions (tooltips, legends)

### 7. Synchronization

- Implement on-access data fetching (no caching for PoC)
- Add refresh button in widget
- Show last sync timestamp

## File Structure

```
/
├── app/
│   ├── api/
│   │   └── chart-data/route.ts          # Fetch & process data
│   ├── embed/
│   │   └── page.tsx                     # Embeddable widget page
│   └── layout.tsx
├── components/
│   ├── ChartWidget.tsx                  # Main widget component
│   ├── ChartConfig.tsx                  # Configuration UI
│   └── charts/
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       └── PieChart.tsx
├── lib/
│   ├── notion.ts                        # Notion API client wrapper
│   └── chart-processor.ts               # Data transformation
├── types/
│   └── notion.ts                        # TypeScript types
└── .env.local                           # Environment variables
```

## Key Implementation Details

### Authentication Flow

- Use Notion private integration with integration secret
- Secret stored in environment variable (server-side only)
- No user authentication required - integration has access to connected workspaces

### Chart Data Processing

- Map Notion property types to chart data:
  - `number` → numeric values
  - `date` → time series
  - `select`/`multi_select` → categories
  - `title` → labels

### Widget Embedding

- Widget page accepts query params: `db_id`, `type`, `fields`
- Renders in iframe-friendly container (no scrollbars)
- Responsive design for different embed sizes

## Environment Variables Required

```
NOTION_INTEGRATION_SECRET=
```

## Next Steps After PoC

- Add caching layer for performance
- Support more chart types
- Add export functionalit