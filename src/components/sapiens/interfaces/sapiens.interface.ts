export interface SapiensAuthResponse {
  access_token: string;
  token_type: string;
}

export interface SapiensQuoteRequest {
  date: string;
  cmdy: string;
  origin: string;
  destination: string;
  type_flag?: string;
}

export interface SapiensQuoteResponse {
  predictions?: {
    specific_date_prediction: {
      date: string;
      predicted_freight: number;
    };
    horizon_predictions: Array<{
      date: string;
      predicted_freight: number;
    }>;
    additional_info: {
      distance: number;
      duration: number;
      monthly_total: number;
    };
    antt: {
      version: string;
      inputs: {
        distance_km: number;
        axle_input: number;
        volume_input_tons: number;
        cargo_type_input: string;
      };
      user_result: {
        axle: number;
        volume_input: number;
        ccd: number;
        cc: number;
        total: number;
        r_per_ton: number;
      };
      standard_result: Array<{
        axle: number;
        tons_media: number;
        ccd: number;
        cc: number;
        total: number;
        r_per_ton: number;
      }>;
      meta: {
        resolution_date: string;
        cargo_type: string;
        table: string;
      };
    };
  };
  // Campos diretos quando não vem dentro de predictions
  predictedFreight?: number;
  horizonPredictions?: Array<{
    date: string;
    predicted_freight: number;
  }>;
  distance?: number;
  duration?: number;
  monthlyTotal?: number;
  anttData?: {
    version: string;
    inputs: {
      distance_km: number;
      axle_input: number;
      volume_input_tons: number;
      cargo_type_input: string;
    };
    user_result: {
      axle: number;
      volume_input: number;
      ccd: number;
      cc: number;
      total: number;
      r_per_ton: number;
    };
    standard_result: Array<{
      axle: number;
      tons_media: number;
      ccd: number;
      cc: number;
      total: number;
      r_per_ton: number;
    }>;
    meta: {
      resolution_date: string;
      cargo_type: string;
      table: string;
    };
  };
}