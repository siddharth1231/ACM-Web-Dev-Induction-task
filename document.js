document.getElementById('applicant-form').addEventListener('submit', addApplicant);

let applicants = [];

function addApplicant(e) {
    e.preventDefault();
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let position = document.getElementById('position').value.trim();

    if (!name || !email || !position) {
        alert('Please fill in all fields.');
        return;
    }

    let emailExists = applicants.some(applicant => applicant.email === email);

    if (emailExists) {
        alert('An applicant with this email already exists.');
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
    document.getElementById('applicant-form').reset();
}


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

    updateDashboard();  
}


function updateDashboard() {
    let uniqueEmails = new Set(applicants.map(applicant => applicant.email));
    document.getElementById('total-applicants').innerText = uniqueEmails.size;

    let interviewsScheduledEmails = new Set(
        applicants
            .filter(applicant => applicant.status.includes('Interview scheduled'))
            .map(applicant => applicant.email)
    );
    document.getElementById('interviews-scheduled').innerText = interviewsScheduledEmails.size;

    let pendingFeedbackEmails = new Set(
        applicants
            .filter(applicant => applicant.status === 'Interview Complete, Pending Feedback')
            .map(applicant => applicant.email)
    );
    document.getElementById('feedback-pending').innerText = pendingFeedbackEmails.size;

    let interviewsCompletedEmails = new Set(
        applicants
            .filter(applicant => applicant.status.includes('Feedback received'))
            .map(applicant => applicant.email)
    );
    document.getElementById('completed').innerText = interviewsCompletedEmails.size;

    let interviewsPendingEmails = new Set(
        applicants
            .filter(applicant =>applicant.status.includes('Pending Interview'))
            .map(applicant => applicant.email)
    );

    document.getElementById('interviews-pending').innerText = interviewsPendingEmails.size;

    updateScheduleTable();
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

let selectedApplicantIndex = null;  

function openScheduleModal(index) {
    selectedApplicantIndex = index;
    document.getElementById('scheduleModal').style.display = 'block';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

function confirmScheduleInterview() {
    let interviewDate = document.getElementById('interview-date').value;

    if (!interviewDate) {
        alert('Please select a date.');
        return;
    }

    let formattedDate = new Date(interviewDate).toDateString();

    updateApplicantStatus(selectedApplicantIndex, `Interview scheduled for ${formattedDate}`);
    closeScheduleModal();  
}

function markInterviewComplete(index) {
    if (applicants[index].status.includes('Interview scheduled')) {
        updateApplicantStatus(index, 'Interview Complete, Pending Feedback');
    } else {
        alert('Interview must be scheduled before it can be marked as completed.');
    }
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
    updateApplicantTable();
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}
