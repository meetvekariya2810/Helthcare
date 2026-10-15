/**
 * BJK HEALTHCARE — DOCUMENT VAULT REPOSITORY
 * Manages document metadata, SOPs, access logs, and presigned S3 storage keys
 */

const BaseRepository = require('./baseRepo');

class DocumentRepository extends BaseRepository {
  constructor() {
    super('documents');
  }

  async getEmployeeDocuments(employeeId) {
    const res = await this.query(
      `SELECT * FROM documents 
       WHERE employee_id = $1 OR source_employee_id = $1
       ORDER BY created_at DESC;`,
      [employeeId]
    );
    return res.rows;
  }

  async logDocumentAccess(documentId, userId, accessType = 'VIEW') {
    const res = await this.query(
      `INSERT INTO document_access_logs (document_id, user_id, access_type, accessed_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id;`,
      [documentId, userId, accessType]
    );
    return res.rows[0];
  }

  async createDocumentMetadata({ title, category, s3Key, mimeType, fileSize, employeeId, uploadedBy }) {
    const res = await this.query(
      `INSERT INTO documents 
       (title, category, s3_key, mime_type, file_size, employee_id, uploaded_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
       RETURNING *;`,
      [title, category, s3Key, mimeType, fileSize, employeeId, uploadedBy]
    );
    return res.rows[0];
  }
}

module.exports = new DocumentRepository();
