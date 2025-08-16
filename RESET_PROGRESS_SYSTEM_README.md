# Reset Progress System

## Overview

The Reset Progress System allows administrators to reset user progress across the platform while preserving basic login credentials. This is useful for:

- Starting fresh with existing users
- Clearing test data
- Resetting users who want to start over
- Maintaining user accounts while clearing all progress

## Features

### 🔄 Reset All Member Progress
- Resets ALL non-admin users simultaneously
- Deletes all career progress, quiz results, project submissions, and achievements
- Resets users to level 1 with 0 XP
- Preserves login credentials (name, email, password, role)

### 👤 Individual User Reset
- Reset progress for specific users
- Same comprehensive reset as bulk operation
- Useful for targeted resets

### 📊 Statistics Dashboard
- Real-time statistics on data to be reset
- Shows total users, career progress, quiz results, project submissions, and achievements
- Helps admins understand the scope of reset operations

## Backend Implementation

### API Endpoints

#### 1. Get Reset Statistics
```http
GET /api/admin/user-progress/reset-statistics
```
**Response:**
```json
{
  "statistics": {
    "totalUsers": 12,
    "totalCareerProgress": 9,
    "totalQuizResults": 18,
    "totalProjectSubmissions": 25,
    "totalAchievements": 15
  },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 2. Reset All Member Progress
```http
POST /api/admin/user-progress/reset-all
```
**Response:**
```json
{
  "message": "Successfully reset progress for 12 out of 12 users",
  "resetCount": 12,
  "totalUsers": 12,
  "results": [
    {
      "userId": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "success"
    }
  ],
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

#### 3. Reset Individual Member Progress
```http
POST /api/admin/user-progress/reset-user/:userId
```
**Response:**
```json
{
  "message": "Successfully reset progress for John Doe",
  "user": {
    "id": "user_id_1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "resetData": {
    "careerProgress": "deleted",
    "quizResults": "deleted",
    "projectSubmissions": "deleted",
    "achievements": "deleted",
    "userData": "reset to basic state"
  },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

### Database Operations

The reset system performs the following operations:

1. **Delete Career Progress**: Removes all `UserCareerProgress` records
2. **Delete Quiz Results**: Removes all `QuizResult` records
3. **Delete Project Submissions**: Removes all `ProjectSubmission` records
4. **Delete Achievements**: Removes all `Achievement` records
5. **Reset User Data**: Updates user profile to basic state:
   - `totalXp: 0`
   - `level: 1`
   - `bio: ''`
   - `avatar: ''`
   - `achievements: []`
   - `currentCareer: null`
   - `learningPath: null`
   - `lastActivity: new Date()`

**Preserved Data:**
- `name`
- `email`
- `password` (hashed)
- `role`
- `createdAt`

## Frontend Implementation

### Reset Progress Manager Component

Located at: `src/pages/admin/ResetProgressManager.tsx`

#### Features:
- **Statistics Dashboard**: Shows current data counts
- **Bulk Reset**: Reset all member progress with confirmation
- **Individual Reset**: Reset specific users with confirmation
- **Real-time Updates**: Data refreshes after reset operations
- **Loading States**: Visual feedback during operations
- **Error Handling**: Comprehensive error messages

#### UI Components:
- Statistics cards showing data counts
- Warning alerts for destructive operations
- Confirmation dialogs with detailed information
- User progress table with reset actions
- Loading spinners and progress indicators

### Navigation Integration

Added to admin dashboard navigation:
- **Path**: `/admin/reset-progress`
- **Icon**: `RefreshCw`
- **Label**: "Reset Progress"
- **Quick Access**: Dashboard overview card

## Security Features

### Admin-Only Access
- All reset endpoints require admin authentication
- Protected by `authMiddleware` and `requireRole('admin')`
- Admin users cannot be reset (protection against self-reset)

### Confirmation Dialogs
- Multiple confirmation steps for destructive operations
- Clear warnings about irreversible actions
- Detailed information about what will be deleted

### Audit Trail
- All reset operations are logged with timestamps
- Detailed response data for tracking
- User identification in reset results

## Usage Instructions

### For Administrators

1. **Login as Admin**
   ```
   Email: admin@skillx.com
   Password: SkillXAdmin!2024
   ```

2. **Access Reset Manager**
   - Navigate to Admin Dashboard
   - Click "Reset Progress" in sidebar
   - Or click "Reset Progress" card on dashboard overview

3. **View Statistics**
   - Review current data counts
   - Understand scope of reset operations

4. **Reset All Progress**
   - Click "Reset All Member Progress" button
   - Confirm in dialog
   - Wait for completion

5. **Reset Individual User**
   - Find user in table
   - Click "Reset" button
   - Confirm in dialog

### API Usage

```javascript
// Get statistics
const stats = await getResetStatistics();

// Reset all progress
const result = await resetAllMemberProgress();

// Reset individual user
const userResult = await resetIndividualMemberProgress(userId);
```

## Error Handling

### Common Errors

1. **Authentication Error (401)**
   - User not logged in as admin
   - Solution: Login with admin credentials

2. **Permission Error (403)**
   - User doesn't have admin role
   - Solution: Ensure user has admin role

3. **User Not Found (404)**
   - User ID doesn't exist
   - Solution: Verify user ID

4. **Database Error (500)**
   - Database connection issues
   - Solution: Check database connectivity

### Error Responses

```json
{
  "error": "Failed to reset all member progress",
  "details": "Database connection timeout",
  "stack": "Error stack trace (development only)"
}
```

## Testing

### Manual Testing

1. **Create Test Users**
   ```bash
   npm run seed:users
   ```

2. **Generate Test Data**
   - Complete career assessments
   - Submit projects
   - Earn achievements

3. **Test Reset Operations**
   - Reset individual users
   - Reset all users
   - Verify data is cleared
   - Verify login still works

### Automated Testing

```bash
# Test reset statistics
npm run test:reset-stats

# Test reset operations
npm run test:reset-operations
```

## Monitoring

### Logs to Monitor

1. **Reset Operations**
   ```
   🔄 Admin requested reset of all member progress
   📊 Found 12 non-admin users to reset
   ✅ Reset progress for user: John Doe (john@example.com)
   🎉 Reset completed: 12/12 users successfully reset
   ```

2. **Errors**
   ```
   ❌ Failed to reset user John Doe: Database timeout
   Error resetting all member progress: Connection failed
   ```

### Metrics to Track

- Number of reset operations per day
- Success rate of reset operations
- Time taken for bulk resets
- User feedback after resets

## Best Practices

### Before Reset Operations

1. **Backup Data** (if needed)
   ```bash
   npm run backup:user-data
   ```

2. **Notify Users** (if applicable)
   - Inform users about planned reset
   - Provide alternative data export if needed

3. **Test in Development**
   - Always test reset operations in development first
   - Verify data is properly cleared

### After Reset Operations

1. **Verify Reset**
   - Check that all data is cleared
   - Verify users can still login
   - Confirm fresh start experience

2. **Monitor System**
   - Watch for any issues
   - Check user feedback
   - Monitor system performance

## Troubleshooting

### Common Issues

1. **Reset Not Working**
   - Check admin permissions
   - Verify database connection
   - Check server logs

2. **Partial Reset**
   - Some data remains after reset
   - Check for database constraints
   - Verify all collections are targeted

3. **User Login Issues**
   - Users can't login after reset
   - Check if password was preserved
   - Verify user role wasn't changed

### Debug Commands

```bash
# Check admin users
npm run check:admin-users

# Check user progress
npm run check:user-progress

# Validate database state
npm run validate:database
```

## Future Enhancements

### Planned Features

1. **Selective Reset**
   - Reset specific data types only
   - Keep some progress while clearing others

2. **Scheduled Resets**
   - Automate reset operations
   - Reset users after inactivity

3. **Data Export**
   - Export user data before reset
   - Provide data backup options

4. **Reset Templates**
   - Predefined reset configurations
   - Quick reset options

### API Extensions

```javascript
// Selective reset (future)
await resetUserProgress(userId, {
  careerProgress: true,
  quizResults: false,
  projectSubmissions: true,
  achievements: true
});

// Scheduled reset (future)
await scheduleReset({
  userIds: ['user1', 'user2'],
  scheduledAt: '2025-01-20T10:00:00Z',
  resetOptions: { /* options */ }
});
```

## Support

For issues or questions about the Reset Progress System:

1. **Check Logs**: Review server logs for error details
2. **Verify Permissions**: Ensure admin access
3. **Test in Development**: Reproduce in development environment
4. **Contact Support**: Reach out to development team

---

**Note**: This system is designed for administrative use only. All reset operations are irreversible and should be used with caution.
