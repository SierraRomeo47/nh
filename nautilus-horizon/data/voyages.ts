// FIX: Changed import path to point to types/index.ts to avoid conflict with empty types.ts file.
import { Voyage } from '../types/index';

export const mockVoyagesData: Voyage[] = [
    {
      "voyage_id": "VY-RTM-NYK-001",
      "imo": "9391001",
      "ship_name": "Aurora Spirit",
      "legs": ["Rotterdam (EU) → New York (non-EU)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 210.4, "MGO": 8.2 },
        "transport_work_tnm": 1.82e9,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 50,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 635.0
      },
      "fueleu": {
        "energy_in_scope_gj": 19850.0,
        "ghg_intensity_gco2e_per_mj": 89.5,
        "compliance_balance_gco2e": -5.2e6,
        "pooling_status": "eligible_not_pooled"
      }
    },
    {
      "voyage_id": "VY-HAM-RTM-011",
      "imo": "9391002",
      "ship_name": "Baltic Star",
      "legs": ["Hamburg (EU) → Rotterdam (EU)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 72.1, "MGO": 2.1 },
        "transport_work_tnm": 3.90e8,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 100,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 185.6
      },
      "fueleu": {
        "energy_in_scope_gj": 6120.0,
        "ghg_intensity_gco2e_per_mj": 87.8,
        "compliance_balance_gco2e": 1.1e6,
        "pooling_status": "surplus_bankable"
      }
    },
    {
      "voyage_id": "VY-VAL-PIR-022",
      "imo": "9391003",
      "ship_name": "Coral Wave",
      "legs": ["Valencia (EU) → Piraeus (EU)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 96.3, "MGO": 3.0 },
        "transport_work_tnm": 6.20e8,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 100,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 248.9
      },
      "fueleu": {
        "energy_in_scope_gj": 8420.0,
        "ghg_intensity_gco2e_per_mj": 92.1,
        "compliance_balance_gco2e": -2.9e6,
        "pooling_status": "deficit_candidate_for_pool"
      }
    },
    {
      "voyage_id": "VY-SGP-RTM-031",
      "imo": "9391004",
      "ship_name": "Delta Horizon",
      "legs": ["Singapore (non-EU) → Rotterdam (EU)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 355.5, "MGO": 10.7 },
        "transport_work_tnm": 3.10e9,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 50,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 975.4
      },
      "fueleu": {
        "energy_in_scope_gj": 33650.0,
        "ghg_intensity_gco2e_per_mj": 90.4,
        "compliance_balance_gco2e": -8.1e6,
        "pooling_status": "deficit_candidate_for_pool"
      }
    },
    {
      "voyage_id": "VY-JED-VAL-044",
      "imo": "9391005",
      "ship_name": "Eastern Crest",
      "legs": ["Jeddah (non-EU) → Valencia (EU)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 188.2, "MGO": 6.4 },
        "transport_work_tnm": 1.22e9,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 50,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 505.0
      },
      "fueleu": {
        "energy_in_scope_gj": 17200.0,
        "ghg_intensity_gco2e_per_mj": 88.9,
        "compliance_balance_gco2e": -3.7e6,
        "pooling_status": "deficit_candidate_for_pool"
      }
    },
    {
      "voyage_id": "VY-RTM-OSL-055",
      "imo": "9391006",
      "ship_name": "Fjord Runner",
      "legs": ["Rotterdam (EU) → Oslo (EU/EEA)"],
      "imo_dcs": {
        "fuel_by_type_t": { "VLSFO": 64.9, "MGO": 2.0 },
        "transport_work_tnm": 3.10e8,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 100,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 161.0
      },
      "fueleu": {
        "energy_in_scope_gj": 5280.0,
        "ghg_intensity_gco2e_per_mj": 86.7,
        "compliance_balance_gco2e": 0.8e6,
        "pooling_status": "surplus_bankable"
      }
    },
    {
      "voyage_id": "VY-RTM-BERTH-OPS-066",
      "imo": "9391007",
      "ship_name": "Gulf Pioneer",
      "legs": ["Rotterdam (EU Berth Operations)"],
      "imo_dcs": {
        "fuel_by_type_t": { "MGO": 12.5 },
        "transport_work_tnm": 5.00e7,
        "submission_timeline": "Collect 1 Jan–31 Dec; submit to Flag by 31 May; upload by 30 Jun"
      },
      "eu_ets": {
        "covered_share_pct": 100,
        "reported_year": 2025,
        "surrender_deadline_iso": "2026-09-30",
        "eua_exposure_tco2": 28.5
      },
      "fueleu": {
        "energy_in_scope_gj": 420.0,
        "ghg_intensity_gco2e_per_mj": 95.0,
        "compliance_balance_gco2e": -0.2e6,
        "pooling_status": "deficit_candidate_for_pool"
      }
    }
];