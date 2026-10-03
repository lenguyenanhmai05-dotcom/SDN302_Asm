const BASE_URL = "http://localhost:3001";

async function runTests() {
  console.log("🚀 Starting Assignment 2 API smoke tests...\n");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ""}`);
      failedCount++;
    }
  }

  // 1. Test Self-Registration
  const randomEmail = `student_${Date.now()}@example.com`;
  let regToken = "";
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Student",
        email: randomEmail,
        password: "Password123!",
      }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.user && data.token, "POST /api/auth/register creates user and returns token");
    regToken = data.token;
  } catch (e: any) {
    assert(false, "POST /api/auth/register", e.message);
  }

  // 2. Test Login with Pre-seeded Grader Account
  let graderToken = "";
  let cookieHeader = "";
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "grader.sdn302@gmail.com",
        password: "Password123!",
      }),
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookieHeader = setCookie.split(";")[0];
    }
    const data = await res.json();
    assert(res.status === 200 && data.user.email === "grader.sdn302@gmail.com", "POST /api/auth/login logs in grader test account");
    graderToken = data.token;
  } catch (e: any) {
    assert(false, "POST /api/auth/login", e.message);
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${graderToken}`,
    Cookie: cookieHeader,
  };

  // 3. Test GET /api/auth/me
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && data.user.email === "grader.sdn302@gmail.com", "GET /api/auth/me returns authenticated user");
  } catch (e: any) {
    assert(false, "GET /api/auth/me", e.message);
  }

  // 4. Test GET /api/teams
  let initialTeamsCount = 0;
  try {
    const res = await fetch(`${BASE_URL}/api/teams`, {
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data) && data.length > 0, `GET /api/teams returns teams list (found ${data.length})`);
    initialTeamsCount = data.length;
  } catch (e: any) {
    assert(false, "GET /api/teams", e.message);
  }

  // 5. Test POST /api/teams (Create a new team)
  let createdTeamId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/teams`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Automated QA Test Team",
        description: "Created during smoke testing",
      }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.id && data.owner.email === "grader.sdn302@gmail.com", "POST /api/teams creates team and sets owner");
    createdTeamId = data.id;
  } catch (e: any) {
    assert(false, "POST /api/teams", e.message);
  }

  // 6. Test GET /api/teams/:id (Get team details with members and tasks)
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}`, {
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && data.id === createdTeamId && Array.isArray(data.members), "GET /api/teams/:id gets team details and members");
  } catch (e: any) {
    assert(false, "GET /api/teams/:id", e.message);
  }

  // 7. Test PUT /api/teams/:id (Update team info - Owner only)
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Updated QA Team Name",
        description: "Updated description via PUT",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.name === "Updated QA Team Name", "PUT /api/teams/:id updates team details");
  } catch (e: any) {
    assert(false, "PUT /api/teams/:id", e.message);
  }

  // 8. Test POST /api/teams/:id/members (Add member by email)
  let addedMemberUserId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}/members`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        email: "habang.dev@gmail.com",
        role: "MEMBER",
      }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.user.email === "habang.dev@gmail.com", "POST /api/teams/:id/members adds member by email");
    addedMemberUserId = data.user.id;
  } catch (e: any) {
    assert(false, "POST /api/teams/:id/members", e.message);
  }

  // 9. Test POST /api/teams/:id/tasks (Create a new task in team)
  let createdTaskId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}/tasks`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Test Task 1",
        description: "Smoke test task description",
        status: "TO_DO",
        priority: "HIGH",
        assigneeId: addedMemberUserId,
      }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.title === "Test Task 1" && data.assigneeId === addedMemberUserId, "POST /api/teams/:id/tasks creates task with assignee");
    createdTaskId = data.id;
  } catch (e: any) {
    assert(false, "POST /api/teams/:id/tasks", e.message);
  }

  // 10. Test GET /api/teams/:id/tasks (List tasks for a team)
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}/tasks`, {
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data) && data.length === 1, "GET /api/teams/:id/tasks lists team tasks");
  } catch (e: any) {
    assert(false, "GET /api/teams/:id/tasks", e.message);
  }

  // 11. Test PUT /api/tasks/:id (Update task status and priority)
  try {
    const res = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        status: "IN_PROGRESS",
        priority: "LOW",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.status === "IN_PROGRESS" && data.priority === "LOW", "PUT /api/tasks/:id updates task status and priority");
  } catch (e: any) {
    assert(false, "PUT /api/tasks/:id", e.message);
  }

  // 12. Test DELETE /api/tasks/:id (Delete task)
  try {
    const res = await fetch(`${BASE_URL}/api/tasks/${createdTaskId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "DELETE /api/tasks/:id deletes task");
  } catch (e: any) {
    assert(false, "DELETE /api/tasks/:id", e.message);
  }

  // 13. Test DELETE /api/teams/:id/members/:userId (Remove member from team)
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}/members/${addedMemberUserId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "DELETE /api/teams/:id/members/:userId removes member");
  } catch (e: any) {
    assert(false, "DELETE /api/teams/:id/members/:userId", e.message);
  }

  // 14. Test DELETE /api/teams/:id (Delete team - Owner only)
  try {
    const res = await fetch(`${BASE_URL}/api/teams/${createdTeamId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "DELETE /api/teams/:id deletes team");
  } catch (e: any) {
    assert(false, "DELETE /api/teams/:id", e.message);
  }

  // 15. Test POST /api/auth/logout
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "POST /api/auth/logout logs out and clears cookie");
  } catch (e: any) {
    assert(false, "POST /api/auth/logout", e.message);
  }

  console.log(`\n========================================`);
  console.log(`📊 Smoke Tests Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
