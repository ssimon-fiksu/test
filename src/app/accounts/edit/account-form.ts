import { App } from './app';

export class AccountForm {
 account_name: string 
 fiksu_app_id: number
 fiksu_app: App
 adomain: string
 device_class_id: number
 min_allowed_age: number = 0
 is_pacing_enabled: boolean = false
 exploration_bid_percentage: number = 1
 exchange_ids: Array<Number> = []
 category_ids: Array<Number> = []
 advertiser: string = ''
 third_party_impression_markup: string = ''
 impression_beacon: string = ''
}