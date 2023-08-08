// Define variables to contain extracted data from confuguration.json
let jiraServerUrl;
let apiToken;
let issue_options; 
let project_options;
let assignee_options;
// extract data from configuration.json
fetch('./configuration.json')
  .then((response) => response.json())
  .then(data => {
    // access and save specific data from the JavaScript object.
    jiraServerUrl = data.jiraServerUrl;
    apiToken = data.apiToken;
    issue_options = data.IssueType;
    project_options = data.Project;
    assignee_options = data.AssigneeOptions;
    // Populate the dropdowns here for project, issue type, and assignee
    var IssueType = document.getElementById("IssueType");
    var Project = document.getElementById("Project");
    for (var x in issue_options) {
      IssueType.add(new Option(issue_options[x]));
    }
    for (var x in project_options) {
      Project.add(new Option(project_options[x]));
    }
    // populate dropdown for assignee only when project has been selected 
    Project.addEventListener('change', function () {
        const selectedProject = Project.value;
        if (selectedProject in assignee_options) {
            const Assignee = document.getElementById("Assignee");
            Assignee.innerHTML = ""; // Clear the existing options
            for (const option of assignee_options[selectedProject]) {
                Assignee.add(new Option(option));
            }
        }
    });
  })
  .catch(error => {
    console.error('Error fetching configuration:', error);
  });


// set-up for date button and calendar pop-up
var dateButton = document.getElementById('dateButton');
var calendarContainer = document.getElementById('calendarContainer');
dateButton.addEventListener('click', function() {
    calendarContainer.style.display = 'block';
});
// Hide the calendar when a date is selected and display the selected date
var datePicker = document.getElementById('datePicker');
datePicker.addEventListener('change', function() {
    var selectedDate = datePicker.value;
    dateButton.textContent = selectedDate;
    calendarContainer.style.display = 'none';
});

// when the form is submitted....
document.getElementById('jiraform').addEventListener('submit', function (event) {
  event.preventDefault();
  // extract project key from the project name. Ex: "HVM Jacksonville JIRA (AFOI)" -> "AFOI"  
  const projectName = document.getElementById('Project').value;
  const regex = /\(([^)]+)\)/;
  const projectKey = regex.exec(projectName)[1];
  
  const summary = document.getElementById('summary-box').value;
  const description = document.getElementById('description-box').value;
  const issueType = document.getElementById('IssueType').value;
  const Assignee = document.getElementById('Assignee').value;


  console.log(projectKey + "  " + summary + "   "+ description + "   "+ issueType);
  // Function to create an issue
  function createJiraIssue(projectKey, summary, description, issueType, Assignee) {
    return new Promise((resolve, reject) => {
      // Construct the request URL
      const url = `${jiraServerUrl}/issue/`;
      // Prepare the issue data in the required format
      const issueData = {
        fields: {
          project: {
            key: projectKey,
          },
          summary,
          description,
          issuetype: {
            name: issueType,
          },
          assignee: {
            name: Assignee,
          }
        },
      };
      // Create a new XMLHttpRequest object
      const xhr = new XMLHttpRequest();
      // Configure the request
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${apiToken}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      // Set up event handlers
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseData = JSON.parse(xhr.responseText);
          resolve(responseData);
        } else {
          reject(new Error('Request failed with status: ' + xhr.status));
        }
      };
      xhr.onerror = function () {
        reject(new Error('Request failed'));
      };
      // Send the request with the issue data as JSON string
      xhr.send(JSON.stringify(issueData));
    });
  }
  // Call the function to create the issue
  createJiraIssue(projectKey, summary, description, issueType, Assignee)
    .then(data => {
      console.log('New issue created:', data);
      alert('New issue created successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error creating the issue. Please check the console for details.');
    });
});
