import snowflake from 'snowflake-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Snowflake configuration
const SNOWFLAKE_ACCOUNT = process.env.SNOWFLAKE_ACCOUNT || ''; // e.g., 'xxxxx' (without .snowflakecomputing.com)
const SNOWFLAKE_USERNAME = process.env.SNOWFLAKE_USERNAME || '';
const SNOWFLAKE_PASSWORD = process.env.SNOWFLAKE_PASSWORD || '';
const SNOWFLAKE_WAREHOUSE = process.env.SNOWFLAKE_WAREHOUSE || '';
const SNOWFLAKE_DATABASE = process.env.SNOWFLAKE_DATABASE || '';
const SNOWFLAKE_SCHEMA = process.env.SNOWFLAKE_SCHEMA || 'PUBLIC';
const SNOWFLAKE_ROLE = process.env.SNOWFLAKE_ROLE || '';

// Connection configuration
const connectionConfig = {
  account: SNOWFLAKE_ACCOUNT,
  username: SNOWFLAKE_USERNAME,
  password: SNOWFLAKE_PASSWORD,
  warehouse: SNOWFLAKE_WAREHOUSE,
  database: SNOWFLAKE_DATABASE,
  schema: SNOWFLAKE_SCHEMA,
  role: SNOWFLAKE_ROLE || undefined
};

// Helper function to execute SQL queries
const executeSnowflakeQuery = (sql, binds = []) => {
  return new Promise((resolve, reject) => {
    if (!SNOWFLAKE_ACCOUNT || !SNOWFLAKE_USERNAME || !SNOWFLAKE_PASSWORD) {
      reject(new Error('Snowflake credentials not configured'));
      return;
    }

    const connection = snowflake.createConnection(connectionConfig);
    
    connection.connect((err, conn) => {
      if (err) {
        console.error('Failed to connect to Snowflake:', err);
        reject(err);
        return;
      }

      conn.execute({
        sqlText: sql,
        binds: binds,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Failed to execute query:', err);
            reject(err);
          } else {
            resolve({ rows: rows || [], stmt });
          }
          connection.destroy();
        }
      });
    });
  });
};

export const snowflakeService = {
  // Initialize Snowflake connection and create tables if they don't exist
  async initialize() {
    try {
      if (!SNOWFLAKE_ACCOUNT || !SNOWFLAKE_USERNAME || !SNOWFLAKE_PASSWORD) {
        console.warn('⚠️ Snowflake credentials not configured. Skipping initialization.');
        return false;
      }

      console.log('Initializing Snowflake connection...');
      
      // Create tables for recordings, projects, and analytics
      await this.createTables();
      
      console.log('✅ Snowflake initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Snowflake:', error);
      return false;
    }
  },

  // Execute SQL query
  async executeQuery(sql, binds = []) {
    try {
      if (!SNOWFLAKE_ACCOUNT || !SNOWFLAKE_USERNAME || !SNOWFLAKE_PASSWORD) {
        throw new Error('Snowflake credentials not configured');
      }

      console.log('Executing Snowflake query:', sql.substring(0, 100) + '...');
      const result = await executeSnowflakeQuery(sql, binds);
      return {
        success: true,
        data: result.rows || [],
        message: 'Query executed successfully'
      };
    } catch (error) {
      console.error('Error executing Snowflake query:', error);
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  },

  // Create necessary tables in Snowflake
  async createTables() {
    const tables = [
      {
        name: 'recordings',
        sql: `
          CREATE TABLE IF NOT EXISTS ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings (
            id VARCHAR(255) PRIMARY KEY,
            project_id VARCHAR(255),
            user_id VARCHAR(255),
            user_email VARCHAR(255),
            title VARCHAR(500),
            transcript TEXT,
            recording_time NUMBER,
            status VARCHAR(50),
            insights VARIANT,
            notes VARIANT,
            brainstorm VARIANT,
            mindmap TEXT,
            created_at TIMESTAMP_NTZ,
            updated_at TIMESTAMP_NTZ
          )
        `
      },
      {
        name: 'projects',
        sql: `
          CREATE TABLE IF NOT EXISTS ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.projects (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(500),
            description TEXT,
            owner_id VARCHAR(255),
            owner_email VARCHAR(255),
            tags VARIANT,
            status VARCHAR(50),
            created_at TIMESTAMP_NTZ,
            updated_at TIMESTAMP_NTZ
          )
        `
      },
      {
        name: 'collaborators',
        sql: `
          CREATE TABLE IF NOT EXISTS ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.collaborators (
            id VARCHAR(255) PRIMARY KEY,
            project_id VARCHAR(255),
            user_id VARCHAR(255),
            user_email VARCHAR(255),
            role VARCHAR(50),
            joined_at TIMESTAMP_NTZ
          )
        `
      },
      {
        name: 'analytics',
        sql: `
          CREATE TABLE IF NOT EXISTS ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.analytics (
            id VARCHAR(255) PRIMARY KEY,
            event_type VARCHAR(100),
            user_id VARCHAR(255),
            project_id VARCHAR(255),
            recording_id VARCHAR(255),
            metadata VARIANT,
            created_at TIMESTAMP_NTZ
          )
        `
      }
    ];

    for (const table of tables) {
      try {
        await executeSnowflakeQuery(table.sql);
        console.log(`✅ Table ${table.name} created/verified`);
      } catch (error) {
        console.error(`Error creating table ${table.name}:`, error);
      }
    }
  },

  // Sync recording to Snowflake
  async syncRecording(recording) {
    try {
      if (!SNOWFLAKE_ACCOUNT) {
        return { success: false, message: 'Snowflake not configured' };
      }

      const sql = `
        MERGE INTO ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings AS target
        USING (SELECT ? AS id) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET
            title = ?,
            transcript = ?,
            recording_time = ?,
            status = ?,
            insights = PARSE_JSON(?),
            notes = PARSE_JSON(?),
            brainstorm = PARSE_JSON(?),
            mindmap = ?,
            updated_at = ?
        WHEN NOT MATCHED THEN
          INSERT (id, project_id, user_id, user_email, title, transcript, recording_time, status, insights, notes, brainstorm, mindmap, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, PARSE_JSON(?), PARSE_JSON(?), PARSE_JSON(?), ?, ?, ?)
      `;

      const binds = [
        recording._id.toString(),
        recording.title,
        recording.transcript || '',
        recording.recordingTime || 0,
        recording.status || 'completed',
        recording.insights ? JSON.stringify(recording.insights) : null,
        recording.notes ? JSON.stringify(recording.notes) : null,
        recording.brainstorm ? JSON.stringify(recording.brainstorm) : null,
        recording.mindmap || null,
        recording.updatedAt,
        recording._id.toString(),
        recording.projectId.toString(),
        recording.userId,
        recording.userEmail,
        recording.title,
        recording.transcript || '',
        recording.recordingTime || 0,
        recording.status || 'completed',
        recording.insights ? JSON.stringify(recording.insights) : null,
        recording.notes ? JSON.stringify(recording.notes) : null,
        recording.brainstorm ? JSON.stringify(recording.brainstorm) : null,
        recording.mindmap || null,
        recording.createdAt,
        recording.updatedAt
      ];

      await this.executeQuery(sql, binds);
      return { success: true, message: 'Recording synced to Snowflake' };
    } catch (error) {
      console.error('Error syncing recording to Snowflake:', error);
      return { success: false, message: error.message };
    }
  },

  // Sync project to Snowflake
  async syncProject(project) {
    try {
      if (!SNOWFLAKE_ACCOUNT) {
        return { success: false, message: 'Snowflake not configured' };
      }

      const sql = `
        MERGE INTO ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.projects AS target
        USING (SELECT ? AS id) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET
            title = ?,
            description = ?,
            tags = PARSE_JSON(?),
            status = ?,
            updated_at = ?
        WHEN NOT MATCHED THEN
          INSERT (id, title, description, owner_id, owner_email, tags, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, PARSE_JSON(?), ?, ?, ?)
      `;

      const binds = [
        project._id.toString(),
        project.title,
        project.description || '',
        JSON.stringify(project.tags || []),
        project.status || 'active',
        project.updatedAt,
        project._id.toString(),
        project.title,
        project.description || '',
        project.ownerId,
        project.ownerEmail || '',
        JSON.stringify(project.tags || []),
        project.status || 'active',
        project.createdAt,
        project.updatedAt
      ];

      await this.executeQuery(sql, binds);
      return { success: true, message: 'Project synced to Snowflake' };
    } catch (error) {
      console.error('Error syncing project to Snowflake:', error);
      return { success: false, message: error.message };
    }
  },

  // Get analytics data from Snowflake
  async getAnalytics(queryType, filters = {}) {
    try {
      if (!SNOWFLAKE_ACCOUNT) {
        throw new Error('Snowflake not configured');
      }

      let sql = '';
      
      switch (queryType) {
        case 'recordings_count':
          sql = `
            SELECT COUNT(*) as count 
            FROM ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings
            WHERE created_at >= DATEADD(day, -30, CURRENT_TIMESTAMP())
          `;
          break;
        
        case 'recordings_by_user':
          sql = `
            SELECT user_email, COUNT(*) as count 
            FROM ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings
            GROUP BY user_email
            ORDER BY count DESC
          `;
          break;
        
        case 'recordings_by_project':
          sql = `
            SELECT p.title as project_title, COUNT(r.id) as recording_count
            FROM ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.projects p
            LEFT JOIN ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings r ON p.id = r.project_id
            GROUP BY p.title
            ORDER BY recording_count DESC
          `;
          break;
        
        case 'transcript_length_stats':
          sql = `
            SELECT 
              AVG(LENGTH(transcript)) as avg_length,
              MIN(LENGTH(transcript)) as min_length,
              MAX(LENGTH(transcript)) as max_length,
              COUNT(*) as total_recordings
            FROM ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.recordings
            WHERE transcript IS NOT NULL AND transcript != ''
          `;
          break;
        
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }

      const result = await this.executeQuery(sql);
      return result.data || [];
    } catch (error) {
      console.error('Error getting analytics from Snowflake:', error);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  },

  // Log analytics event
  async logEvent(eventType, userId, projectId = null, recordingId = null, metadata = {}) {
    try {
      if (!SNOWFLAKE_ACCOUNT) {
        return { success: false, message: 'Snowflake not configured' };
      }

      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sql = `
        INSERT INTO ${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.analytics 
        (id, event_type, user_id, project_id, recording_id, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, PARSE_JSON(?), ?)
      `;

      const binds = [
        eventId,
        eventType,
        userId,
        projectId || null,
        recordingId || null,
        JSON.stringify(metadata),
        new Date()
      ];

      await this.executeQuery(sql, binds);
      return { success: true };
    } catch (error) {
      console.error('Error logging event to Snowflake:', error);
      return { success: false, message: error.message };
    }
  }
};

// Initialize on module load (non-blocking)
snowflakeService.initialize().catch(err => {
  console.error('Failed to initialize Snowflake:', err);
});
