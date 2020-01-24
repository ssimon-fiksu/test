export class CampInfo {
  bid_allocator_type_name: string
  blacklisted_audiences: string
  budget_allocator_type_name: string
  campaign_bidding_strategy: string
  campaign_bidding_value: number
  campaign_mode_name: string
  campaign_name: string
  carrier_targets: string
  client_budget_dollars: number
  client_price: number
  country_targets: []
  daily_budget_exploration_dollars: number
  daily_budget_optimization_dollars: number
  default_click_url: string
  default_impression_beacon: string
  device_class: string
  device_model_targets: string
  device_targets: [] = []
  is_pacing_enabled: string
  media_fee_percent: number
  minimum_os_version_targets: string
  platform_targets: string
  pricing_model_name: string
  reward_target: string
  tracking_type_name: string
  whitelisted_audiences: string
}
