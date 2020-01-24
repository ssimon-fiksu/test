export class AccountInfo {
  account_name: string
  adomain: string
  advertiser: any
  blacklist_ids: [] = []
  whitelist_ids: [] = []
  categories: Object
  create_date: {}
  daily_budget_dollars: number
  daily_budget_exploration_dollars: number
  daily_client_budget_dollars: number
  device_class_name: string
  dollars_remaining: number
  exploration_spend_today: number
  external_id: number
  fiksu_app_id: number
  is_pacing_enabled: true
  kpi_day: any
  kpi_target: any
  kpi_type: any
  min_allowed_age: number
  optimization_spend_today: number
  personalization_blacklist_entries: [] = []
  personalization_targets: [] = []
  account_day_hour_targets: [] = []
  time_zone_offset: number
  total_budget_dollars: number
}
