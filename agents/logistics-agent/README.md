# Logistics AI Agent Module

Part of the **AxomOps AI** logistics aggregator and command hub. 

## Capabilities
1. **Route Optimizer:** Recommends the fastest and most cost-effective carrier based on historical averages, transit speeds, and performance scores.
2. **Customer Query Handling:** Keyword-matching chat interface to instantly resolve customer queries regarding shipment status (e.g., tracking IDs like `SHIP001`) and pincode coverage.
3. **Self-Learning Data Updater:** Automated weekly Node.js script and GitHub Action that checks carrier data freshness (>7 days old), simulates adaptive score variations, updates records, and maintains an audit trail.

## Data Structure
- `data/pincode_carriers.json`: Serviced pincodes and carrier performance metrics.
- `data/shipments.json`: Active sample tracking records.
- `data/update_log.json`: Audit log tracking self-learning updates.
