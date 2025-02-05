
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Create database connection
const db = new sqlite3.Database('teams.db');

function createCase(caseData) {
    const id = uuidv4().substring(0, 8);
    const caseNumber = uuidv4().substring(0, 8);
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO cases (
                id, case_number, workflow_id, current_role_id, current_stage_id,
                created_at, updated_at, modified_by, assigned_user_id, author_username, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, caseNumber, caseData.workflow_id, caseData.current_role_id,
                caseData.current_stage_id, now, now, caseData.modified_by,
                caseData.assigned_user_id, caseData.author_username, 'active'
            ],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ id, case_number: caseNumber, ...caseData });
            }
        );
    });
}

function isLate(createdAt) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(createdAt) < threeDaysAgo;
}

function isOverdue(createdAt) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(createdAt) < sevenDaysAgo;
}

function getCaseById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cases WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (!row) {
                resolve(null);
                return;
            }
            row.is_late = isLate(row.created_at);
            row.is_overdue = isOverdue(row.created_at);
            resolve(row);
        });
    });
}

function updateCase(id, updateData) {
    const now = new Date().toISOString();
    const updates = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'case_number') {
            updates.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`,
            values,
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes > 0);
            }
        );
    });
}

function deleteCase(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM cases WHERE id = ?', [id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes > 0);
        });
    });
}

module.exports = {
    createCase,
    getCaseById,
    updateCase,
    deleteCase,
    isLate,
    isOverdue
};
