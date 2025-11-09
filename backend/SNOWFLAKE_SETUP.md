# Snowflake Integration Setup

## Prerequisites

1. **Snowflake Account**: You need an active Snowflake account
2. **Snowflake Credentials**: 
   - Account identifier (e.g., `xxxxx` or `xxxxx.snowflakecomputing.com`)
   - Username
   - Password
   - Warehouse name
   - Database name
   - Schema name (default: `PUBLIC`)
   - Role (optional)

## Installation

1. Install the Snowflake SDK:
```bash
npm install snowflake-sdk
```

## Configuration

Add the following environment variables to your `.env` file:

```env
# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_account_identifier
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=your_warehouse_name
SNOWFLAKE_DATABASE=your_database_name
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_ROLE=your_role (optional)
```

## Features

### 1. Automatic Data Sync
- **Recordings**: Automatically synced to Snowflake when saved
- **Projects**: Automatically synced to Snowflake when created/updated
- **Analytics Events**: Logged to Snowflake for analysis

### 2. Analytics Queries
The following analytics queries are available:

- `recordings_count`: Total number of recordings in the last 30 days
- `recordings_by_user`: Recordings grouped by user
- `recordings_by_project`: Recordings grouped by project
- `transcript_length_stats`: Statistics on transcript lengths

### 3. API Endpoints

#### Get Analytics
```
GET /api/snowflake/analytics?queryType=recordings_count
```

#### Manual Sync
```
POST /api/snowflake/sync
Body: {
  "type": "recording" | "project",
  "id": "record_id"
}
```

#### Log Event
```
POST /api/snowflake/events
Body: {
  "eventType": "recording_created",
  "projectId": "project_id",
  "recordingId": "recording_id",
  "metadata": {}
}
```

## Database Schema

### Recordings Table
- `id`: VARCHAR(255) PRIMARY KEY
- `project_id`: VARCHAR(255)
- `user_id`: VARCHAR(255)
- `user_email`: VARCHAR(255)
- `title`: VARCHAR(500)
- `transcript`: TEXT
- `recording_time`: NUMBER
- `status`: VARCHAR(50)
- `insights`: VARIANT (JSON)
- `notes`: VARIANT (JSON)
- `brainstorm`: VARIANT (JSON)
- `mindmap`: TEXT
- `created_at`: TIMESTAMP_NTZ
- `updated_at`: TIMESTAMP_NTZ

### Projects Table
- `id`: VARCHAR(255) PRIMARY KEY
- `title`: VARCHAR(500)
- `description`: TEXT
- `owner_id`: VARCHAR(255)
- `owner_email`: VARCHAR(255)
- `tags`: VARIANT (JSON array)
- `status`: VARCHAR(50)
- `created_at`: TIMESTAMP_NTZ
- `updated_at`: TIMESTAMP_NTZ

### Collaborators Table
- `id`: VARCHAR(255) PRIMARY KEY
- `project_id`: VARCHAR(255)
- `user_id`: VARCHAR(255)
- `user_email`: VARCHAR(255)
- `role`: VARCHAR(50)
- `joined_at`: TIMESTAMP_NTZ

### Analytics Table
- `id`: VARCHAR(255) PRIMARY KEY
- `event_type`: VARCHAR(100)
- `user_id`: VARCHAR(255)
- `project_id`: VARCHAR(255)
- `recording_id`: VARCHAR(255)
- `metadata`: VARIANT (JSON)
- `created_at`: TIMESTAMP_NTZ

## Usage

1. **Automatic Sync**: Data is automatically synced when recordings or projects are created/updated
2. **Manual Sync**: Use the `/api/snowflake/sync` endpoint to manually sync data
3. **Analytics**: Query analytics data using the `/api/snowflake/analytics` endpoint
4. **Events**: Log custom events using the `/api/snowflake/events` endpoint

## Troubleshooting

1. **Connection Issues**: 
   - Verify your Snowflake credentials are correct
   - Check that your IP is whitelisted in Snowflake
   - Ensure the warehouse is running

2. **Table Creation Issues**:
   - Verify you have CREATE TABLE permissions
   - Check that the database and schema exist
   - Ensure the warehouse has sufficient resources

3. **Sync Issues**:
   - Check the backend logs for error messages
   - Verify the data format matches the schema
   - Ensure Snowflake is accessible from your server

## Next Steps

1. Configure your Snowflake credentials in `.env`
2. Restart the backend server
3. Tables will be created automatically on first initialization
4. Data will be synced automatically when recordings/projects are created

