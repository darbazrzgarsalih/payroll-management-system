import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
    try {
        console.log("1. Logging in as rebo...");
        const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'rebo', password: '123' })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error("Login failed:", loginData);
            return;
        }

        const setCookieHeader = loginRes.headers.get('set-cookie');
        let cookie = '';
        if (setCookieHeader) {
            cookie = setCookieHeader.split(';')[0];
        }
        console.log("Logged in successfully. Cookie:", cookie);

        console.log("\n2. Testing Employee Import...");
        const empForm = new FormData();
        const empFile = new Blob([fs.readFileSync(path.join(__dirname, 'tmp_employees.csv'))], { type: 'text/csv' });
        empForm.append('csv', empFile, 'tmp_employees.csv');

        const empRes = await fetch('http://localhost:8000/api/v1/employees/import', {
            method: 'POST',
            headers: { 'Cookie': cookie },
            body: empForm
        });
        console.log("Employee Import Status:", empRes.status);
        const empData = await empRes.json();
        console.log("Response:", JSON.stringify(empData, null, 2));

        console.log("\n3. Testing Attendance Import...");
        const attForm = new FormData();
        const attFile = new Blob([fs.readFileSync(path.join(__dirname, 'tmp_attendance.csv'))], { type: 'text/csv' });
        attForm.append('csv', attFile, 'tmp_attendance.csv');

        const attRes = await fetch('http://localhost:8000/api/v1/attendances/import', {
            method: 'POST',
            headers: { 'Cookie': cookie },
            body: attForm
        });
        console.log("Attendance Import Status:", attRes.status);
        const attData = await attRes.json();
        console.log("Response:", JSON.stringify(attData, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTests();
