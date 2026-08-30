# COR-HARP Data Directory

This directory contains humanitarian datasets used by the COR-HARP platform for ML inference and dashboard visualization.

## Data Sources and Licenses

### CC BY 4.0 / CC BY-IGO (Open for redistribution with attribution)

| File | Source | License |
|------|--------|---------|
| `nigeria_hrp_political_violence_events_and_fatalities_by_month-year_as-of-13aug2026.xlsx` | UN OCHA / ReliefWeb | CC BY-IGO |
| `wfp_food_prices_nga.csv` | WFP VAM (via HDX) | CC BY 4.0 |
| `real-time-food-prices-for-nigeria.csv` | WFP / market data | CC BY 4.0 |
| `global-market-monitor_subnational.csv` | WFP / market data | CC BY 4.0 |
| `hdx_dtm_nigeria_r43_master_list_idp.xlsx` | IOM DTM (via HDX) | CC BY 4.0 |
| `IDMC_Internal_Displacement_Conflict-Violence_Disasters.xlsx` | IDMC (via HDX) | CC BY 4.0 |
| `internal-displacements-new-displacements-idps_nga.csv` | IOM DTM | CC BY 4.0 |
| `nigeria-r51-needs-monitoring-for-publishing.xlsx` | IOM DTM R51 (via HDX) | CC BY 4.0 |
| `nigeria-r51-needs-monitoring-for-publishing.xlsx` | OCHA (via HDX) | CC BY 4.0 |
| `2022_humanitarian_profile_*.xlsx` | OCHA Humanitarian Profile | CC BY 4.0 |
| `2023_humanitarian_profile_*.xlsx` | OCHA Humanitarian Profile | CC BY 4.0 |
| `2024_humanitarian_profile_*.xlsx` | OCHA Humanitarian Profile | CC BY 4.0 |
| `2025_humanitarian_profile_*.xlsx` | OCHA Humanitarian Profile | CC BY 4.0 |

### CC BY-NC-SA 3.0 IGO (Non-commercial use only)

The following files are licensed under **Creative Commons Attribution-NonCommercial-ShareAlike 3.0 IGO** by the Integrated Food Security Phase Classification (IPC):

| File | Source | License |
|------|--------|---------|
| `ipc_nga_area_wide.csv` | IPC (via HDX) | CC BY-NC-SA 3.0 IGO |
| `cadre_harmonise_caf_ipc_mars26.xlsx` | Cadre Harmonisé / IPC | CC BY-NC-SA 3.0 IGO |

**Restrictions:** These datasets may only be used for non-commercial purposes. Attribution to IPC is required. Derivative works must be shared under the same license terms.

For full license details, see: https://www.ipcinfo.org/ipcinfo-website/privacy-policy

## Notes

- Data files are large and excluded from GitHub via `.gitignore`. Download separately and place in this directory.
- Model must be retrained if data files change: `cd hairp_app && python train_lstm.py`
- All external API calls have graceful fallbacks if data files are unavailable.
