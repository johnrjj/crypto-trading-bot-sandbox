// const defaultCsv = '../training_data/06252017/BTC-ETH.csv';
// const csv = require('csvtojson');
// import { Candle } from './types/candle';

// let count = 0;
// let candles: Array<Candle> = [];

// const getCandlesFromCsv = (path: string = defaultCsv): Promise<Array<Candle>> => {
// 	return new Promise((accept, reject) => {
// 		csv()
// 			.fromFile(path)
// 			.on('json', (jsonObj) => {

// 				// throw out header...
// 				if (count === 0) {
// 					count++;
// 					return;
// 				}
// 				// { '[TimeStamp]': '8/14/2015 9:10:00 AM',
// 				// '[Open]': '0.00690000',
// 				// '[Close]': '0.00690000',
// 				// '[High]': '0.00690000',
// 				// '[Low]': '0.00690000',
// 				// '[Volume]': '0.37540654',
// 				// '[BaseVolume]': '0.00259030' }
// 				const c: Candle = {
// 					timestamp: jsonObj['[TimeStamp]'],
// 					open: parseFloat(jsonObj['[Close]']),
// 					close: parseFloat(jsonObj['[Close]']),
// 					high: parseFloat(jsonObj['[High]']),
// 					low: jsonObj['[Low]'],
// 					volume: jsonObj['[Volume]'],
// 					baseVolume: jsonObj['[BaseVolume]'],
// 					next: null,
// 					previous: null,
// 				};

// 				candles.push(c);

// 			})
// 			.on('done', (error) => {
// 				if (error) {
// 					reject(error);
// 				}
// 				console.log(`${candles.length} data points imported`);
// 				accept(candles);
// 			})
// 	});
// };

// export {
// 	getCandlesFromCsv,
// }