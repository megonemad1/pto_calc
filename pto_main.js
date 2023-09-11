

function compareOnClick(start_date_id, end_date_id, result_date_id) {
    const cb = (r) => createTableFromObject(result_date_id, r);
    format_pto_request(new Date(document.getElementById(start_date_id).value), new Date(document.getElementById(end_date_id).value), cb)

}

function format_pto_request(start_date, end_date, cb) {
    if (isNaN(start_date)) {
        cb("Please enter valid dates.");
    }
    if (isNaN(end_date)) {
        end_date = new Date(start_date)
    }
    console.log("start")
    // Make a web request to the JSON file (replace with the actual URL)
    fetch('https://www.gov.uk/bank-holidays.json')
        .then(response => response.json())
        .then(data => {
            // Access the "events" array and filter/count the dates
            const events = data["england-and-wales"]["events"];
            const filteredDates = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= start_date && eventDate <= end_date;
            });

            const bankholidaysInRange = filteredDates.length;

            // Calculate the difference in milliseconds
            const differenceInMilliseconds = end_date - start_date;

            // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
            const daysInRange = Math.ceil(differenceInMilliseconds / (24 * 60 * 60 * 1000)) + 1;

            // Initialize the count of days without weekends
            let daysWithoutWeekends = 0;
            let weekends = 0
            let first_working_day = null
            let last_working_day = null

            // Loop through each day in the range
            for (var i = 0; i < daysInRange; i++) {
                // Move to the day
                const currentDate = new Date(start_date);
                currentDate.setDate(start_date.getDate() + i)
                // Check if the current day is not a Saturday (6) or Sunday (0)
                if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
                    daysWithoutWeekends++;
                    if (first_working_day == null) {
                        first_working_day = new Date(currentDate);
                    }
                    last_working_day = new Date(currentDate);
                }
                else {
                    weekends++
                    console.log(currentDate)
                }
            }
            const daysWithoutWeekendsAndBankHolidays = daysWithoutWeekends - bankholidaysInRange

            console.log("run")

            cb({ first_working_day: first_working_day, last_working_day: last_working_day, working_days: daysWithoutWeekendsAndBankHolidays, hours: daysWithoutWeekendsAndBankHolidays * 7.5 })

        })
        .catch(error => {
            cb(`Error fetching JSON data. ${error}`);
        });

}

function createTableFromObject(elementId, obj) {
    const parentElement = document.getElementById(elementId);

    // Check if the parent element with the given ID exists
    if (!parentElement) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    // Create a table element
    const table = document.createElement('table');

    // Create table headers (table row)
    const headerRow = document.createElement('tr');
    const headerKeyCell = document.createElement('th');
    headerKeyCell.textContent = 'Key';
    const headerValueCell = document.createElement('th');
    headerValueCell.textContent = 'Value';
    headerRow.appendChild(headerKeyCell);
    headerRow.appendChild(headerValueCell);
    table.appendChild(headerRow);

    // Iterate through the object's key-value pairs
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Create a table row for each key-value pair
            const row = document.createElement('tr');

            // Create cells for the key and value
            const keyCell = document.createElement('td');
            keyCell.textContent = key;
            const valueCell = document.createElement('td');
            if (isDate(value))
                valueCell.textContent = formatDate(value);
            else
                valueCell.textContent = value;

            // Append cells to the row
            row.appendChild(keyCell);
            row.appendChild(valueCell);

            // Append the row to the table
            table.appendChild(row);
        }
    }
    // Insert the table as the first child of the parent element
    parentElement.insertBefore(table, parentElement.firstChild);
}

function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
}
function isDate(variable) {
    return variable instanceof Date;
}