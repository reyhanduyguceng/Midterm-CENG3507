let courses = JSON.parse(localStorage.getItem('courses')) || {}; // Course informations gets from local storage. 
//for populating dropdowns
function populateDropdown(selectElement, data) {
    selectElement.innerHTML = ''; 
    Object.keys(data).forEach(item => {
        const option = document.createElement('option');
        option.textContent = item;
        selectElement.appendChild(option);
    });
}
// DOM is loading when page opened.
document.addEventListener('DOMContentLoaded', function() {
    
    let students = JSON.parse(localStorage.getItem('students')) || {};
    const studentSelect = document.getElementById('studentSelect'); 
    const courseSelect = document.getElementById('courseSelect'); 
    const studentSelectGrades = document.getElementById('studentSelectGrades'); 
    const courseSelectGrades = document.getElementById('courseSelectGrades'); 

    populateDropdown(studentSelect, students);
    populateDropdown(courseSelect, courses);
    populateDropdown(studentSelectGrades, students);
    populateDropdown(courseSelectGrades, courses);
    updateCourseTable();
});
document.getElementById('createCourseForm').addEventListener('submit', function() {
    let courseName = document.getElementById('courseName').value;
    let lowerPoint = parseInt(document.getElementById('lowerPoint').value, 10);
    
    // new course pushing to the JSON with an empty students array and grades set if not present
    const newCourse = { lowerPoint, students: [], grades: {}};
      
    if (!courses[courseName]) {
        courses[courseName] = newCourse;
    } else {
        // If the course exists, just update the lowerPoint, leave students as is
        courses[courseName].lowerPoint = lowerPoint;
    }
    
    localStorage.setItem('courses', JSON.stringify(courses));

    // courses table updating.
    updateCourseTable();

    // form reset for new inputs after operations.
    document.getElementById('createCourseForm').reset();
});
// For course table updating
function updateCourseTable(searchQuery = '') {
    const tableBody = document.querySelector('#courseTable tbody');
    tableBody.innerHTML = ''; // clear operation before updating
    for (let courseName in courses) {
        if (searchQuery && !courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
            continue;
        }
        const course = courses[courseName];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${courseName}</td>
            <td>${course.lowerPoint}</td>
            <td>
                <button onclick="editCoursePoint('${courseName}')">Edit Course</button>
                <button onclick="deleteCourse('${courseName}')">Delete Course</button>
                <button onclick="viewStudents('${courseName}')">View Students</button>
                <button onclick="viewCourseDetails('${courseName}')">View Course Details</button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// course name event listener
document.getElementById('courseSearch').addEventListener('input', function () {
    const searchQuery = this.value.trim(); 
    updateCourseTable(searchQuery); 
});
// editing the course informations
function editCoursePoint(courseName) {
    const course = courses[courseName];
    document.getElementById('courseName').value = courseName;
    document.getElementById('lowerPoint').value = course.lowerPoint;
    document.getElementById('courseName').disabled = true;
    const submitButton = document.querySelector('form button');
    submitButton.textContent = 'Update Course';

    // handling form submission for updating the course
    document.getElementById('createCourseForm').onsubmit = function() {
        let updatedLowerPoint = parseInt(document.getElementById('lowerPoint').value, 10);

        // If lowerPoint is not a valid number, don't proceed
        if (isNaN(updatedLowerPoint)) {
            return;
        }

        // for updating the lowerPoint of the existing course
        courses[courseName].lowerPoint = updatedLowerPoint;

        // for saving the updated courses object to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));

        // for updating the course table
        updateCourseTable();

        // reseting the form and button text
        document.getElementById('courseName').disabled = false;
        document.getElementById('createCourseForm').reset();
        submitButton.textContent = 'Create Course';    
    };
}
// for deleting courses 
function deleteCourse(courseName){
    delete courses[courseName];
    localStorage.setItem('courses', JSON.stringify(courses));
    updateCourseTable();
}
function viewCourseDetails(courseName) {
    const course = courses[courseName];

    // displaying the course name in the course details title
    document.getElementById('courseDetailsTitle').textContent = `Details of ${courseName}`;

    // getting the course details table body
    const courseDetailsBody = document.querySelector('#courseDetails tbody');
    courseDetailsBody.innerHTML = ''; // Clear any existing details

    // initializing variables to calculate statistics
    let passedCount = 0;
    let failedCount = 0;
    let totalScore = 0;
    let totalStudents = 0;

    // checking if there are students in the course
    if (course.students.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = 'No students enrolled';
        cell.colSpan = 3; // span across all columns
        row.appendChild(cell);
        courseDetailsBody.appendChild(row);
    } else {
        // looping through the students to calculate passed/failed and mean score
        course.students.forEach(student => {
            if (course.grades && course.grades[student]) {
                const midtermGrade = course.grades[student].midterm;
                const finalGrade = course.grades[student].final;
                const overallGrade = (midtermGrade * 0.4) + (finalGrade * 0.6);
                totalScore += overallGrade;
                totalStudents++;
                if (overallGrade >= course.lowerPoint) {
                    passedCount++;
                } else {
                    failedCount++;
                }
            }
        });

        // calculating the mean score
        const meanScore = totalStudents > 0 ? (totalScore / totalStudents).toFixed(2) : 0;

        // create a row for the course details
        const row = document.createElement('tr');

        // appending the statistics to the row  
        row.innerHTML = `       
            <td>${passedCount}</td>
            <td>${failedCount}</td>
            <td>${meanScore}</td>
        `;

        // appending the row to the table
        courseDetailsBody.appendChild(row);
    }

    // showing the course details section
    document.getElementById('viewCourseDetailsSection').style.display = 'block';
}

// closing the course details section
function closeCourseDetailsView() {
    document.getElementById('viewCourseDetailsSection').style.display = 'none';
}

// adding students to the course
document.getElementById('addStudentForm').addEventListener('submit', function(event) {
    const studentSelect = document.getElementById('studentSelect');
    const courseSelect = document.getElementById('courseSelect');
    const studentName = studentSelect.value;
    const courseName = courseSelect.value;

    // ensuring student and course are valid
    if (!studentName || !courseName) {
        return;
    }

    // getting the course and add the student
    const course = courses[courseName];
    if (!course.students.includes(studentName)) {
        course.students.push(studentName);
        localStorage.setItem('courses', JSON.stringify(courses));  // saving the updated courses
    }

    // updating the course table
    updateCourseTable();

    // reseting the form
    document.getElementById('addStudentForm').reset();
});

document.getElementById('statusFilter').addEventListener('change', function() {
    const filterValue = this.value;  //eselected status filter
    const searchQuery = document.getElementById('studentSearch').value.trim();  // search query

    const courseName = document.getElementById('courseTitle').textContent.replace("Students in ", "");

    // calling viewStudents with both the filter and the search query
    viewStudents(courseName, filterValue, searchQuery);
});
document.getElementById('studentSearch').addEventListener('input', function() {
    const searchQuery = this.value;  // the value entered by the user
    const filterStatus = document.getElementById('statusFilter').value;  // the selected status filter
    const courseName = document.getElementById('courseTitle').textContent.replace("Students in ", "");

    // calling viewStudents with both the status filter and the search query
    viewStudents(courseName, filterStatus, searchQuery);
});

function viewStudents(courseName, filterStatus = '', searchQuery = '') {
    const course = courses[courseName];
    
    // displaying the course name in the title
    document.getElementById('courseTitle').textContent = `Students in ${courseName}`;
    
    // the students table body
    const studentsTableBody = document.querySelector('#studentsTable tbody');
    studentsTableBody.innerHTML = ''; 
    
    // checking for there are students enrolled in the course
    if (course.students.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = 'No students enrolled';
        cell.colSpan = 6; 
        row.appendChild(cell);
        studentsTableBody.appendChild(row);
    } else {
        course.students.forEach(student => {
            if (searchQuery && !student.toLowerCase().includes(searchQuery.toLowerCase())) {
                return; 
            }

            const row = document.createElement('tr');
            const studentCell = document.createElement('td');
            studentCell.textContent = student;
            row.appendChild(studentCell);

            const midtermCell = document.createElement('td');
            const finalCell = document.createElement('td');
            const gradeCell = document.createElement('td');
            const statusCell = document.createElement('td');

            let status = 'N/A'; // for default
            let overallGrade = 0;
            if (course.grades && course.grades[student]) {
                const midtermGrade = course.grades[student].midterm;
                const finalGrade = course.grades[student].final;
                overallGrade = (midtermGrade * 0.4) + (finalGrade * 0.6);
                midtermCell.textContent = midtermGrade;
                finalCell.textContent = finalGrade;
                gradeCell.textContent = overallGrade.toFixed(2); // Round to 2 decimal places
                if (overallGrade >= course.lowerPoint) {
                    status = 'PASS';
                    statusCell.style.color = 'green';
                } else {
                    status = 'FAIL';
                    statusCell.style.color = 'red';
                }
            } else {
                midtermCell.textContent = 'N/A';
                finalCell.textContent = 'N/A';
                gradeCell.textContent = 'N/A';
                statusCell.textContent = 'N/A';
            }
            if (filterStatus && status !== filterStatus) {
                return; 
            }

            statusCell.textContent = status;

            // creating the delete button
            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
                deleteStudentFromCourse(courseName, student);
            };
            actionCell.appendChild(deleteButton);

            // appending the cells to the row
            row.appendChild(midtermCell);
            row.appendChild(finalCell);
            row.appendChild(gradeCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            // appending the row to the table
            studentsTableBody.appendChild(row);
        });
    }
    document.getElementById('viewStudentsSection').style.display = 'block';
}

// for delete a student from a course
function deleteStudentFromCourse(courseName, studentName) {
    const course = courses[courseName];
    if (course) {
        // removing the student from the course's student list
        const index = course.students.indexOf(studentName);
        if (index !== -1) {
            course.students.splice(index, 1); // Remove 1 element at the found index
        }

        // removing the student's grades for this course
        if (course.grades && course.grades[studentName]) {
            delete course.grades[studentName];
        }

        // saving updated data to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));

        // refreshing the student list
        viewStudents(courseName);
    }
}

// closing the students view section
function closeStudentView() {
    document.getElementById('viewStudentsSection').style.display = 'none';
}
//for grading 
document.getElementById('gradesForm').addEventListener('submit', function() {
    const studentSelect = document.getElementById('studentSelectGrades');
    const courseSelect = document.getElementById('courseSelectGrades');
    const studentName = studentSelect.value;
    const courseName = courseSelect.value;
    const midtermGrade = parseInt(document.getElementById('midtermGrade').value, 10);
    const finalGrade = parseInt(document.getElementById('finalGrade').value, 10);

    if (courses[courseName]) {
        const course = courses[courseName];
        if (course.students.includes(studentName)) {
            // If the student is already enrolled, storing the grades
            if (!course.grades) {
                course.grades = {}; // initializing grades if not already initialized
            }
            course.grades[studentName] = {
                midterm: midtermGrade,
                final: finalGrade
            };

            //saving updated courses back to localStorage
            localStorage.setItem('courses', JSON.stringify(courses));
        } 
    } 

    // reseting the form after submission
    document.getElementById('gradesForm').reset();
});