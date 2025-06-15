export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_advertisers: {
        Row: {
          advertiser_name: string | null
          created_at: string
          id: string
        }
        Insert: {
          advertiser_name?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          advertiser_name?: string | null
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      admin_markets: {
        Row: {
          created_at: string
          id: number
          market: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          market?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          market?: string | null
        }
        Relationships: []
      }
      campaign_manager_campaign_status: {
        Row: {
          active: boolean
          campaign_id: string | null
          created_at: string
          id: string
          last_updated: string | null
        }
        Insert: {
          active?: boolean
          campaign_id?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
        }
        Update: {
          active?: boolean
          campaign_id?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_campaign_status_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaign_status_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_campaigns: {
        Row: {
          advertiser_id: string | null
          budget: number | null
          campaign_type:
            | Database["public"]["Enums"]["campaign_type_enum"]
            | null
          category_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          market_id: number | null
          name: string
          start_date: string | null
          status: string | null
          target_locations: Json | null
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          budget?: number | null
          campaign_type?:
            | Database["public"]["Enums"]["campaign_type_enum"]
            | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          market_id?: number | null
          name: string
          start_date?: string | null
          status?: string | null
          target_locations?: Json | null
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          budget?: number | null
          campaign_type?:
            | Database["public"]["Enums"]["campaign_type_enum"]
            | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          market_id?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
          target_locations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "admin_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_manager_campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_manager_campaigns_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "admin_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_campaigns_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_keyword_stats: {
        Row: {
          api_function: string | null
          api_source: string | null
          average_cpc: number | null
          bid: number | null
          clicks: number | null
          competitive_density: number | null
          cpc: number | null
          ctr: number | null
          date_interval: string | null
          id: string
          impressions: number | null
          keyword_difficulty: number | null
          keyword_id: string | null
          last_updated: string | null
          local_volume: number | null
          location_code: number | null
          market_volume: number | null
          match_type: string | null
          search_engine: string | null
          search_partners: boolean | null
          total_cost: number | null
        }
        Insert: {
          api_function?: string | null
          api_source?: string | null
          average_cpc?: number | null
          bid?: number | null
          clicks?: number | null
          competitive_density?: number | null
          cpc?: number | null
          ctr?: number | null
          date_interval?: string | null
          id?: string
          impressions?: number | null
          keyword_difficulty?: number | null
          keyword_id?: string | null
          last_updated?: string | null
          local_volume?: number | null
          location_code?: number | null
          market_volume?: number | null
          match_type?: string | null
          search_engine?: string | null
          search_partners?: boolean | null
          total_cost?: number | null
        }
        Update: {
          api_function?: string | null
          api_source?: string | null
          average_cpc?: number | null
          bid?: number | null
          clicks?: number | null
          competitive_density?: number | null
          cpc?: number | null
          ctr?: number | null
          date_interval?: string | null
          id?: string
          impressions?: number | null
          keyword_difficulty?: number | null
          keyword_id?: string | null
          last_updated?: string | null
          local_volume?: number | null
          location_code?: number | null
          market_volume?: number | null
          match_type?: string | null
          search_engine?: string | null
          search_partners?: boolean | null
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_keyword_stats_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: true
            referencedRelation: "campaign_manager_keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_keyword_stats_keyword"
            columns: ["keyword_id"]
            isOneToOne: true
            referencedRelation: "campaign_manager_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_keywords: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          keyword: string
          market_id: number | null
          match_type: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          market_id?: number | null
          match_type?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          market_id?: number | null
          match_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_manager_keywords_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "admin_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_keywords_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_negative_keywords: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          keyword: string
          match_type: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          match_type?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          match_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_negative_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_negative_keywords_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_manager_type: {
        Row: {
          campaign_id: string | null
          campaign_type: string | null
          created_at: string
          id: string
        }
        Insert: {
          campaign_id?: string | null
          campaign_type?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          campaign_id?: string | null
          campaign_type?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_manager_type_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_manager_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      location_data: {
        Row: {
          age_10_to_19: string | null
          age_18_to_24: string | null
          age_20s: string | null
          age_30s: string | null
          age_40s: string | null
          age_50s: string | null
          age_60s: string | null
          age_70s: string | null
          age_median: string | null
          age_over_18: string | null
          age_over_65: string | null
          age_over_80: string | null
          age_under_10: string | null
          batch_id: string | null
          batch_label: string | null
          cbsa_fips: string | null
          cbsa_metro: boolean | null
          cdp: boolean | null
          city: string | null
          city_alt: string | null
          city_ascii: string | null
          city_class: string | null
          commute_time: string | null
          Country: string
          county_assignment: string | null
          county_fips: number | null
          county_fips_all: string | null
          county_name: string | null
          county_name_all: string | null
          csa_fips: string | null
          csa_name: string | null
          data_cid: string | null
          density: string | null
          disabled: string | null
          divorced: string | null
          education_bachelors: string | null
          education_college_or_above: string | null
          education_graduate: string | null
          education_highschool: string | null
          education_less_highschool: string | null
          education_some_college: string | null
          education_stem_degree: string | null
          family_dual_income: string | null
          family_size: string | null
          female: string | null
          google_geo_location_id: string | null
          health_uninsured: string | null
          hispanic: string | null
          home_ownership: string | null
          home_value: string | null
          housing_units: string | null
          id: number
          income_household_10_to_15: string | null
          income_household_100_to_150: string | null
          income_household_15_to_20: string | null
          income_household_150_over: string | null
          income_household_20_to_25: string | null
          income_household_25_to_35: string | null
          income_household_35_to_50: string | null
          income_household_5_to_10: string | null
          income_household_50_to_75: string | null
          income_household_75_to_100: string | null
          income_household_median: string | null
          income_household_six_figure: string | null
          income_household_under_5: string | null
          income_individual_median: string | null
          income_tier: number | null
          incorporated: boolean | null
          labor_force_participation: string | null
          latitude: number | null
          limited_english: string | null
          longitude: number | null
          male: string | null
          market: string | null
          married: string | null
          military: boolean | null
          never_married: string | null
          population: string | null
          population_proper: string | null
          postal_code: string | null
          poverty: string | null
          race_asian: string | null
          race_black: string | null
          race_multiple: string | null
          race_native: string | null
          race_other: string | null
          race_pacific: string | null
          race_white: string | null
          ranking: number | null
          rent_burden: string | null
          rent_median: string | null
          sales_territory: string | null
          source: string | null
          state_id: string | null
          state_name: string | null
          timezone: string | null
          township: boolean | null
          unemployment_rate: string | null
          veteran: string | null
          widowed: string | null
          zone: string | null
        }
        Insert: {
          age_10_to_19?: string | null
          age_18_to_24?: string | null
          age_20s?: string | null
          age_30s?: string | null
          age_40s?: string | null
          age_50s?: string | null
          age_60s?: string | null
          age_70s?: string | null
          age_median?: string | null
          age_over_18?: string | null
          age_over_65?: string | null
          age_over_80?: string | null
          age_under_10?: string | null
          batch_id?: string | null
          batch_label?: string | null
          cbsa_fips?: string | null
          cbsa_metro?: boolean | null
          cdp?: boolean | null
          city?: string | null
          city_alt?: string | null
          city_ascii?: string | null
          city_class?: string | null
          commute_time?: string | null
          Country?: string
          county_assignment?: string | null
          county_fips?: number | null
          county_fips_all?: string | null
          county_name?: string | null
          county_name_all?: string | null
          csa_fips?: string | null
          csa_name?: string | null
          data_cid?: string | null
          density?: string | null
          disabled?: string | null
          divorced?: string | null
          education_bachelors?: string | null
          education_college_or_above?: string | null
          education_graduate?: string | null
          education_highschool?: string | null
          education_less_highschool?: string | null
          education_some_college?: string | null
          education_stem_degree?: string | null
          family_dual_income?: string | null
          family_size?: string | null
          female?: string | null
          google_geo_location_id?: string | null
          health_uninsured?: string | null
          hispanic?: string | null
          home_ownership?: string | null
          home_value?: string | null
          housing_units?: string | null
          id: number
          income_household_10_to_15?: string | null
          income_household_100_to_150?: string | null
          income_household_15_to_20?: string | null
          income_household_150_over?: string | null
          income_household_20_to_25?: string | null
          income_household_25_to_35?: string | null
          income_household_35_to_50?: string | null
          income_household_5_to_10?: string | null
          income_household_50_to_75?: string | null
          income_household_75_to_100?: string | null
          income_household_median?: string | null
          income_household_six_figure?: string | null
          income_household_under_5?: string | null
          income_individual_median?: string | null
          income_tier?: number | null
          incorporated?: boolean | null
          labor_force_participation?: string | null
          latitude?: number | null
          limited_english?: string | null
          longitude?: number | null
          male?: string | null
          market?: string | null
          married?: string | null
          military?: boolean | null
          never_married?: string | null
          population?: string | null
          population_proper?: string | null
          postal_code?: string | null
          poverty?: string | null
          race_asian?: string | null
          race_black?: string | null
          race_multiple?: string | null
          race_native?: string | null
          race_other?: string | null
          race_pacific?: string | null
          race_white?: string | null
          ranking?: number | null
          rent_burden?: string | null
          rent_median?: string | null
          sales_territory?: string | null
          source?: string | null
          state_id?: string | null
          state_name?: string | null
          timezone?: string | null
          township?: boolean | null
          unemployment_rate?: string | null
          veteran?: string | null
          widowed?: string | null
          zone?: string | null
        }
        Update: {
          age_10_to_19?: string | null
          age_18_to_24?: string | null
          age_20s?: string | null
          age_30s?: string | null
          age_40s?: string | null
          age_50s?: string | null
          age_60s?: string | null
          age_70s?: string | null
          age_median?: string | null
          age_over_18?: string | null
          age_over_65?: string | null
          age_over_80?: string | null
          age_under_10?: string | null
          batch_id?: string | null
          batch_label?: string | null
          cbsa_fips?: string | null
          cbsa_metro?: boolean | null
          cdp?: boolean | null
          city?: string | null
          city_alt?: string | null
          city_ascii?: string | null
          city_class?: string | null
          commute_time?: string | null
          Country?: string
          county_assignment?: string | null
          county_fips?: number | null
          county_fips_all?: string | null
          county_name?: string | null
          county_name_all?: string | null
          csa_fips?: string | null
          csa_name?: string | null
          data_cid?: string | null
          density?: string | null
          disabled?: string | null
          divorced?: string | null
          education_bachelors?: string | null
          education_college_or_above?: string | null
          education_graduate?: string | null
          education_highschool?: string | null
          education_less_highschool?: string | null
          education_some_college?: string | null
          education_stem_degree?: string | null
          family_dual_income?: string | null
          family_size?: string | null
          female?: string | null
          google_geo_location_id?: string | null
          health_uninsured?: string | null
          hispanic?: string | null
          home_ownership?: string | null
          home_value?: string | null
          housing_units?: string | null
          id?: number
          income_household_10_to_15?: string | null
          income_household_100_to_150?: string | null
          income_household_15_to_20?: string | null
          income_household_150_over?: string | null
          income_household_20_to_25?: string | null
          income_household_25_to_35?: string | null
          income_household_35_to_50?: string | null
          income_household_5_to_10?: string | null
          income_household_50_to_75?: string | null
          income_household_75_to_100?: string | null
          income_household_median?: string | null
          income_household_six_figure?: string | null
          income_household_under_5?: string | null
          income_individual_median?: string | null
          income_tier?: number | null
          incorporated?: boolean | null
          labor_force_participation?: string | null
          latitude?: number | null
          limited_english?: string | null
          longitude?: number | null
          male?: string | null
          market?: string | null
          married?: string | null
          military?: boolean | null
          never_married?: string | null
          population?: string | null
          population_proper?: string | null
          postal_code?: string | null
          poverty?: string | null
          race_asian?: string | null
          race_black?: string | null
          race_multiple?: string | null
          race_native?: string | null
          race_other?: string | null
          race_pacific?: string | null
          race_white?: string | null
          ranking?: number | null
          rent_burden?: string | null
          rent_median?: string | null
          sales_territory?: string | null
          source?: string | null
          state_id?: string | null
          state_name?: string | null
          timezone?: string | null
          township?: boolean | null
          unemployment_rate?: string | null
          veteran?: string | null
          widowed?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      location_list_items: {
        Row: {
          city: string
          country: string
          county_name: string | null
          created_at: string
          distance_miles: number | null
          id: string
          latitude: number | null
          list_id: string | null
          location_data_id: string
          longitude: number | null
          postal_code: string | null
          state_name: string
        }
        Insert: {
          city: string
          country: string
          county_name?: string | null
          created_at?: string
          distance_miles?: number | null
          id?: string
          latitude?: number | null
          list_id?: string | null
          location_data_id: string
          longitude?: number | null
          postal_code?: string | null
          state_name: string
        }
        Update: {
          city?: string
          country?: string
          county_name?: string | null
          created_at?: string
          distance_miles?: number | null
          id?: string
          latitude?: number | null
          list_id?: string | null
          location_data_id?: string
          longitude?: number | null
          postal_code?: string | null
          state_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "location_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      location_lists: {
        Row: {
          center_city: string
          center_latitude: number
          center_longitude: number
          created_at: string
          created_by: string | null
          description: string | null
          filters: Json | null
          id: string
          last_accessed_at: string | null
          location_count: number | null
          name: string
          radius_miles: number
          updated_at: string
        }
        Insert: {
          center_city: string
          center_latitude: number
          center_longitude: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          last_accessed_at?: string | null
          location_count?: number | null
          name: string
          radius_miles: number
          updated_at?: string
        }
        Update: {
          center_city?: string
          center_latitude?: number
          center_longitude?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          last_accessed_at?: string | null
          location_count?: number | null
          name?: string
          radius_miles?: number
          updated_at?: string
        }
        Relationships: []
      }
      scrapi_advertisers: {
        Row: {
          address: string | null
          ads_count: number | null
          domain: string
          email: string | null
          first_seen: string
          id: string
          last_seen: string
          metadata: Json | null
          name: string | null
          phone: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          ads_count?: number | null
          domain: string
          email?: string | null
          first_seen?: string
          id?: string
          last_seen?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          ads_count?: number | null
          domain?: string
          email?: string | null
          first_seen?: string
          id?: string
          last_seen?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      scrapi_api_credentials: {
        Row: {
          api_provider: string
          concurrent_request_limit: number | null
          created_at: string | null
          credential_name: string
          credentials: Json
          daily_request_limit: number | null
          id: string
          is_active: boolean | null
          last_reset_date: string | null
          monthly_request_limit: number | null
          requests_this_month: number | null
          requests_today: number | null
          updated_at: string | null
        }
        Insert: {
          api_provider: string
          concurrent_request_limit?: number | null
          created_at?: string | null
          credential_name: string
          credentials: Json
          daily_request_limit?: number | null
          id?: string
          is_active?: boolean | null
          last_reset_date?: string | null
          monthly_request_limit?: number | null
          requests_this_month?: number | null
          requests_today?: number | null
          updated_at?: string | null
        }
        Update: {
          api_provider?: string
          concurrent_request_limit?: number | null
          created_at?: string | null
          credential_name?: string
          credentials?: Json
          daily_request_limit?: number | null
          id?: string
          is_active?: boolean | null
          last_reset_date?: string | null
          monthly_request_limit?: number | null
          requests_this_month?: number | null
          requests_today?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scrapi_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key: string
          last_used_at: string | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      scrapi_batch_jobs: {
        Row: {
          completed_at: string | null
          completed_queries: number
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          error_message: string | null
          failed_queries: number
          id: string
          name: string
          started_at: string | null
          status: string
          total_queries: number
        }
        Insert: {
          completed_at?: string | null
          completed_queries?: number
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_message?: string | null
          failed_queries?: number
          id?: string
          name: string
          started_at?: string | null
          status?: string
          total_queries?: number
        }
        Update: {
          completed_at?: string | null
          completed_queries?: number
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_message?: string | null
          failed_queries?: number
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          total_queries?: number
        }
        Relationships: []
      }
      scrapi_bing_ad_renderings: {
        Row: {
          ad_id: string
          completed_at: string | null
          content_path: string | null
          content_size: number | null
          created_at: string
          error_message: string | null
          id: string
          rendering_target: string
          rendering_type: string
          status: string
          storage_url: string | null
        }
        Insert: {
          ad_id: string
          completed_at?: string | null
          content_path?: string | null
          content_size?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          rendering_target: string
          rendering_type: string
          status?: string
          storage_url?: string | null
        }
        Update: {
          ad_id?: string
          completed_at?: string | null
          content_path?: string | null
          content_size?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          rendering_target?: string
          rendering_type?: string
          status?: string
          storage_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_bing_ad_renderings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "scrapi_bing_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_bing_ads: {
        Row: {
          advertiser_domain: string | null
          advertiser_name: string | null
          created_at: string
          description: string | null
          destination_url: string | null
          display_url: string | null
          extensions: Json | null
          id: string
          phone: string | null
          position: number | null
          position_overall: number | null
          serp_id: string
          sitelinks: Json | null
          title: string | null
        }
        Insert: {
          advertiser_domain?: string | null
          advertiser_name?: string | null
          created_at?: string
          description?: string | null
          destination_url?: string | null
          display_url?: string | null
          extensions?: Json | null
          id?: string
          phone?: string | null
          position?: number | null
          position_overall?: number | null
          serp_id: string
          sitelinks?: Json | null
          title?: string | null
        }
        Update: {
          advertiser_domain?: string | null
          advertiser_name?: string | null
          created_at?: string
          description?: string | null
          destination_url?: string | null
          display_url?: string | null
          extensions?: Json | null
          id?: string
          phone?: string | null
          position?: number | null
          position_overall?: number | null
          serp_id?: string
          sitelinks?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_bing_ads_serp_id_fkey"
            columns: ["serp_id"]
            isOneToOne: false
            referencedRelation: "scrapi_serp_results"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_cron_executions: {
        Row: {
          batches_created: number | null
          error_message: string | null
          execution_duration_ms: number | null
          execution_time: string | null
          id: string
          scheduled_jobs_found: number | null
          success: boolean | null
        }
        Insert: {
          batches_created?: number | null
          error_message?: string | null
          execution_duration_ms?: number | null
          execution_time?: string | null
          id?: string
          scheduled_jobs_found?: number | null
          success?: boolean | null
        }
        Update: {
          batches_created?: number | null
          error_message?: string | null
          execution_duration_ms?: number | null
          execution_time?: string | null
          id?: string
          scheduled_jobs_found?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      scrapi_google_ad_renderings: {
        Row: {
          ad_id: string
          completed_at: string | null
          content_path: string | null
          content_size: number | null
          created_at: string
          error_message: string | null
          id: string
          rendering_target: string
          rendering_type: string
          status: string
          storage_url: string | null
        }
        Insert: {
          ad_id: string
          completed_at?: string | null
          content_path?: string | null
          content_size?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          rendering_target: string
          rendering_type: string
          status?: string
          storage_url?: string | null
        }
        Update: {
          ad_id?: string
          completed_at?: string | null
          content_path?: string | null
          content_size?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          rendering_target?: string
          rendering_type?: string
          status?: string
          storage_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_google_ad_renderings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "scrapi_google_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_google_ads: {
        Row: {
          advertiser_domain: string | null
          advertiser_name: string | null
          created_at: string
          description: string | null
          destination_url: string | null
          display_url: string | null
          extensions: Json | null
          id: string
          phone: string | null
          position: number | null
          position_overall: number | null
          serp_id: string
          sitelinks: Json | null
          title: string | null
        }
        Insert: {
          advertiser_domain?: string | null
          advertiser_name?: string | null
          created_at?: string
          description?: string | null
          destination_url?: string | null
          display_url?: string | null
          extensions?: Json | null
          id?: string
          phone?: string | null
          position?: number | null
          position_overall?: number | null
          serp_id: string
          sitelinks?: Json | null
          title?: string | null
        }
        Update: {
          advertiser_domain?: string | null
          advertiser_name?: string | null
          created_at?: string
          description?: string | null
          destination_url?: string | null
          display_url?: string | null
          extensions?: Json | null
          id?: string
          phone?: string | null
          position?: number | null
          position_overall?: number | null
          serp_id?: string
          sitelinks?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_google_ads_serp_id_fkey"
            columns: ["serp_id"]
            isOneToOne: false
            referencedRelation: "scrapi_serp_results"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_batches: {
        Row: {
          batch_number: number
          completed_at: string | null
          created_at: string | null
          id: string
          job_id: string
          oxylabs_batch_id: string | null
          schedule_id: string | null
          status: string | null
          submitted_at: string | null
          total_queries: number
          updated_at: string | null
        }
        Insert: {
          batch_number: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          oxylabs_batch_id?: string | null
          schedule_id?: string | null
          status?: string | null
          submitted_at?: string | null
          total_queries: number
          updated_at?: string | null
        }
        Update: {
          batch_number?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          oxylabs_batch_id?: string | null
          schedule_id?: string | null
          status?: string | null
          submitted_at?: string | null
          total_queries?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_batches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_batches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_batches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_batches_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_keywords: {
        Row: {
          created_at: string | null
          custom_parameters: Json | null
          id: string
          is_active: boolean | null
          job_id: string
          keyword: string
          location: string | null
          location_lat: number | null
          location_lng: number | null
        }
        Insert: {
          created_at?: string | null
          custom_parameters?: Json | null
          id?: string
          is_active?: boolean | null
          job_id: string
          keyword: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Update: {
          created_at?: string | null
          custom_parameters?: Json | null
          id?: string
          is_active?: boolean | null
          job_id?: string
          keyword?: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_keywords_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_keywords_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_keywords_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_logs: {
        Row: {
          batch_id: string | null
          created_at: string
          details: Json | null
          error_code: string | null
          id: string
          level: string
          log_level: string | null
          log_type: string | null
          message: string
          query_id: string | null
          stack_trace: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          details?: Json | null
          error_code?: string | null
          id?: string
          level: string
          log_level?: string | null
          log_type?: string | null
          message: string
          query_id?: string | null
          stack_trace?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          details?: Json | null
          error_code?: string | null
          id?: string
          level?: string
          log_level?: string | null
          log_type?: string | null
          message?: string
          query_id?: string | null
          stack_trace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "scrapi_batch_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_logs_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "scrapi_search_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_queue: {
        Row: {
          batch_id: string
          completed_at: string | null
          id: string
          job_id: string
          keyword_id: string
          last_error: string | null
          last_error_at: string | null
          location: string | null
          oxylabs_callback_url: string | null
          oxylabs_job_id: string | null
          priority: number | null
          query_text: string
          queued_at: string | null
          retry_count: number | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          id?: string
          job_id: string
          keyword_id: string
          last_error?: string | null
          last_error_at?: string | null
          location?: string | null
          oxylabs_callback_url?: string | null
          oxylabs_job_id?: string | null
          priority?: number | null
          query_text: string
          queued_at?: string | null
          retry_count?: number | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          id?: string
          job_id?: string
          keyword_id?: string
          last_error?: string | null
          last_error_at?: string | null
          location?: string | null
          oxylabs_callback_url?: string | null
          oxylabs_job_id?: string | null
          priority?: number | null
          query_text?: string
          queued_at?: string | null
          retry_count?: number | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_queue_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_queue_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "scrapi_oxylabs_batch_info"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "scrapi_job_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_queue_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_results: {
        Row: {
          ads_count: number | null
          created_at: string | null
          gcs_result_path: string | null
          gcs_screenshot_path: string | null
          id: string
          job_id: string
          organic_count: number | null
          oxylabs_content_type: string | null
          oxylabs_job_status: string | null
          oxylabs_status_code: number | null
          processing_time_ms: number | null
          queue_id: string
          raw_response_sample: Json | null
          result_size_bytes: number | null
          total_results: number | null
        }
        Insert: {
          ads_count?: number | null
          created_at?: string | null
          gcs_result_path?: string | null
          gcs_screenshot_path?: string | null
          id?: string
          job_id: string
          organic_count?: number | null
          oxylabs_content_type?: string | null
          oxylabs_job_status?: string | null
          oxylabs_status_code?: number | null
          processing_time_ms?: number | null
          queue_id: string
          raw_response_sample?: Json | null
          result_size_bytes?: number | null
          total_results?: number | null
        }
        Update: {
          ads_count?: number | null
          created_at?: string | null
          gcs_result_path?: string | null
          gcs_screenshot_path?: string | null
          id?: string
          job_id?: string
          organic_count?: number | null
          oxylabs_content_type?: string | null
          oxylabs_job_status?: string | null
          oxylabs_status_code?: number | null
          processing_time_ms?: number | null
          queue_id?: string
          raw_response_sample?: Json | null
          result_size_bytes?: number | null
          total_results?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_results_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          end_date: string | null
          id: string
          is_active: boolean | null
          job_id: string
          last_run_at: string | null
          next_run_at: string | null
          schedule_name: string
          start_date: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          job_id: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_name: string
          start_date?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          job_id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule_name?: string
          start_date?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_job_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_job_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_jobs: {
        Row: {
          capture_screenshot: boolean | null
          created_at: string | null
          created_by: string | null
          custom_parser_config: Json | null
          description: string | null
          device_type: string | null
          domain: string | null
          gcs_bucket_name: string | null
          gcs_path_prefix: string | null
          geo_location: string | null
          id: string
          is_active: boolean | null
          job_type: string
          language_code: string | null
          max_retries: number | null
          name: string
          oxylabs_parameters: Json | null
          parse_content: boolean | null
          priority: number | null
          retry_delay_seconds: number | null
          screenshot_format: string | null
          source: string
          timeout_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          capture_screenshot?: boolean | null
          created_at?: string | null
          created_by?: string | null
          custom_parser_config?: Json | null
          description?: string | null
          device_type?: string | null
          domain?: string | null
          gcs_bucket_name?: string | null
          gcs_path_prefix?: string | null
          geo_location?: string | null
          id?: string
          is_active?: boolean | null
          job_type: string
          language_code?: string | null
          max_retries?: number | null
          name: string
          oxylabs_parameters?: Json | null
          parse_content?: boolean | null
          priority?: number | null
          retry_delay_seconds?: number | null
          screenshot_format?: string | null
          source?: string
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          capture_screenshot?: boolean | null
          created_at?: string | null
          created_by?: string | null
          custom_parser_config?: Json | null
          description?: string | null
          device_type?: string | null
          domain?: string | null
          gcs_bucket_name?: string | null
          gcs_path_prefix?: string | null
          geo_location?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          language_code?: string | null
          max_retries?: number | null
          name?: string
          oxylabs_parameters?: Json | null
          parse_content?: boolean | null
          priority?: number | null
          retry_delay_seconds?: number | null
          screenshot_format?: string | null
          source?: string
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scrapi_oxylabs_runs: {
        Row: {
          created_at: string | null
          id: string
          jobs: Json | null
          oxylabs_schedule_id: string
          run_id: number
          success_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jobs?: Json | null
          oxylabs_schedule_id: string
          run_id: number
          success_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jobs?: Json | null
          oxylabs_schedule_id?: string
          run_id?: number
          success_rate?: number | null
        }
        Relationships: []
      }
      scrapi_oxylabs_schedules: {
        Row: {
          active: boolean | null
          created_at: string | null
          cron_expression: string | null
          deleted_at: string | null
          end_time: string | null
          id: string
          items_count: number | null
          job_id: string | null
          last_synced_at: string | null
          next_run_at: string | null
          oxylabs_schedule_id: string
          schedule_id: string | null
          stats: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          cron_expression?: string | null
          deleted_at?: string | null
          end_time?: string | null
          id?: string
          items_count?: number | null
          job_id?: string | null
          last_synced_at?: string | null
          next_run_at?: string | null
          oxylabs_schedule_id: string
          schedule_id?: string | null
          stats?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          cron_expression?: string | null
          deleted_at?: string | null
          end_time?: string | null
          id?: string
          items_count?: number | null
          job_id?: string | null
          last_synced_at?: string | null
          next_run_at?: string | null
          oxylabs_schedule_id?: string
          schedule_id?: string | null
          stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_schedule_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          failed_at: string | null
          id: string
          last_retry_at: string | null
          max_retries: number | null
          next_retry_at: string | null
          operation_data: Json | null
          operation_type: string
          requested_at: string
          requested_by: string | null
          result: Json | null
          retry_count: number | null
          schedule_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          operation_data?: Json | null
          operation_type: string
          requested_at?: string
          requested_by?: string | null
          result?: Json | null
          retry_count?: number | null
          schedule_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          operation_data?: Json | null
          operation_type?: string
          requested_at?: string
          requested_by?: string | null
          result?: Json | null
          retry_count?: number | null
          schedule_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      scrapi_scheduled_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          keyword: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          keyword?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          keyword?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
        }
        Relationships: []
      }
      scrapi_search_queries: {
        Row: {
          batch_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          location: string
          max_retries: number | null
          oxylabs_job_id: string | null
          priority: number | null
          query: string
          retry_count: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          location: string
          max_retries?: number | null
          oxylabs_job_id?: string | null
          priority?: number | null
          query: string
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          location?: string
          max_retries?: number | null
          oxylabs_job_id?: string | null
          priority?: number | null
          query?: string
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_search_queries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "scrapi_batch_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_serp_results: {
        Row: {
          ads_count: number | null
          content: Json | null
          created_at: string
          id: string
          local_count: number | null
          location: string
          organic_count: number | null
          oxylabs_job_id: string | null
          query: string
          query_id: string
          raw_html: string | null
          timestamp: string
          total_results: number | null
        }
        Insert: {
          ads_count?: number | null
          content?: Json | null
          created_at?: string
          id?: string
          local_count?: number | null
          location: string
          organic_count?: number | null
          oxylabs_job_id?: string | null
          query: string
          query_id: string
          raw_html?: string | null
          timestamp?: string
          total_results?: number | null
        }
        Update: {
          ads_count?: number | null
          content?: Json | null
          created_at?: string
          id?: string
          local_count?: number | null
          location?: string
          organic_count?: number | null
          oxylabs_job_id?: string | null
          query?: string
          query_id?: string
          raw_html?: string | null
          timestamp?: string
          total_results?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_serp_results_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "scrapi_search_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_system_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      scrapi_worker_instances: {
        Row: {
          capabilities: Json | null
          created_at: string
          id: string
          last_heartbeat: string
          metadata: Json | null
          name: string
          status: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          last_heartbeat?: string
          metadata?: Json | null
          name: string
          status?: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          last_heartbeat?: string
          metadata?: Json | null
          name?: string
          status?: string
        }
        Relationships: []
      }
      utility_banned_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: number
          is_active: boolean | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: number
          is_active?: boolean | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: number
          is_active?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      vault_facebook_ads_library: {
        Row: {
          ad_archive_id: string
          ad_body: string | null
          ad_status: string | null
          advertiser_id: string | null
          created_at: string
          cta_text: string | null
          cta_type: string | null
          currency: string | null
          display_format: string | null
          end_date: string | null
          id: string
          image_urls: Json | null
          impressions_index: number | null
          link_url: string | null
          page_categories: string[] | null
          page_id: string | null
          page_like_count: number | null
          page_name: string | null
          page_url: string | null
          publisher_platforms: string[] | null
          raw_data: Json | null
          spend_lower: number | null
          spend_upper: number | null
          start_date: string | null
          stored_image: string | null
          stored_video: string | null
          updated_at: string
          vault_facebook_ad_profile_id: string | null
          video_urls: Json | null
        }
        Insert: {
          ad_archive_id: string
          ad_body?: string | null
          ad_status?: string | null
          advertiser_id?: string | null
          created_at?: string
          cta_text?: string | null
          cta_type?: string | null
          currency?: string | null
          display_format?: string | null
          end_date?: string | null
          id?: string
          image_urls?: Json | null
          impressions_index?: number | null
          link_url?: string | null
          page_categories?: string[] | null
          page_id?: string | null
          page_like_count?: number | null
          page_name?: string | null
          page_url?: string | null
          publisher_platforms?: string[] | null
          raw_data?: Json | null
          spend_lower?: number | null
          spend_upper?: number | null
          start_date?: string | null
          stored_image?: string | null
          stored_video?: string | null
          updated_at?: string
          vault_facebook_ad_profile_id?: string | null
          video_urls?: Json | null
        }
        Update: {
          ad_archive_id?: string
          ad_body?: string | null
          ad_status?: string | null
          advertiser_id?: string | null
          created_at?: string
          cta_text?: string | null
          cta_type?: string | null
          currency?: string | null
          display_format?: string | null
          end_date?: string | null
          id?: string
          image_urls?: Json | null
          impressions_index?: number | null
          link_url?: string | null
          page_categories?: string[] | null
          page_id?: string | null
          page_like_count?: number | null
          page_name?: string | null
          page_url?: string | null
          publisher_platforms?: string[] | null
          raw_data?: Json | null
          spend_lower?: number | null
          spend_upper?: number | null
          start_date?: string | null
          stored_image?: string | null
          stored_video?: string | null
          updated_at?: string
          vault_facebook_ad_profile_id?: string | null
          video_urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_ads_library_vault_facebook_ad_profile_id_fkey"
            columns: ["vault_facebook_ad_profile_id"]
            isOneToOne: false
            referencedRelation: "vault_facebook_ads_runner"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_ads_runner: {
        Row: {
          created_at: string
          extracted: boolean | null
          extraction_attempts: number | null
          extraction_completed: boolean | null
          extraction_completed_at: string | null
          facebook_id: string
          id: string
          page_id: string | null
          raw_json: Json | null
          updated_at: string
          vault_google_business_listing_id: string | null
          vault_google_transparency_id: string | null
        }
        Insert: {
          created_at?: string
          extracted?: boolean | null
          extraction_attempts?: number | null
          extraction_completed?: boolean | null
          extraction_completed_at?: string | null
          facebook_id: string
          id?: string
          page_id?: string | null
          raw_json?: Json | null
          updated_at?: string
          vault_google_business_listing_id?: string | null
          vault_google_transparency_id?: string | null
        }
        Update: {
          created_at?: string
          extracted?: boolean | null
          extraction_attempts?: number | null
          extraction_completed?: boolean | null
          extraction_completed_at?: string | null
          facebook_id?: string
          id?: string
          page_id?: string | null
          raw_json?: Json | null
          updated_at?: string
          vault_google_business_listing_id?: string | null
          vault_google_transparency_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_ad_profiles_vault_google_business_listing_i_fkey"
            columns: ["vault_google_business_listing_id"]
            isOneToOne: false
            referencedRelation: "vault_google_business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_advertising_businesses: {
        Row: {
          ad_library_page_id: string | null
          ads_found_count: number | null
          advertising_confirmed: boolean
          business_name: string | null
          check_frequency_days: number
          created_at: string
          facebook_id: string
          facebook_url: string | null
          id: string
          initial_scrape_completed: boolean | null
          initial_scrape_scheduled: string | null
          job_definition_id: string | null
          last_ads_check: string | null
          last_successful_scrape: string | null
          next_scheduled_check: string | null
          updated_at: string
          vault_facebook_business_profile_id: string
        }
        Insert: {
          ad_library_page_id?: string | null
          ads_found_count?: number | null
          advertising_confirmed?: boolean
          business_name?: string | null
          check_frequency_days?: number
          created_at?: string
          facebook_id: string
          facebook_url?: string | null
          id?: string
          initial_scrape_completed?: boolean | null
          initial_scrape_scheduled?: string | null
          job_definition_id?: string | null
          last_ads_check?: string | null
          last_successful_scrape?: string | null
          next_scheduled_check?: string | null
          updated_at?: string
          vault_facebook_business_profile_id: string
        }
        Update: {
          ad_library_page_id?: string | null
          ads_found_count?: number | null
          advertising_confirmed?: boolean
          business_name?: string | null
          check_frequency_days?: number
          created_at?: string
          facebook_id?: string
          facebook_url?: string | null
          id?: string
          initial_scrape_completed?: boolean | null
          initial_scrape_scheduled?: string | null
          job_definition_id?: string | null
          last_ads_check?: string | null
          last_successful_scrape?: string | null
          next_scheduled_check?: string | null
          updated_at?: string
          vault_facebook_business_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_advertising_businesses_job_definition_id_fkey"
            columns: ["job_definition_id"]
            isOneToOne: false
            referencedRelation: "vault_facebook_job_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_facebook_advertising_businesses_profile_id_fkey"
            columns: ["vault_facebook_business_profile_id"]
            isOneToOne: false
            referencedRelation: "vault_facebook_business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_business_profiles: {
        Row: {
          ad_library_page_id: string | null
          ad_status: string | null
          address: string | null
          ads_runner_completed: boolean | null
          category: string | null
          cover_photo_url: string | null
          created_at: string
          creation_date: string | null
          email: string | null
          facebook_advertising_active: boolean | null
          facebook_id: string | null
          follower_count: number | null
          gender: string | null
          id: string
          is_business_page_active: string | null
          like_count: number | null
          links: Json | null
          name: string | null
          page_intro: string | null
          phone: string | null
          profile_photo_url: string | null
          rating: string | null
          rating_count: number | null
          updated_at: string
          url: string | null
          vault_google_business_listing_id: string | null
          website: string | null
        }
        Insert: {
          ad_library_page_id?: string | null
          ad_status?: string | null
          address?: string | null
          ads_runner_completed?: boolean | null
          category?: string | null
          cover_photo_url?: string | null
          created_at?: string
          creation_date?: string | null
          email?: string | null
          facebook_advertising_active?: boolean | null
          facebook_id?: string | null
          follower_count?: number | null
          gender?: string | null
          id?: string
          is_business_page_active?: string | null
          like_count?: number | null
          links?: Json | null
          name?: string | null
          page_intro?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          rating?: string | null
          rating_count?: number | null
          updated_at?: string
          url?: string | null
          vault_google_business_listing_id?: string | null
          website?: string | null
        }
        Update: {
          ad_library_page_id?: string | null
          ad_status?: string | null
          address?: string | null
          ads_runner_completed?: boolean | null
          category?: string | null
          cover_photo_url?: string | null
          created_at?: string
          creation_date?: string | null
          email?: string | null
          facebook_advertising_active?: boolean | null
          facebook_id?: string | null
          follower_count?: number | null
          gender?: string | null
          id?: string
          is_business_page_active?: string | null
          like_count?: number | null
          links?: Json | null
          name?: string | null
          page_intro?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          rating?: string | null
          rating_count?: number | null
          updated_at?: string
          url?: string | null
          vault_google_business_listing_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_business_profi_vault_google_business_listin_fkey"
            columns: ["vault_google_business_listing_id"]
            isOneToOne: false
            referencedRelation: "vault_google_business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_business_url: {
        Row: {
          business_domain: string | null
          created_at: string
          facebook_url: string | null
          id: string
          profile_created: boolean | null
          profile_extracted: boolean | null
          search_successful: boolean | null
          title: string | null
          updated_at: string
          vault_google_business_listing_id: string | null
          vault_google_transparency_id: string | null
        }
        Insert: {
          business_domain?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          profile_created?: boolean | null
          profile_extracted?: boolean | null
          search_successful?: boolean | null
          title?: string | null
          updated_at?: string
          vault_google_business_listing_id?: string | null
          vault_google_transparency_id?: string | null
        }
        Update: {
          business_domain?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          profile_created?: boolean | null
          profile_extracted?: boolean | null
          search_successful?: boolean | null
          title?: string | null
          updated_at?: string
          vault_google_business_listing_id?: string | null
          vault_google_transparency_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_business_id_vault_google_business_listing_i_fkey"
            columns: ["vault_google_business_listing_id"]
            isOneToOne: false
            referencedRelation: "vault_google_business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_job_definitions: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          job_config: Json | null
          job_description: string | null
          job_name: string
          job_type: string
          scheduler_config: Json | null
          scheduler_type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          job_config?: Json | null
          job_description?: string | null
          job_name: string
          job_type: string
          scheduler_config?: Json | null
          scheduler_type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          job_config?: Json | null
          job_description?: string | null
          job_name?: string
          job_type?: string
          scheduler_config?: Json | null
          scheduler_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vault_facebook_job_execution_details: {
        Row: {
          api_calls_made: number | null
          execution_duration_seconds: number | null
          id: string
          log_level: string
          logged_at: string | null
          message: string
          metadata: Json | null
          performance_metrics: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          scheduled_job_id: string
        }
        Insert: {
          api_calls_made?: number | null
          execution_duration_seconds?: number | null
          id?: string
          log_level: string
          logged_at?: string | null
          message: string
          metadata?: Json | null
          performance_metrics?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          scheduled_job_id: string
        }
        Update: {
          api_calls_made?: number | null
          execution_duration_seconds?: number | null
          id?: string
          log_level?: string
          logged_at?: string | null
          message?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          scheduled_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_job_execution_details_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_facebook_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_job_queue: {
        Row: {
          completed_at: string | null
          id: string
          priority: number | null
          processing_metadata: Json | null
          queue_status: string | null
          queued_at: string | null
          scheduled_job_id: string
          started_processing_at: string | null
          worker_instance_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          priority?: number | null
          processing_metadata?: Json | null
          queue_status?: string | null
          queued_at?: string | null
          scheduled_job_id: string
          started_processing_at?: string | null
          worker_instance_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          priority?: number | null
          processing_metadata?: Json | null
          queue_status?: string | null
          queued_at?: string | null
          scheduled_job_id?: string
          started_processing_at?: string | null
          worker_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_job_queue_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: true
            referencedRelation: "vault_facebook_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_facebook_scheduled_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_config: Json | null
          job_definition_id: string
          max_retries: number | null
          next_run_at: string | null
          queued_at: string | null
          retry_count: number | null
          scheduled_for: string
          started_at: string | null
          status: string | null
          trigger_type: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_config?: Json | null
          job_definition_id: string
          max_retries?: number | null
          next_run_at?: string | null
          queued_at?: string | null
          retry_count?: number | null
          scheduled_for: string
          started_at?: string | null
          status?: string | null
          trigger_type?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_config?: Json | null
          job_definition_id?: string
          max_retries?: number | null
          next_run_at?: string | null
          queued_at?: string | null
          retry_count?: number | null
          scheduled_for?: string
          started_at?: string | null
          status?: string | null
          trigger_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_facebook_scheduled_jobs_job_definition_id_fkey"
            columns: ["job_definition_id"]
            isOneToOne: false
            referencedRelation: "vault_facebook_job_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_business_listings: {
        Row: {
          additional_categories: string | null
          address: string | null
          address_info_address: string | null
          address_info_borough: string | null
          address_info_city: string | null
          address_info_country_code: string | null
          address_info_region: string | null
          address_info_zip: string | null
          attributes: string | null
          business_domain: string | null
          category: string | null
          category_2: string | null
          category_3: string | null
          category_4: string | null
          category_5: string | null
          category_6: string | null
          category_7: string | null
          category_8: string | null
          category_ids: string | null
          check_url: string | null
          cid: string | null
          contacts: string | null
          created: string
          description: string | null
          domain: string | null
          feature_id: string | null
          function_vault_google_transparency_id: boolean | null
          google_transparency_id_searched: boolean | null
          id: string
          is_claimed: string | null
          last_record_cleaning: string | null
          latitude: string | null
          local_business_links: string | null
          logo: string | null
          longitude: string | null
          main_image: string | null
          original_title: string | null
          people_also_search: string | null
          phone: string | null
          place_id: string | null
          place_topics: string | null
          popular_times: string | null
          price_level: string | null
          rating_distribution: string | null
          rating_rating_max: string | null
          rating_rating_type: string | null
          rating_value: string | null
          rating_votes_count: string | null
          snippet: string | null
          time_update: string | null
          title: string | null
          total_photos: string | null
          url: string | null
          work_time: string | null
        }
        Insert: {
          additional_categories?: string | null
          address?: string | null
          address_info_address?: string | null
          address_info_borough?: string | null
          address_info_city?: string | null
          address_info_country_code?: string | null
          address_info_region?: string | null
          address_info_zip?: string | null
          attributes?: string | null
          business_domain?: string | null
          category?: string | null
          category_2?: string | null
          category_3?: string | null
          category_4?: string | null
          category_5?: string | null
          category_6?: string | null
          category_7?: string | null
          category_8?: string | null
          category_ids?: string | null
          check_url?: string | null
          cid?: string | null
          contacts?: string | null
          created?: string
          description?: string | null
          domain?: string | null
          feature_id?: string | null
          function_vault_google_transparency_id?: boolean | null
          google_transparency_id_searched?: boolean | null
          id?: string
          is_claimed?: string | null
          last_record_cleaning?: string | null
          latitude?: string | null
          local_business_links?: string | null
          logo?: string | null
          longitude?: string | null
          main_image?: string | null
          original_title?: string | null
          people_also_search?: string | null
          phone?: string | null
          place_id?: string | null
          place_topics?: string | null
          popular_times?: string | null
          price_level?: string | null
          rating_distribution?: string | null
          rating_rating_max?: string | null
          rating_rating_type?: string | null
          rating_value?: string | null
          rating_votes_count?: string | null
          snippet?: string | null
          time_update?: string | null
          title?: string | null
          total_photos?: string | null
          url?: string | null
          work_time?: string | null
        }
        Update: {
          additional_categories?: string | null
          address?: string | null
          address_info_address?: string | null
          address_info_borough?: string | null
          address_info_city?: string | null
          address_info_country_code?: string | null
          address_info_region?: string | null
          address_info_zip?: string | null
          attributes?: string | null
          business_domain?: string | null
          category?: string | null
          category_2?: string | null
          category_3?: string | null
          category_4?: string | null
          category_5?: string | null
          category_6?: string | null
          category_7?: string | null
          category_8?: string | null
          category_ids?: string | null
          check_url?: string | null
          cid?: string | null
          contacts?: string | null
          created?: string
          description?: string | null
          domain?: string | null
          feature_id?: string | null
          function_vault_google_transparency_id?: boolean | null
          google_transparency_id_searched?: boolean | null
          id?: string
          is_claimed?: string | null
          last_record_cleaning?: string | null
          latitude?: string | null
          local_business_links?: string | null
          logo?: string | null
          longitude?: string | null
          main_image?: string | null
          original_title?: string | null
          people_also_search?: string | null
          phone?: string | null
          place_id?: string | null
          place_topics?: string | null
          popular_times?: string | null
          price_level?: string | null
          rating_distribution?: string | null
          rating_rating_max?: string | null
          rating_rating_type?: string | null
          rating_value?: string | null
          rating_votes_count?: string | null
          snippet?: string | null
          time_update?: string | null
          title?: string | null
          total_photos?: string | null
          url?: string | null
          work_time?: string | null
        }
        Relationships: []
      }
      vault_google_library_advertisers: {
        Row: {
          active: boolean | null
          advertiser_settings: Json | null
          advertiser_type: string
          business_domain: string | null
          created_at: string | null
          former_customer: string | null
          google_business_listing_id: string | null
          google_transparency_id: string | null
          id: string
          industry: string | null
          location: string | null
          name: string
          parent_advertiser_id: string | null
          source_transparency_record_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          advertiser_settings?: Json | null
          advertiser_type: string
          business_domain?: string | null
          created_at?: string | null
          former_customer?: string | null
          google_business_listing_id?: string | null
          google_transparency_id?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          parent_advertiser_id?: string | null
          source_transparency_record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          advertiser_settings?: Json | null
          advertiser_type?: string
          business_domain?: string | null
          created_at?: string | null
          former_customer?: string | null
          google_business_listing_id?: string | null
          google_transparency_id?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          parent_advertiser_id?: string | null
          source_transparency_record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_advertisers_google_business_listing_fkey"
            columns: ["google_business_listing_id"]
            isOneToOne: false
            referencedRelation: "vault_google_business_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_advertisers_parent_advertiser_id_fkey"
            columns: ["parent_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_advertisers_source_transparency_fkey"
            columns: ["source_transparency_record_id"]
            isOneToOne: false
            referencedRelation: "vault_google_transparency_id"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_competitors: {
        Row: {
          active: boolean | null
          competition_level: string | null
          competitor_advertiser_id: string
          created_at: string | null
          id: string
          industry_segment: string | null
          location: string
          primary_advertiser_id: string
          relationship_end: string | null
          relationship_start: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          competition_level?: string | null
          competitor_advertiser_id: string
          created_at?: string | null
          id?: string
          industry_segment?: string | null
          location: string
          primary_advertiser_id: string
          relationship_end?: string | null
          relationship_start?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          competition_level?: string | null
          competitor_advertiser_id?: string
          created_at?: string | null
          id?: string
          industry_segment?: string | null
          location?: string
          primary_advertiser_id?: string
          relationship_end?: string | null
          relationship_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_competitors_competitor_advertiser_id_fkey"
            columns: ["competitor_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_competitors_primary_advertiser_id_fkey"
            columns: ["primary_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_extracted_creative_media: {
        Row: {
          duration: string | null
          extracted_at: string | null
          extraction_metadata: Json | null
          file_format: string | null
          file_size_bytes: number | null
          google_ads_creative_id: string
          height: number | null
          id: string
          media_type: string
          original_url: string
          scheduled_job_id: string
          storage_path: string | null
          width: number | null
        }
        Insert: {
          duration?: string | null
          extracted_at?: string | null
          extraction_metadata?: Json | null
          file_format?: string | null
          file_size_bytes?: number | null
          google_ads_creative_id: string
          height?: number | null
          id?: string
          media_type: string
          original_url: string
          scheduled_job_id: string
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          duration?: string | null
          extracted_at?: string | null
          extraction_metadata?: Json | null
          file_format?: string | null
          file_size_bytes?: number | null
          google_ads_creative_id?: string
          height?: number | null
          id?: string
          media_type?: string
          original_url?: string
          scheduled_job_id?: string
          storage_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_extracted_crea_google_ads_creative_id_fkey"
            columns: ["google_ads_creative_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_google_ads_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_extracted_creative_m_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_google_ads_accounts: {
        Row: {
          account_name: string
          active: boolean | null
          advertiser_id: string
          created_at: string | null
          first_ad_date: string | null
          google_advertiser_id: string
          id: string
          last_ad_date: string | null
          last_synced: string | null
          total_creatives: number | null
          total_display_ads: number | null
          total_search_ads: number | null
          total_video_ads: number | null
          unique_domains: number | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          active?: boolean | null
          advertiser_id: string
          created_at?: string | null
          first_ad_date?: string | null
          google_advertiser_id: string
          id?: string
          last_ad_date?: string | null
          last_synced?: string | null
          total_creatives?: number | null
          total_display_ads?: number | null
          total_search_ads?: number | null
          total_video_ads?: number | null
          unique_domains?: number | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          active?: boolean | null
          advertiser_id?: string
          created_at?: string | null
          first_ad_date?: string | null
          google_advertiser_id?: string
          id?: string
          last_ad_date?: string | null
          last_synced?: string | null
          total_creatives?: number | null
          total_display_ads?: number | null
          total_search_ads?: number | null
          total_video_ads?: number | null
          unique_domains?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_google_ads_accounts_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_google_ads_creatives: {
        Row: {
          ad_type: string
          created_at: string | null
          creative_metadata: Json | null
          creative_url: string | null
          first_shown: number | null
          format: string
          google_ads_account_id: string
          google_ads_raw_response_id: string
          google_creative_id: string
          id: string
          last_shown: number | null
          processing_status: string | null
          scheduled_job_id: string
          target_domain: string | null
          updated_at: string | null
        }
        Insert: {
          ad_type: string
          created_at?: string | null
          creative_metadata?: Json | null
          creative_url?: string | null
          first_shown?: number | null
          format: string
          google_ads_account_id: string
          google_ads_raw_response_id: string
          google_creative_id: string
          id?: string
          last_shown?: number | null
          processing_status?: string | null
          scheduled_job_id: string
          target_domain?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_type?: string
          created_at?: string | null
          creative_metadata?: Json | null
          creative_url?: string | null
          first_shown?: number | null
          format?: string
          google_ads_account_id?: string
          google_ads_raw_response_id?: string
          google_creative_id?: string
          id?: string
          last_shown?: number | null
          processing_status?: string | null
          scheduled_job_id?: string
          target_domain?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_google_ads_crea_google_ads_account_id_fkey"
            columns: ["google_ads_account_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_google_ads_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_google_ads_creatives_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_google_ads_google_ads_raw_response_id_fkey"
            columns: ["google_ads_raw_response_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_google_ads_raw_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_google_ads_raw_responses: {
        Row: {
          collected_at: string | null
          endpoint_called: string
          google_ads_account_id: string
          id: string
          raw_data: Json
          response_size_bytes: number | null
          response_type: string | null
          scheduled_job_id: string
        }
        Insert: {
          collected_at?: string | null
          endpoint_called: string
          google_ads_account_id: string
          id?: string
          raw_data: Json
          response_size_bytes?: number | null
          response_type?: string | null
          scheduled_job_id: string
        }
        Update: {
          collected_at?: string | null
          endpoint_called?: string
          google_ads_account_id?: string
          id?: string
          raw_data?: Json
          response_size_bytes?: number | null
          response_type?: string | null
          scheduled_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_google_ads_raw__google_ads_account_id_fkey"
            columns: ["google_ads_account_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_google_ads_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_google_ads_raw_respo_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_job_definitions: {
        Row: {
          active: boolean | null
          created_at: string | null
          cron_expression: string
          default_config: Json | null
          description: string | null
          display_name: string
          execution_order: number | null
          frequency: string
          id: string
          includes_media_extraction: boolean | null
          package_id: string
          service_name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          cron_expression: string
          default_config?: Json | null
          description?: string | null
          display_name: string
          execution_order?: number | null
          frequency: string
          id?: string
          includes_media_extraction?: boolean | null
          package_id: string
          service_name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          cron_expression?: string
          default_config?: Json | null
          description?: string | null
          display_name?: string
          execution_order?: number | null
          frequency?: string
          id?: string
          includes_media_extraction?: boolean | null
          package_id?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_job_definitions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_job_execution_details: {
        Row: {
          api_calls_made: number | null
          execution_duration_seconds: number | null
          id: string
          log_level: string
          logged_at: string | null
          message: string
          metadata: Json | null
          performance_metrics: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          scheduled_job_id: string
        }
        Insert: {
          api_calls_made?: number | null
          execution_duration_seconds?: number | null
          id?: string
          log_level: string
          logged_at?: string | null
          message: string
          metadata?: Json | null
          performance_metrics?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          scheduled_job_id: string
        }
        Update: {
          api_calls_made?: number | null
          execution_duration_seconds?: number | null
          id?: string
          log_level?: string
          logged_at?: string | null
          message?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          scheduled_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_job_execution_detail_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_job_queue: {
        Row: {
          completed_at: string | null
          id: string
          priority: number | null
          processing_metadata: Json | null
          queue_status: string | null
          queued_at: string | null
          scheduled_job_id: string
          started_processing_at: string | null
          worker_instance_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          priority?: number | null
          processing_metadata?: Json | null
          queue_status?: string | null
          queued_at?: string | null
          scheduled_job_id: string
          started_processing_at?: string | null
          worker_instance_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          priority?: number | null
          processing_metadata?: Json | null
          queue_status?: string | null
          queued_at?: string | null
          scheduled_job_id?: string
          started_processing_at?: string | null
          worker_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_job_queue_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: true
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_job_scheduler: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          last_heartbeat: string | null
          scheduler_config: Json | null
          scheduler_name: string
          scheduler_type: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          scheduler_config?: Json | null
          scheduler_name: string
          scheduler_type?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          scheduler_config?: Json | null
          scheduler_name?: string
          scheduler_type?: string | null
        }
        Relationships: []
      }
      vault_google_library_package_assignments: {
        Row: {
          assigning_advertiser_id: string
          assignment_end: string | null
          assignment_reason: string | null
          assignment_start: string | null
          created_at: string | null
          custom_settings: Json | null
          id: string
          package_id: string
          status: string | null
          target_advertiser_id: string
          updated_at: string | null
        }
        Insert: {
          assigning_advertiser_id: string
          assignment_end?: string | null
          assignment_reason?: string | null
          assignment_start?: string | null
          created_at?: string | null
          custom_settings?: Json | null
          id?: string
          package_id: string
          status?: string | null
          target_advertiser_id: string
          updated_at?: string | null
        }
        Update: {
          assigning_advertiser_id?: string
          assignment_end?: string | null
          assignment_reason?: string | null
          assignment_start?: string | null
          created_at?: string | null
          custom_settings?: Json | null
          id?: string
          package_id?: string
          status?: string | null
          target_advertiser_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_package_assig_assigning_advertiser_id_fkey"
            columns: ["assigning_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_package_assignme_target_advertiser_id_fkey"
            columns: ["target_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_package_assignments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_packages: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          monthly_price: number | null
          name: string
          package_rules: Json | null
          target_advertiser_type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_price?: number | null
          name: string
          package_rules?: Json | null
          target_advertiser_type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_price?: number | null
          name?: string
          package_rules?: Json | null
          target_advertiser_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vault_google_library_scheduled_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_config: Json | null
          job_definition_id: string
          max_retries: number | null
          next_run_at: string | null
          package_assignment_id: string
          queued_at: string | null
          retry_count: number | null
          scheduled_for: string
          scheduler_id: string
          started_at: string | null
          status: string | null
          target_advertiser_id: string
          trigger_type: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_config?: Json | null
          job_definition_id: string
          max_retries?: number | null
          next_run_at?: string | null
          package_assignment_id: string
          queued_at?: string | null
          retry_count?: number | null
          scheduled_for: string
          scheduler_id: string
          started_at?: string | null
          status?: string | null
          target_advertiser_id: string
          trigger_type?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_config?: Json | null
          job_definition_id?: string
          max_retries?: number | null
          next_run_at?: string | null
          package_assignment_id?: string
          queued_at?: string | null
          retry_count?: number | null
          scheduled_for?: string
          scheduler_id?: string
          started_at?: string | null
          status?: string | null
          target_advertiser_id?: string
          trigger_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_scheduled_jobs_job_definition_id_fkey"
            columns: ["job_definition_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_job_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_scheduled_jobs_package_assignment_id_fkey"
            columns: ["package_assignment_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_package_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_scheduled_jobs_scheduler_id_fkey"
            columns: ["scheduler_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_job_scheduler"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_scheduled_jobs_target_advertiser_id_fkey"
            columns: ["target_advertiser_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_library_serpapi_search_logs: {
        Row: {
          ads_found: number | null
          api_endpoint: string | null
          created_at: string | null
          duplicates_skipped: number | null
          google_ads_raw_response_id: string | null
          id: string
          new_ads_found: number | null
          page_number: number
          results_count: number | null
          scheduled_job_id: string
          search_parameters: Json | null
          search_status: string | null
          serpapi_search_id: string
          total_time_taken: number | null
          updated_at: string | null
        }
        Insert: {
          ads_found?: number | null
          api_endpoint?: string | null
          created_at?: string | null
          duplicates_skipped?: number | null
          google_ads_raw_response_id?: string | null
          id?: string
          new_ads_found?: number | null
          page_number: number
          results_count?: number | null
          scheduled_job_id: string
          search_parameters?: Json | null
          search_status?: string | null
          serpapi_search_id: string
          total_time_taken?: number | null
          updated_at?: string | null
        }
        Update: {
          ads_found?: number | null
          api_endpoint?: string | null
          created_at?: string | null
          duplicates_skipped?: number | null
          google_ads_raw_response_id?: string | null
          id?: string
          new_ads_found?: number | null
          page_number?: number
          results_count?: number | null
          scheduled_job_id?: string
          search_parameters?: Json | null
          search_status?: string | null
          serpapi_search_id?: string
          total_time_taken?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_serpapi_se_google_ads_raw_response_id_fkey"
            columns: ["google_ads_raw_response_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_google_ads_raw_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_google_library_serpapi_search_logs_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_google_transparency_id: {
        Row: {
          business_domain: string
          created_at: string
          facebook_discovery_processed: boolean | null
          google_business_listing_id: string
          google_transparency_id: string | null
          id: string
        }
        Insert: {
          business_domain: string
          created_at?: string
          facebook_discovery_processed?: boolean | null
          google_business_listing_id: string
          google_transparency_id?: string | null
          id?: string
        }
        Update: {
          business_domain?: string
          created_at?: string
          facebook_discovery_processed?: boolean | null
          google_business_listing_id?: string
          google_transparency_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_transparency_id_google_business_listing_id_fkey"
            columns: ["google_business_listing_id"]
            isOneToOne: true
            referencedRelation: "vault_google_business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      scrapi_active_jobs_summary: {
        Row: {
          active_batches: number | null
          id: string | null
          job_type: string | null
          keyword_count: number | null
          last_batch_created: string | null
          name: string | null
          pending_queries: number | null
          schedule_count: number | null
        }
        Relationships: []
      }
      scrapi_active_oxylabs_schedules: {
        Row: {
          active: boolean | null
          created_at: string | null
          cron_expression: string | null
          deleted_at: string | null
          end_time: string | null
          id: string | null
          items_count: number | null
          job_id: string | null
          job_name: string | null
          last_synced_at: string | null
          management_status: string | null
          next_run_at: string | null
          oxylabs_schedule_id: string | null
          schedule_id: string | null
          schedule_name: string | null
          stats: Json | null
          success_rate: number | null
          total_jobs: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_job_performance_metrics: {
        Row: {
          avg_processing_time_ms: number | null
          failed_queries_24h: number | null
          id: string | null
          last_result_at: string | null
          name: string | null
          total_ads_found: number | null
          total_results_24h: number | null
        }
        Relationships: []
      }
      scrapi_operation_monitoring: {
        Row: {
          completed_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string | null
          job_id: string | null
          job_name: string | null
          max_retries: number | null
          next_retry_at: string | null
          operation_type: string | null
          processing_duration_seconds: number | null
          requested_at: string | null
          requested_by: string | null
          result: Json | null
          retry_count: number | null
          schedule_id: string | null
          schedule_name: string | null
          started_at: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrapi_oxylabs_batch_info: {
        Row: {
          batch_id: string | null
          batch_status: string | null
          completed_at: string | null
          completed_queries: number | null
          failed_queries: number | null
          job_name: string | null
          oxylabs_batch_id: string | null
          oxylabs_job_ids: string[] | null
          oxylabs_jobs_mapped: number | null
          submitted_at: string | null
          submitted_queries: number | null
          total_queries: number | null
        }
        Relationships: []
      }
      scrapi_oxylabs_schedule_overview: {
        Row: {
          active: boolean | null
          created_at: string | null
          cron_expression: string | null
          deleted_at: string | null
          end_time: string | null
          id: string | null
          items_count: number | null
          job_id: string | null
          job_name: string | null
          last_synced_at: string | null
          management_status: string | null
          next_run_at: string | null
          oxylabs_schedule_id: string | null
          schedule_id: string | null
          schedule_name: string | null
          stats: Json | null
          success_rate: number | null
          total_jobs: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_active_jobs_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_performance_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scrapi_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrapi_oxylabs_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "scrapi_job_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      v_missing_advertisers_audit: {
        Row: {
          audit_timestamp: string | null
          business_domain: string | null
          created_at: string | null
          facebook_discovery_processed: boolean | null
          google_business_listing_id: string | null
          google_transparency_id: string | null
          missing_from_library: boolean | null
          transparency_record_id: string | null
        }
        Relationships: []
      }
      vault_google_library_media_extraction_validation: {
        Row: {
          id: string | null
          includes_media_extraction: boolean | null
          scheduled_job_id: string | null
          validation_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_google_library_extracted_creative_m_scheduled_job_id_fkey"
            columns: ["scheduled_job_id"]
            isOneToOne: false
            referencedRelation: "vault_google_library_scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      audit_missing_advertisers: {
        Args: Record<PropertyKey, never>
        Returns: {
          transparency_record_id: string
          business_domain: string
          google_transparency_id: string
          google_business_listing_id: string
          created_at: string
          facebook_discovery_processed: boolean
          missing_from_library: boolean
          audit_timestamp: string
        }[]
      }
      audit_missing_advertisers_by_domain: {
        Args: { domain_pattern?: string }
        Returns: {
          transparency_record_id: string
          business_domain: string
          google_transparency_id: string
          created_at: string
          audit_timestamp: string
        }[]
      }
      audit_missing_advertisers_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_transparency_records: number
          total_library_advertisers: number
          transparency_records_with_advertisers: number
          missing_advertiser_records: number
          missing_percentage: number
          audit_timestamp: string
        }[]
      }
      extract_domain: {
        Args: { input_url: string }
        Returns: string
      }
      get_campaign_keyword_counts: {
        Args: { campaign_id: string }
        Returns: {
          keyword_count: number
          negative_keyword_count: number
        }[]
      }
      is_domain_banned: {
        Args: { input_domain: string }
        Returns: boolean
      }
      move_due_jobs_to_queue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      schedule_monthly_transparency_jobs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      schedule_next_facebook_ads_job: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      scrapi_calculate_next_run: {
        Args: {
          p_cron_expression: string
          p_timezone?: string
          p_after_timestamp?: string
        }
        Returns: string
      }
      scrapi_check_oxylabs_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_schedules: number
          active_schedules: number
          unmanaged_schedules: number
          total_jobs_24h: number
          avg_success_rate: number
        }[]
      }
      scrapi_complete_operation: {
        Args: {
          p_operation_id: string
          p_success: boolean
          p_error_message?: string
        }
        Returns: undefined
      }
      scrapi_create_job_batch: {
        Args: { p_job_id: string; p_schedule_id?: string }
        Returns: string
      }
      scrapi_create_job_with_keywords: {
        Args: {
          p_job_name: string
          p_job_type: string
          p_keywords: string[]
          p_locations?: string[]
          p_schedule_cron?: string
        }
        Returns: string
      }
      scrapi_get_job_status: {
        Args: { p_job_id: string }
        Returns: {
          job_name: string
          total_keywords: number
          active_batches: number
          pending_queries: number
          completed_queries: number
          failed_queries: number
          last_run: string
          next_run: string
        }[]
      }
      scrapi_get_next_pending_operation: {
        Args: Record<PropertyKey, never>
        Returns: {
          operation_id: string
          oxylabs_schedule_id: string
          operation_type: string
          operation_data: Json
          retry_count: number
        }[]
      }
      scrapi_queue_schedule_operation: {
        Args: {
          p_schedule_id: string
          p_operation_type: string
          p_requested_by?: string
          p_operation_data?: Json
        }
        Returns: string
      }
      scrapi_start_operation: {
        Args: { p_operation_id: string }
        Returns: boolean
      }
      sync_facebook_advertising_businesses: {
        Args: Record<PropertyKey, never>
        Returns: {
          synced_count: number
          new_businesses: number
          updated_businesses: number
        }[]
      }
    }
    Enums: {
      campaign_type_enum: "advertiser" | "market"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campaign_type_enum: ["advertiser", "market"],
    },
  },
} as const
