let request = require('request');
let inquirer = require('inquirer');

let getCurrentHourAndDay = () => { 
	let currentHourAndDay = new Date().toLocaleTimeString([], { weekday: 'long', hour: '2-digit' });
	return currentHourAndDay.split(',');
};

//return 10 records at a time
let findFoodTruckRecords = (foodTruckList, index, next=true) => {
	console.log("index is " , index);
	if(next === true) {
		if(index === 0) {
			return foodTruckList.slice(index, 10);
		}
		else if(foodTruckList.length - index < 10) {
			return foodTruckList.slice(index, foodTruckList.length);
		} else {
			return foodTruckList.slice(index, index*2);
		}
		
	}
}

//call a prompt until user enter no
let callPrompt = (count, foodTruckList) => {
	console.log(count, foodTruckList.length);
	inquirer
  				.prompt([
  					{	type: "input",
  						name: 'seeNextList',
  						message: "Other available trucks"
  					}
  					])

  				.then(answers => {
  						// console.log(answers);
  				// 		count = count + 10
						// console.log(count);
						if(foodTruckList.length - count <= 0) {
							console.log("No more trucks found");
						} else {
							console.log(findFoodTruckRecords(foodTruckList, count).length);
						}
  						
  				})
}

async function callConfirm(count, foodTruckList) {
			inquirer
  				.prompt([
  					{	type: "confirm",
  						name: 'seeNextList',
  						message: "Do you want to see next list of truck?",
  						default: true
  					}
  					])
  				.then(answers => {
  						console.log(answers);
  						if(answers.seeNextList === true) {
  							callPrompt(count, foodTruckList);
  							count = count + 10
							console.log(count);
  							setTimeout(callConfirm, 5000, count, foodTruckList);
  							
  						}
  				})
}

//return all food trucks open when the program is run
let getFoodTruckList = function() {
	let timeParts = getCurrentHourAndDay();
	//let time = timeParts[1].replace(/\s/g, '');
	let time = "12PM";
	let day = timeParts[0];
	//console.log(time + " " + day);

	//console.log(`https://data.sfgov.org/resource/jjew-r69b.json?DayOfWeekStr=${day}&starttime=${time}`);
	request(`https://data.sfgov.org/resource/jjew-r69b?DayOfWeekStr=${day}&starttime=${time}`, function (error, response, body) {
  		// console.log(body);
  		if (error) {

  		} else if(response.status <= 204) {

  		} else {
  			let foodTruckList = JSON.parse(body);
  			// console.log(foodTruckList.length);
  			foodTruckList.sort((a, b) => a.applicant.localeCompare(b.applicant));
  			//console.log(foodTruckList);
  			console.log(foodTruckList.length);
  			// for(let i=0 ; i < foodTruckList.length ; i++) {
  			// 	let tenTrucksList = foodTruckList.slice(i, 9);
  			// 	console.log(tenTrucksList);
  			// }
  			let count = 0;
  			let results = findFoodTruckRecords(foodTruckList, count);
  			//let finalTruckListKeys = ['Applicant', 'Location'];
  			let finalTruckList = results.map(item => {
  				return {Name : item.applicant, Address: item.location};
  			});
  			console.log(finalTruckList);


  			callConfirm(count, foodTruckList);

			// inquirer
  	// 			.prompt([
  	// 				{	type: "confirm",
  	// 					name: 'seeNextList',
  	// 					message: "Do you want to see next list of truck?",
  	// 					default: true
  	// 				}
  	// 				])
  	// 			.then(answers => {
  	// 					console.log(answers);
  	// 					if(answers.seeNextList === true) {
  	// 						callPrompt(count, foodTruckList);

  	// 					}
  	// 			})


  			// inquirer
  			// 	.prompt([
  			// 		{	type: "input",
  			// 			name: 'seeNextList',
  			// 			message: "Do you want to see next list of truck?(Yes/No)",
  			// 			default: 'Yes'
  			// 		}
  			// 		])
  			// 	.then(answers => {
  			// 			console.log(answers);
  			// 			if(answers.seeNextList === 'Yes') {
  			// 				count = count + 10
  			// 				console.log(count);
  			// 				if(foodTruckList.length - count <= 0) {
  			// 					console.log("No more trucks found");
  			// 				} else {
  			// 					console.log(findFoodTruckRecords(foodTruckList, count).length);
  			// 				}
  			// 			}
  			// 	})



  			
  		}
	});
}

getFoodTruckList();

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js