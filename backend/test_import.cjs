const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function runTests() {
    try {
        console.log("1. Logging in as rebo...");
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            username: 'rebo',
            password: '123'
        });

        const token = loginRes.data.token;
        console.log("Logged in successfully. Token length:", token.length);

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        console.log("\n2. Testing Employee Import...");
        const empForm = new FormData();
        empForm.append('csv', fs.createReadStream(path.join(__dirname, 'tmp_employees.csv')));

        try {
            const empRes = await axios.post('http://localhost:3000/api/v1/employees/import', empForm, {
                headers: {
                    ...config.headers,
                    ...empForm.getHeaders()
                }
            });
            console.log("Employee Import Success:", empRes.data);
        } catch (e) {
            console.error("Employee Import Error:", e.response ? e.response.data : e.message);
        }

        console.log("\n3. Testing Attendance Import...");
        const attForm = new FormData();
        attForm.append('csv', fs.createReadStream(path.join(__dirname, 'tmp_attendance.csv')));

        try {
            const attRes = await axios.post('http://localhost:3000/api/v1/attendances/import', attForm, {
                headers: {
                    ...config.headers,
                    ...attForm.getHeaders()
                }
            });
            console.log("Attendance Import Success:", attRes.data);
        } catch (e) {
            console.error("Attendance Import Error:", e.response ? e.response.data : e.message);
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

runTests();
