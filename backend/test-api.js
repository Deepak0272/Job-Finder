import axios from 'axios';

async function runTest() {
  try {
    const baseURL = 'http://localhost:5000/api';
    console.log('1. Testing Login...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'seeker@jobfinder.ai',
      password: 'Seeker@123456',
    });
    console.log('✅ Login successful:', loginRes.data.user.name);
    const token = loginRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    console.log('\n2. Testing Jobs List (filtering IT Support)...');
    const jobsRes = await axios.get(`${baseURL}/jobs?category=IT Support`);
    console.log(`✅ Jobs returned: ${jobsRes.data.jobs.length} of ${jobsRes.data.total}`);

    console.log('\n3. Testing AI Job Matching for Alex Rivera (CCNA, Linux, Desktop Support)...');
    const matchRes = await axios.post(`${baseURL}/ai/match-jobs`, {}, authHeaders);
    console.log(`✅ Matched ${matchRes.data.matches.length} jobs.`);
    matchRes.data.matches.slice(0, 3).forEach((m, idx) => {
      console.log(`   #${idx + 1}: ${m.job.title} (${m.job.category}) -> ${m.compatibilityScore}% match`);
      console.log(`      Matching skills: ${m.matchingSkills.join(', ')}`);
      console.log(`      Missing skills: ${m.missingSkills.join(', ') || 'None'}`);
    });

    console.log('\n4. Testing Saved Jobs API...');
    const savedRes = await axios.get(`${baseURL}/saved-jobs`, authHeaders);
    console.log(`✅ User saved jobs: ${savedRes.data.savedJobs.length}`);

    console.log('\n5. Testing Applications API...');
    const appsRes = await axios.get(`${baseURL}/applications`, authHeaders);
    console.log(`✅ User tracked applications: ${appsRes.data.applications.length} (Status: ${appsRes.data.applications[0]?.status})`);

    console.log('\n6. Testing Admin Login and Stats...');
    const adminLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@jobfinder.ai',
      password: 'Admin@123456',
    });
    const adminHeaders = { headers: { Authorization: `Bearer ${adminLogin.data.token}` } };
    const statsRes = await axios.get(`${baseURL}/admin/stats`, adminHeaders);
    console.log(`✅ Admin stats: Total users: ${statsRes.data.stats.totalUsers}, Total jobs: ${statsRes.data.stats.totalJobs}`);

    console.log('\n🎉 ALL BACKEND APIS VERIFIED AND WORKING FLAWLESSLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
  }
}

runTest();
