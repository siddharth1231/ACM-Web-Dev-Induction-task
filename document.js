document.getElementById('applicant-form').addEventListener('submit', addApplicant);

let applicants = [];

function addApplicant(e) {
    e.preventDefault();

    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let position = document.getElementById('position').value.trim();

    // Check for empty fields
    if (!name || !email || !position) {
        alert('Please fill in all fields.');
        return;
    }

    // Check if the email already exists
    let emailExists = applicants.some(applicant => applicant.email === email);

    if (emailExists) {
        alert('An applicant with this email already exists.');
        // Reset the form in case of duplicate email to clear the input fields
        document.getElementById('applicant-form').reset();
        return;
    }

    let applicant = {
        name: name,
        email: email,
        position: position,
        status: 'Pending Interview'
    };

    applicants.push(applicant);
    updateApplicantTable();

    // Reset the form after successful submission
    document.getElementById('applicant-form').reset();
}


// Function to update applicant data
function updateApplicantTable() {
    let tableBody = document.querySelector('#applicant-table tbody');
    tableBody.innerHTML = '';

    let displayedEmails = new Set();

    applicants.forEach((applicant, index) => {
        if (!displayedEmails.has(applicant.email)) {
            let row = `<tr>
                <td>${applicant.name}</td>
                <td>${applicant.email}</td>
                <td>${applicant.position}</td>
                <td>${applicant.status}</td>
                <td>
                    <button onclick="openScheduleModal(${index})">Schedule</button>
                    <button onclick="markInterviewComplete(${index})">Completed</button>
                    <button onclick="collectFeedback(${index})">Feedback</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;

            displayedEmails.add(applicant.email);
        }
    });

    updateDashboard();  // Update the dashboard when applicants are updated
}

// Update dashboard counts
function updateDashboard() {
    // Create a Set of unique emails
    let uniqueEmails = new Set(applicants.map(applicant => applicant.email));

    // Total unique applicants
    document.getElementById('total-applicants').innerText = uniqueEmails.size;

    // Interviews Scheduled (unique emails)
    let interviewsScheduledEmails = new Set(
        applicants
            .filter(applicant => applicant.status.includes('Interview scheduled'))
            .map(applicant => applicant.email)
    );
    document.getElementById('interviews-scheduled').innerText = interviewsScheduledEmails.size;

    // Pending Feedback (unique emails)
    let pendingFeedbackEmails = new Set(
        applicants
            .filter(applicant => applicant.status === 'Interview Complete, Pending Feedback')
            .map(applicant => applicant.email)
    );
    document.getElementById('feedback-pending').innerText = pendingFeedbackEmails.size;

    // Interviews Completed (those with feedback received or pending feedback)
    let interviewsCompletedEmails = new Set(
        applicants
            .filter(applicant => applicant.status.includes('Feedback received'))
            .map(applicant => applicant.email)
    );
    document.getElementById('completed').innerText = interviewsCompletedEmails.size;

    // Interviews Pending (those with "Interview scheduled" but not completed)
    let interviewsPendingEmails = new Set(
        applicants
            .filter(applicant =>applicant.status.includes('Pending Interview'))
            .map(applicant => applicant.email)
    );

    document.getElementById('interviews-pending').innerText = interviewsPendingEmails.size;

    // Update the scheduled interviews section
    updateScheduleTable();

    // Update the feedback reports section
    updateReportsTable();
}

function updateScheduleTable() {
    let tableBody = document.querySelector('#schedule-table tbody');
    tableBody.innerHTML = '';

    applicants.filter(applicant => applicant.status.includes('Interview scheduled')).forEach(applicant => {
        let row = `<tr>
            <td>${applicant.name}</td>
            <td>${applicant.email}</td>
            <td>${applicant.position}</td>
            <td>${applicant.status}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function updateReportsTable() {
    let tableBody = document.querySelector('#reports-table tbody');
    tableBody.innerHTML = '';

    applicants.filter(applicant => applicant.status.includes('Feedback received')).forEach(applicant => {
        let row = `<tr>
            <td>${applicant.name}</td>
            <td>${applicant.email}</td>
            <td>${applicant.position}</td>
            <td>${applicant.status.split(': ')[1]}</td> <!-- Extract feedback -->
        </tr>`;
        tableBody.innerHTML += row;
    });
}

let selectedApplicantIndex = null;  // Store the index of the applicant being scheduled

function openScheduleModal(index) {
    selectedApplicantIndex = index;  // Set the selected applicant's index
    document.getElementById('scheduleModal').style.display = 'block';  // Open the modal
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';  // Close the modal
}

function confirmScheduleInterview() {
    let interviewDate = document.getElementById('interview-date').value;

    if (!interviewDate) {
        alert('Please select a date.');
        return;
    }

    // Convert date to a readable format
    let formattedDate = new Date(interviewDate).toDateString();

    // Update the status for the selected applicant
    updateApplicantStatus(selectedApplicantIndex, `Interview scheduled for ${formattedDate}`);

    closeScheduleModal();  // Close the modal after scheduling
}

function markInterviewComplete(index) {
    // Ensure interview is scheduled before marking it as completed
    if (applicants[index].status.includes('Interview scheduled')) {
        updateApplicantStatus(index, 'Interview Complete, Pending Feedback');
    } else {
        alert('Interview must be scheduled before it can be marked as completed.');
    }
}

function sendReminderEmail(email, interviewDate) {
    console.log(`Sending reminder email to ${email} for the interview on ${interviewDate}`);
    // You can integrate an email API here (like SendGrid or Mailgun) to actually send the email.
}

function collectFeedback(index) {
    if (applicants[index].status === 'Interview Complete, Pending Feedback') {
        let feedback = prompt(`Enter feedback for ${applicants[index].name}:`);

        if (feedback) {
            updateApplicantStatus(index, `Feedback received: ${feedback}`);
        } else {
            alert('Feedback cannot be empty.');
        }
    } else {
        alert('Interview must be completed before collecting feedback.');
    }
}


function updateApplicantStatus(index, status) {
    applicants[index].status = status;
    updateApplicantTable();  // Refresh the table after status change
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the requested section
    document.getElementById(sectionId).classList.remove('hidden');
}
