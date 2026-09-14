/*
  GOT U NEX REF ADMIN DASHBOARD CONNECTION EXAMPLE
  ------------------------------------------------
  This file is intentionally NOT loaded by index.html. It documents the adapter
  contract the production admin dashboard/backend can implement.

  Load your real adapter BEFORE script.js, or expose the same object from your
  authenticated application shell.
*/

window.GotUNexRefAdminAPI = {
  async getOfficialPortalData({ officialId }) {
    // Replace with authenticated backend call.
    // const response = await fetch(`/api/officials/${officialId}/portal`, { credentials: 'include' });
    // return { data: await response.json() };
    return { data: {} };
  },

  async profileUpdated({ profile }) {
    // PATCH the official record in the admin/backend system.
  },


  async assignmentResponded({ assignmentId, response, reason, reasonLabel, reasonDescription, note, assignment }) {
    // Persist the official's accepted/declined response for the Super Admin / assignor workflow.
    // When response === 'declined', reason/reasonLabel/reasonDescription/note should be retained
    // with the assignment history so authorized administrators can see why it was declined.
  },

  async availabilityUpdated({ officialId, availability, availabilityReport, reportRow }) {
    // Save the user's availability for the assigning workflow.
    // availability.byDate[YYYY-MM-DD] contains the effective status:
    //   available | preferred | partial | unavailable
    // availability.blocksByDate[YYYY-MM-DD] contains start/end time plus:
    //   reason, reasonLabel, reasonDescription, note, updatedAt
    // availabilityReport is a normalized array the Super Admin availability report can read directly.
    // reportRow is the single updated date.
  },

  async availabilityCalendarUpdated({ officialId, date, status, block, reportRow }) {
    // Optional date-specific endpoint for immediate assignor conflict checking.
    // block includes the unavailable time range and the user's selected reason.
  },

  async assignmentAccepted({ assignmentId }) {
    // Confirm acceptance on the admin assignment record.
  },

  async assignmentDeclined({ assignmentId, reason, note }) {
    // Record the decline and reason on the admin assignment record.
  },

  async documentCompleted({ formId, document }) {
    // Store signed/completed form data and create an immutable document record.
  },

  async documentDraftSaved({ formId, document }) {
    // Persist a user-editable draft.
  },

  async documentUploaded({ file }) {
    // Upload binary file through the production upload service and attach it to this official.
  },

  async messageSent({ message }) {
    // Create a personal-profile message thread item.
  },

  async messageRead({ messageId }) {
    // Mark a message read for this authenticated profile.
  },

  async messagesMarkedRead() {
    // Mark all profile messages read.
  },

  async notificationRead({ notificationId }) {
    // Mark a profile notification read.
  },

  async notificationsMarkedRead() {
    // Mark all profile notifications read.
  },

  async evaluationRequested(payload) {
    // Create an evaluation request for the selected assignment.
  },

  async supportTicketCreated({ ticket }) {
    // Create a support ticket visible to administrators.
  },

  async settingsUpdated({ settings }) {
    // Persist official notification/privacy preferences.
  }
};


/*
ASSIGNMENT CREATION AUTHORIZATION
---------------------------------
The profile portal does NOT grant assignment creation to ordinary users.

The authenticated backend may enable assignment creation only for:
1) the Super Admin, or
2) a user explicitly authorized by the Super Admin.

Any synchronized portal payload may provide one of:
  permissions: ['assignments.create']
  authorization: { canCreateAssignments: true }
  profile: { permissions: ['assignments.create'] }

Super Admin role values are also recognized by the frontend. The backend remains
the authority and must enforce this permission server-side as well.
*/


/*
OFFICIATING-ANOTHER-GAME AVAILABILITY DETAIL
--------------------------------------------
When availability is blocked with reason "officiating-other-game", the block
contains:

block.otherGameDetails = {
  level,            // High School | NJCAA | NAIA | NCAA DIII | NCAA DII | NCAA DI
  location,
  homeTeam,
  awayTeam,
  gameTime,
  conference,
  supervisorName
}

The normalized availability report row also exposes:
  otherGameLevel
  otherGameLocation
  otherGameHomeTeam
  otherGameAwayTeam
  otherGameTime
  otherGameConference
  otherGameSupervisor

The Super Admin / assignor availability report should display this conflict
information when evaluating the user's availability for an assignment.
*/

/*
ADMIN USER MANAGEMENT — ADD USER PAGE
-------------------------------------
admin-add-user.html dispatches gotunexref:admin-action events and will use these
backend methods when the authenticated admin adapter provides them:

  async getAddUserOptions() {
    // Return { data: { organizations: [], schoolsTeams: [], departments: [] } }
  }

  async saveUserDraft({ draft }) {
    // Persist an admin-only draft without creating the user account.
  }

  async createUser({ user }) {
    // Server-side authorization MUST verify that the current actor is the Super Admin
    // or has the Super Admin-granted permission users.create / user-management.create.
    // Never trust the role/permissions submitted by the browser alone.
  }

  async sendUserInvite({ userId, email, temporaryPassword, requirePasswordReset }) {
    // Send invitation through the approved transactional email provider.
    // Do not return the temporary password in later API reads.
  }

The server is the authority for roles and permissions. Selecting Super Admin or
User Management in the UI must never bypass backend authorization.
*/


/*
GAME ASSIGNMENT ADMIN INTEGRATION
---------------------------------
Optional backend methods used by the Admin Game Assignment workflow:

async getGameAssignmentOptions({ crewSize }) {
  // Return real officials and option data. Example shape:
  // { data: { officials: [...], options: { schoolsTeams: [...], venues: [...],
  //   gameFees: {...}, currentAdmin: {name: '...'} } } }
}

async saveGameAssignmentDraft({ assignment }) {
  // Persist an unpublished assignment draft.
}

async createGameAssignment({ assignment }) {
  // Create the assignment record in the backend.
}

async publishGameAssignment({ assignmentId, officialIds }) {
  // Publish the assignment to the Master Schedule and each assigned official.
  // Each assigned official should receive a pending assignment in My Assignments.
}
*/
