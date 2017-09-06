import { ApiTick, ApiResponse } from './types/api';

const getTicksFromStaticJson = () => {
  const data: ApiResponse = require('../training_data/BTC-NEO.json');
  const json: Array<ApiTick> = data.result;
  return json;
};

export {
  getTicksFromStaticJson,
}