let students = JSON.parse(localStorage.getItem('students')) || {};
let courses = JSON.parse(localStorage.getItem('courses')) || {};

// DOM is loading when page opened.
document.addEventListener('DOMContentLoaded', function() {
    updateStudentsTable();
});

document.getElementById('createStudentForm').addEventListener('submit', function (event) {
    event.preventDefault(); 
    let studentName = document.getElementById('studentName').value;
    let studentNumber = parseInt(document.getElementById('studentNumber').value, 10);

    // adding student information
    const newStudent = { studentNumber, gpa: null };
    students[studentName] = newStudent;
    localStorage.setItem('students', JSON.stringify(students));

    // updating the students table
    updateStudentsTable();

    // resetting the form
    document.getElementById('createStudentForm').reset();
});

// filter students based on the input name
function filterStudentsByName() {
    const nameFilterValue = document.getElementById('studentNameFilter').value.toLowerCase();

    return Object.keys(students).filter(studentName => {
        return studentName.toLowerCase().includes(nameFilterValue); 
    });
}

// updating students table and calculate GPA
function updateStudentsTable() {
    const tableBody = document.querySelector('#studentTable tbody');
    tableBody.innerHTML = ''; 

    const filteredStudents = filterStudentsByName(); 

    filteredStudents.forEach(studentName => {
        const student = students[studentName];
        const row = document.createElement('tr');

        // calculating GPA
        let studentCourses = Object.keys(courses).filter(courseName => courses[courseName].students.includes(studentName));
        let totalGrades = 0;
        let gradeCount = 0;

        studentCourses.forEach(courseName => {
            const course = courses[courseName];
            if (course.grades && course.grades[studentName]) {
                const midtermGrade = course.grades[studentName].midterm;
                const finalGrade = course.grades[studentName].final;
                const overallGrade = (midtermGrade * 0.4) + (finalGrade * 0.6);
                totalGrades += overallGrade;
                gradeCount++;
            }
        });

        if (gradeCount > 0) {
            student.gpa = (totalGrades / gradeCount).toFixed(2);
        } else {
            student.gpa = 'N/A'; 
        }

        row.innerHTML = `
            <td>${studentName}</td>
            <td>${student.studentNumber}</td>
            <td>${student.gpa}</td>
            <td><button onclick="viewStudentCourses('${studentName}')">View Courses</button></td>
            <td><button onclick="deleteStudent('${studentName}')">Delete Student</button></td>  
        `;
        tableBody.appendChild(row);
    });
}

function deleteStudent(studentName) {
    // remove student from the students
    delete students[studentName];
    
    // removing the student from each course they are enrolled in
    for (let courseName in courses) {
        const course = courses[courseName];
        const studentIndex = course.students.indexOf(studentName);
        
        if (studentIndex !== -1) {
            // removing the student from the course's students list
            course.students.splice(studentIndex, 1);
            
            // removing the student's grades 
            delete course.grades[studentName];
        }
    }
    
    // saving the updated students and courses to localStorage
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // upğdating the students table after deletion
    updateStudentsTable();
}


function viewStudentCourses(studentName) {
    const courseDetailsSection = document.getElementById('courseDetailsSection');
    const courseDetailsTableBody = document.querySelector('#courseDetailsTable tbody');
    courseDetailsTableBody.innerHTML = ''; 

    // finding the courses the student is enrolled in
    let coursesEnrolled = Object.keys(courses).filter(courseName => courses[courseName].students.includes(studentName));

    if (coursesEnrolled.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = 'No courses enrolled';
        cell.colSpan = 5; 
        row.appendChild(cell);
        courseDetailsTableBody.appendChild(row);
    } else {
        coursesEnrolled.forEach(courseName => {
            const course = courses[courseName];
            const row = document.createElement('tr');
            const courseCell = document.createElement('td');
            courseCell.textContent = courseName;
            row.appendChild(courseCell);
            const midtermCell = document.createElement('td');
            const finalCell = document.createElement('td');
            const overallCell = document.createElement('td');
            const statusCell = document.createElement('td');
            if (course.grades && course.grades[studentName]) {
                const midtermGrade = course.grades[studentName].midterm;
                const finalGrade = course.grades[studentName].final;
                midtermCell.textContent = midtermGrade;
                finalCell.textContent = finalGrade;
                const overallGrade = (midtermGrade * 0.4) + (finalGrade * 0.6);
                overallCell.textContent = overallGrade.toFixed(2);
                if (overallGrade >= course.lowerPoint) {
                    statusCell.textContent = 'PASS';
                    statusCell.style.color = 'green';
                } else {
                    statusCell.textContent = 'FAIL';
                    statusCell.style.color = 'red';
                }
            } else {
                midtermCell.textContent = 'N/A';
                finalCell.textContent = 'N/A';
                overallCell.textContent = 'N/A';
                statusCell.textContent = 'N/A';
            }

            // appending the grade details to the row
            row.appendChild(midtermCell);
            row.appendChild(finalCell);
            row.appendChild(overallCell);
            row.appendChild(statusCell);

            // appending the row to the table
            courseDetailsTableBody.appendChild(row);
        });
    }

    courseDetailsSection.style.display = 'block';
}

function closeCourseDetails() {
    const courseDetailsSection = document.getElementById('courseDetailsSection');
    courseDetailsSection.style.display = 'none';
}