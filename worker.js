const axios = require('axios');

const winners = [];
const task = (code) =>{
	const paddedCode = code.toString().padStart(11, '0');
	const url = generateURL(paddedCode);
	axios.get(url)
			.then(() =>{
				winners.push(paddedCode);
				console.log(`Winner! - ${paddedCode}`);
			})
			.catch(e=>{
			
			})
};

async function run({FROM, TO, INCREMENT_CONSTANT}){
	let asyncTasks = [];
	for(let j = FROM; j <= TO; j += INCREMENT_CONSTANT){
		// Generate requests
		for(let i = 0; i < INCREMENT_CONSTANT; i++){
			asyncTasks.push(task(j + i));
		}
		await Promise.all(asyncTasks);
		
		// Clear tasks
		asyncTasks = [];
	}
	return winners;
}

exports.worker = async(req,res) =>{
	const { FROM, TO, INCREMENT_CONSTANT } = req.body;
	await run({FROM, TO, INCREMENT_CONSTANT});
	res.send({ winners, FROM, TO, INCREMENT_CONSTANT });
};
