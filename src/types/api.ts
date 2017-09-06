interface ApiTick {
  T: string;  
  O: number;
  H: number;
  L: number;
  C: number;
  V: number;
  BV: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  result: Array<ApiTick>
}

export {
  ApiTick,
  ApiResponse,
};