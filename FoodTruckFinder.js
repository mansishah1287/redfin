// to run locally, first install node and npm. then:
// $ npm install request
// $ npm install inquirer
// then run node FoodTruckFinder.js
let request = require("request");
let inquirer = require("inquirer");

/**
 * This method return current day and time
**/
const getCurrentHourAndDay = () => {
    let currentHourAndDay = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        hour12: true,
        weekday: "long"
    });
    let timeParts = currentHourAndDay.split(",");
    let time = timeParts[1].replace(/\s/g, "");
    let day = timeParts[0];
    return [day, time];
};

/**
 * This method return 10 new records with Name and address of the truck.
 * Sort the Name alphabetically.
 * @param {array} foodTruckList is an array of truck open at current time.
 * @param {number} index is the track number to send 10 new records every time this function is call.
 **/
const displayFoodTruckList = (foodTruckList, index) => {
    let available10Trucks,
        availableTruckList;

    if (foodTruckList.length - index < 10) {
        available10Trucks = foodTruckList.slice(index, foodTruckList.length);
    } else {
        available10Trucks = foodTruckList.slice(index, index + 10);
    }

    availableTruckList = available10Trucks.map(({
        applicant,
        location
    }) => ({
        Name: applicant,
        Address: location
    }));
    availableTruckList.sort((a, b) => a.Name.localeCompare(b.Name));
    console.log(availableTruckList);
}

/**
 * This Method prompt user to see next list of trucks if they are interested.
 * @param {array} foodTruckList is an array of truck open at current time.
 * @param {number} index is the track number to send 10 new records every time this function is call.
 **/
const callConfirm = async (foodTruckList, index) => {
    inquirer
        .prompt([{
            type: "confirm",
            name: "seeNextList",
            message: "Do you want to see next list of truck?",
            default: true
        }])
        .then(answers => {
            if (answers.seeNextList === true) {
                index = index + 10;
                if (foodTruckList.length - index <= 0) {
                    console.log("No more trucks found");
                    return;
                } else {
                    displayFoodTruckList(foodTruckList, index);
                    callConfirm(foodTruckList, index);
                }
            }
        })
}

/**
 * This method call the api with current day and time to get the list of trucks open at that time.
 * Then prompt the user if they want to see other trucks open at the same time.
 **/
const getFoodTruckList = () => {
    let [day, time] = getCurrentHourAndDay();

    request(`https://data.sfgov.org/resource/jjew-r69b?DayOfWeekStr=${day}&starttime=${time}`, function(error, response, body) {
        if (error) {
            console.log("There is a problem in retreiving data,please try again.");
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
            console.log("There is a problem in retreiving data,please try again.");
        } else {
            let foodTruckList = JSON.parse(body);
            if (foodTruckList.length === 0) {
                console.log("There is no food trucks available at this time, please try again later");
                return;
            }
            let index = 0;
            displayFoodTruckList(foodTruckList, index);
            callConfirm(foodTruckList, index);
        }
    });
}

getFoodTruckList();