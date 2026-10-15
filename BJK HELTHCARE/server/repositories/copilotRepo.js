/**
 * BJK HEALTHCARE — COPILOT & KNOWLEDGE REPOSITORY
 * Handles knowledge base chunks, semantic search records, AI conversations, and role redaction
 */

const BaseRepository = require('./baseRepo');

class CopilotRepository extends BaseRepository {
  constructor() {
    super('knowledge_chunks');
  }

  async searchKnowledge(searchTerm, role = 'EMPLOYEE') {
    const res = await this.query(
      `SELECT kc.id, kc.title, kc.content, kc.source_document
       FROM knowledge_chunks kc
       WHERE kc.content ILIKE '%' || $1 || '%' OR kc.title ILIKE '%' || $1 || '%'
       LIMIT 10;`,
      [searchTerm]
    );
    return res.rows;
  }

  async saveMessage({ conversationId, sender, role, text }) {
    const res = await this.query(
      `INSERT INTO ai_messages 
       (conversation_id, sender, role, content, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [conversationId, sender, role, text]
    );
    return res.rows[0];
  }
}

module.exports = new CopilotRepository();
