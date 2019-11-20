let request = require('request');
let inquirer = require('inquirer');

let getCurrentHourAndDay = () => { 
	let currentHourAndDay = new Date().toLocaleTimeString('en-US', { hour: '2-digit', hour12: true, weekday: 'long' });
  let timeParts = currentHourAndDay.split(',');
  let time = timeParts[1].replace(/\s/g, '');
  let day = timeParts[0];
	return [day, time];
};

//return 10 records at a time
let findFoodTruckRecords = (foodTruckList, index, next=true) => {
  let results,
      finalTruckList;
  
	if(next === true) {
		if(index === 0) {
      results = foodTruckList.slice(index, 10);
		}
		else if(foodTruckList.length - index < 10) {
      results = foodTruckList.slice(index, foodTruckList.length);
		} else {
			results = foodTruckList.slice(index, index + 10);
		}
	}

   finalTruckList = results.map(({applicant, location}) => ({ Name : applicant, Address: location }));
   return finalTruckList;
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
  					]);
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
  						if(answers.seeNextList === true) {
                 count = count + 10;
                if(foodTruckList.length - count <= 0) {
                 console.log("No more trucks found");
                 return;
                } else {
                  let finalTruckList = findFoodTruckRecords(foodTruckList, count);
                  finalTruckList.sort((a, b) => a.Name.localeCompare(b.Name));
                  console.log(finalTruckList);
                  callConfirm(count, foodTruckList);
                }
  						}
  				})
}

//return all food trucks open when the program is run
  let getFoodTruckList = () => {
	let [day , time] = getCurrentHourAndDay();
	
	request(`https://data.sfgov.org/resource/jjew-r69b?DayOfWeekStr=${day}&starttime=${time}`, function (error, response, body) {
      if (error) {
        console.log("There is a problem in retreiving data,please try again.");
  		} else if(response.statusCode < 200 || response.statusCode >= 300) {
        console.log("There is a problem in retreiving data,please try again.");
  		} else {
        let foodTruckList = JSON.parse(body);
        if(foodTruckList.length === 0) {
          console.log("There is no food trucks available at this time, please try again later");
          return;
        }
        let count = 0;
        let finalTruckList = findFoodTruckRecords(foodTruckList, count);
        finalTruckList.sort((a, b) => a.Name.localeCompare(b.Name));
        console.log(finalTruckList);
        callConfirm(count, foodTruckList);  
  		}
	});
}

getFoodTruckList();

// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js