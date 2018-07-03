const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = path.resolve('./db.json');


const MAX = 50000000000; // (10^11) / 2
const INCREMENT_CONSTANT = 200; // How many async tasks at a time
const WORKERS_COUNT = 20; // How many workers
const WORKER_SEGMENT_SIZE = 2000; // How many numbers will the worker try
const LAMBDA_URL = 'https://us-central1-osem-209109.cloudfunctions.net/osem-worker';

let winners = [];
let asyncWorkers = [];

async function invokeWorker(...args){
	const { data } = await axios.post(LAMBDA_URL,{ ...args });
	return data;
}

async function run(){
	const { count } = require(db);
	
	// For each number we have, increment i by the amount of workers times their segment in range
	for(let i = count; i <= MAX; i+= WORKERS_COUNT * WORKER_SEGMENT_SIZE ){
		
		// Prepare async call for each worker
		let FROM, TO;
		for(let workerIndex = 0; workerIndex <= WORKERS_COUNT; workerIndex++){
			FROM = i + WORKER_SEGMENT_SIZE * workerIndex;
			TO = FROM + WORKER_SEGMENT_SIZE;
			asyncWorkers.push(
					invokeWorker({
						FROM,
						TO,
						INCREMENT_CONSTANT
					})
			);
		}
		
		// Exec workers calls
		const [...rest] = await Promise.all(asyncWorkers);
		console.log(rest);
		
		// Dump results to DB
		
		// const { winners: fileWinners } = require(db);
		// const newFile = {
		// 	count: i + WORKERS_COUNT * WORKER_SEGMENT_SIZE,
		// 	winners: [].concat(fileWinners).concat(winners)
		// };
		//
		// await fs.writeFileSync(db, JSON.stringify(newFile));
		// console.log(`Dumped! count - ${i + WORKERS_COUNT * WORKER_SEGMENT_SIZE}`);
	}
}

run();