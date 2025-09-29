# Role-Based Access Control Implementation

## Overview

This implementation enforces strict role-based access control for tournament management system where:

- **Administrators (ADMIN)**: Can only manage tournaments
- **Regular Users (USER)**: Can only manage teams within tournaments

**Note**: User management features have been removed from the admin interface. User registration and authentication are still available through the public registration endpoint.

## Access Control Rules

### Tournament Management (Admin Only)

- ✅ **Create Tournament**: Only admins can create new tournaments
- ✅ **Update Tournament**: Only admins can modify tournament details
- ✅ **Update Tournament Status**: Only admins can change tournament status
- ✅ **Delete Tournament**: Only admins can remove tournaments

### Team Management (User Only)

- ✅ **Create Team**: Only regular users can create teams in tournaments
- ✅ **Update Team**: Users can only update teams they created
- ✅ **Delete Team**: Users can only delete teams they created
- ❌ **Admin Restriction**: Administrators cannot create, update, or delete teams

## Implementation Details

### Controller Level Security

Both `TournamentController` and `TeamController` include role checks before processing requests:

```java
// Tournament operations - Admin check
if (!currentUser.getRole().equals(User.Role.ADMIN)) {
    return ResponseEntity.status(403)
        .body("Only administrators can create tournaments");
}

// Team operations - User check
if (currentUser.getRole().equals(User.Role.ADMIN)) {
    return ResponseEntity.status(403)
        .body("Administrators cannot create teams. Only regular users can create teams.");
}
```

### Service Layer Security

The business logic layer enforces the same restrictions:

#### Tournament Service

- `createTournament()`: Validates user is ADMIN
- `updateTournament()`: Validates user is ADMIN
- `updateTournamentStatus()`: Validates user is ADMIN
- `deleteTournament()`: Validates user is ADMIN

#### Team Service

- `createTeam()`: Validates user is NOT ADMIN (must be regular USER)
- `updateTeam()`: Only team creator can update (no admin override)
- `deleteTeam()`: Only team creator can delete (no admin override)

## Security Benefits

1. **Separation of Concerns**: Clear division between tournament management and team participation
2. **Role Enforcement**: Double validation at both controller and service layers
3. **Consistent Authorization**: All endpoints follow the same role-based rules
4. **Clear Error Messages**: Users receive specific feedback about permission issues

## HTTP Response Codes

- `200 OK`: Operation successful
- `403 Forbidden`: Role-based access denied
- `400 Bad Request`: General validation errors
- `404 Not Found`: Resource not found

## Example Error Messages

- `"Only administrators can create tournaments"`
- `"Administrators cannot create teams. Only regular users can create teams."`
- `"You can only update teams that you created"`
- `"You can only delete teams that you created"`

## Testing

The implementation includes comprehensive unit tests (`RoleBasedAccessControlTest`) that verify:

- Admins can create tournaments, users cannot
- Users can create teams, admins cannot
- Proper error messages for unauthorized operations
- Both controller and service layer validations
