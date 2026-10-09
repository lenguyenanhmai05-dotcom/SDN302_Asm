import prisma from "../lib/prisma";
import { signToken } from "../lib/auth";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runRoleTests() {
  console.log("🔐 Starting Role-Based Authorization Tests for Assignment 2...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ""}`);
      failed++;
    }
  }

  // Set up 4 distinct users
  const timestamp = Date.now();
  const userOwner = await prisma.user.create({
    data: {
      name: `Owner_${timestamp}`,
      email: `owner_${timestamp}@gmail.com`,
      password: "HashedPassword123!",
    },
  });

  const userMemberAssignee = await prisma.user.create({
    data: {
      name: `Assignee_${timestamp}`,
      email: `assignee_${timestamp}@gmail.com`,
      password: "HashedPassword123!",
    },
  });

  const userOtherMember = await prisma.user.create({
    data: {
      name: `OtherMember_${timestamp}`,
      email: `other_${timestamp}@gmail.com`,
      password: "HashedPassword123!",
    },
  });

  const userOutsider = await prisma.user.create({
    data: {
      name: `Outsider_${timestamp}`,
      email: `outsider_${timestamp}@gmail.com`,
      password: "HashedPassword123!",
    },
  });

  // Generate tokens
  const tokenOwner = await signToken({ userId: userOwner.id, email: userOwner.email, name: userOwner.name });
  const tokenMemberAssignee = await signToken({ userId: userMemberAssignee.id, email: userMemberAssignee.email, name: userMemberAssignee.name });
  const tokenOtherMember = await signToken({ userId: userOtherMember.id, email: userOtherMember.email, name: userOtherMember.name });
  const tokenOutsider = await signToken({ userId: userOutsider.id, email: userOutsider.email, name: userOutsider.name });

  const headersOwner = { "Content-Type": "application/json", Cookie: `token=${tokenOwner}` };
  const headersAssignee = { "Content-Type": "application/json", Cookie: `token=${tokenMemberAssignee}` };
  const headersOther = { "Content-Type": "application/json", Cookie: `token=${tokenOtherMember}` };
  const headersOutsider = { "Content-Type": "application/json", Cookie: `token=${tokenOutsider}` };

  // Create Team owned by userOwner
  const team = await prisma.team.create({
    data: {
      name: `Role Test Team ${timestamp}`,
      description: "Testing strict permissions",
      ownerId: userOwner.id,
      members: {
        create: [
          { userId: userMemberAssignee.id, role: "MEMBER" },
          { userId: userOtherMember.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Create Task 1: created by Owner, assigned to userMemberAssignee
  const task1 = await prisma.task.create({
    data: {
      title: "Task 1 for Role Testing",
      teamId: team.id,
      creatorId: userOwner.id,
      assigneeId: userMemberAssignee.id,
      status: "TO_DO",
      priority: "MEDIUM",
    },
  });

  // Create Task 2: created by userMemberAssignee, unassigned
  const task2 = await prisma.task.create({
    data: {
      title: "Task 2 created by Assignee User",
      teamId: team.id,
      creatorId: userMemberAssignee.id,
      assigneeId: null,
      status: "TO_DO",
      priority: "HIGH",
    },
  });

  try {
    // TEST 1: Other member (not creator, not assignee, not owner) tries to DELETE Task 1 -> Must be 403 Forbidden
    const resOtherDelete = await fetch(`${BASE_URL}/api/tasks/${task1.id}`, {
      method: "DELETE",
      headers: headersOther,
    });
    assert(
      resOtherDelete.status === 403,
      "Task Delete: Non-creator, non-assignee member cannot delete task (403 Forbidden)"
    );

    // TEST 2: Outsider (not in team) tries to DELETE Task 1 -> Must be 403 Forbidden
    const resOutsiderDelete = await fetch(`${BASE_URL}/api/tasks/${task1.id}`, {
      method: "DELETE",
      headers: headersOutsider,
    });
    assert(
      resOutsiderDelete.status === 403,
      "Task Delete: Outsider cannot delete task (403 Forbidden)"
    );

    // TEST 3: Unauthenticated user tries to DELETE Task 1 -> Must be 401 Unauthorized
    const resAnonDelete = await fetch(`${BASE_URL}/api/tasks/${task1.id}`, {
      method: "DELETE",
    });
    assert(
      resAnonDelete.status === 401,
      "Task Delete: Unauthenticated user cannot delete task (401 Unauthorized)"
    );

    // TEST 4: Assignee can DELETE Task 1 -> Must be 200 OK
    const resAssigneeDelete = await fetch(`${BASE_URL}/api/tasks/${task1.id}`, {
      method: "DELETE",
      headers: headersAssignee,
    });
    assert(
      resAssigneeDelete.status === 200,
      "Task Delete: Assignee can delete task (200 OK)"
    );

    // TEST 5: Creator can DELETE Task 2 -> Must be 200 OK
    const resCreatorDelete = await fetch(`${BASE_URL}/api/tasks/${task2.id}`, {
      method: "DELETE",
      headers: headersAssignee,
    });
    assert(
      resCreatorDelete.status === 200,
      "Task Delete: Creator can delete task (200 OK)"
    );

    // Create Task 3: for Owner deletion test
    const task3 = await prisma.task.create({
      data: {
        title: "Task 3 for Owner deletion",
        teamId: team.id,
        creatorId: userOtherMember.id,
        assigneeId: userOtherMember.id,
        status: "TO_DO",
        priority: "LOW",
      },
    });

    // TEST 6: Team Owner can DELETE Task 3 (even if created and assigned to someone else) -> Must be 200 OK
    const resOwnerDelete = await fetch(`${BASE_URL}/api/tasks/${task3.id}`, {
      method: "DELETE",
      headers: headersOwner,
    });
    assert(
      resOwnerDelete.status === 200,
      "Task Delete: Team Owner can delete any task in their team (200 OK)"
    );

    // Create Task 4: for Update tests
    const task4 = await prisma.task.create({
      data: {
        title: "Task 4 for Update Testing",
        teamId: team.id,
        creatorId: userOwner.id,
        status: "TO_DO",
        priority: "LOW",
      },
    });

    // TEST 7: Team Member can UPDATE Task 4 -> Must be 200 OK
    const resMemberUpdate = await fetch(`${BASE_URL}/api/tasks/${task4.id}`, {
      method: "PUT",
      headers: headersOther,
      body: JSON.stringify({ status: "IN_PROGRESS", priority: "HIGH" }),
    });
    assert(
      resMemberUpdate.status === 200,
      "Task Update: Team member can update task status and priority (200 OK)"
    );

    // TEST 8: Outsider tries to UPDATE Task 4 -> Must be 403 Forbidden
    const resOutsiderUpdate = await fetch(`${BASE_URL}/api/tasks/${task4.id}`, {
      method: "PUT",
      headers: headersOutsider,
      body: JSON.stringify({ status: "DONE" }),
    });
    assert(
      resOutsiderUpdate.status === 403,
      "Task Update: Non-member cannot update team task (403 Forbidden)"
    );

    // TEST 9: Unauthenticated tries to UPDATE Task 4 -> Must be 401 Unauthorized
    const resAnonUpdate = await fetch(`${BASE_URL}/api/tasks/${task4.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    assert(
      resAnonUpdate.status === 401,
      "Task Update: Unauthenticated user cannot update task (401 Unauthorized)"
    );

    // TEST 10: Non-owner tries to UPDATE team -> Must be 403 Forbidden
    const resNonOwnerUpdateTeam = await fetch(`${BASE_URL}/api/teams/${team.id}`, {
      method: "PUT",
      headers: headersOther,
      body: JSON.stringify({ name: "Hacked Team Name" }),
    });
    assert(
      resNonOwnerUpdateTeam.status === 403,
      "Team Update: Non-owner cannot update team (403 Forbidden)"
    );

    // TEST 11: Owner can UPDATE team -> Must be 200 OK
    const resOwnerUpdateTeam = await fetch(`${BASE_URL}/api/teams/${team.id}`, {
      method: "PUT",
      headers: headersOwner,
      body: JSON.stringify({ name: "Updated by Owner" }),
    });
    assert(
      resOwnerUpdateTeam.status === 200,
      "Team Update: Owner can update team (200 OK)"
    );

    // TEST 12: Non-owner tries to ADD member -> Must be 403 Forbidden
    const resNonOwnerAddMember = await fetch(`${BASE_URL}/api/teams/${team.id}/members`, {
      method: "POST",
      headers: headersOther,
      body: JSON.stringify({ email: userOutsider.email, role: "MEMBER" }),
    });
    assert(
      resNonOwnerAddMember.status === 403,
      "Team Member: Non-owner cannot add members (403 Forbidden)"
    );

    // TEST 13: Non-owner tries to DELETE team -> Must be 403 Forbidden
    const resNonOwnerDeleteTeam = await fetch(`${BASE_URL}/api/teams/${team.id}`, {
      method: "DELETE",
      headers: headersOther,
    });
    assert(
      resNonOwnerDeleteTeam.status === 403,
      "Team Delete: Non-owner cannot delete team (403 Forbidden)"
    );

    // TEST 14: Owner can DELETE team -> Must be 200 OK
    const resOwnerDeleteTeam = await fetch(`${BASE_URL}/api/teams/${team.id}`, {
      method: "DELETE",
      headers: headersOwner,
    });
    assert(
      resOwnerDeleteTeam.status === 200,
      "Team Delete: Owner can delete team (200 OK)"
    );
  } finally {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        id: { in: [userOwner.id, userMemberAssignee.id, userOtherMember.id, userOutsider.id] },
      },
    }).catch(() => {});
  }

  console.log(`\n======================================================`);
  console.log(`📊 Role & Permission Tests: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);
}

runRoleTests();
