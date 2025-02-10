from datetime import datetime, timedelta
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, redirect, render_template, request, url_for
from flask_migrate import Migrate

db = SQLAlchemy()


class InternalMessage(db.Model):
    __tablename__ = 'internal_messages'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])
    to_user_id = db.Column(db.String,
                           db.ForeignKey('user.user_id'),
                           nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with User
    recipient = db.relationship('User', backref='messages')


class Team(db.Model):
    team_id = db.Column(db.String,
                        primary_key=True,
                        default=lambda: str(uuid.uuid4())[:8])
    team_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    contact = db.Column(db.String(100), nullable=True)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)


class Role(db.Model):
    role_id = db.Column(db.String,
                        primary_key=True,
                        default=lambda: str(uuid.uuid4())[:8])

    role_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           nullable=False)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)


# =============================================================

user_roles = db.Table(
    'user_roles',
    db.Column('user_id',
              db.String,
              db.ForeignKey('user.user_id'),
              primary_key=True),
    db.Column('role_id',
              db.String,
              db.ForeignKey('role.role_id'),
              primary_key=True))


class User(db.Model):
    user_id = db.Column(db.String,
                        primary_key=True,
                        default=lambda: str(uuid.uuid4())[:8])

    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # Use the user_roles table defined above
    roles = db.relationship('Role', secondary=user_roles, backref='users')


# =====================================================


class QuestionType(db.Model):
    __tablename__ = 'question_types'

    question_type_id = db.Column(db.String,
                                 primary_key=True,
                                 default=lambda: str(uuid.uuid4())[:8])
    # Primary Key

    type = db.Column(db.String, unique=True,
                     nullable=False)  # Type of question
    is_active = db.Column(db.Boolean, default=True)  # Active flag
    has_regex = db.Column(db.Boolean, default=False)  # Regex support flag
    regex_str = db.Column(db.String, nullable=True)  # Regex string

    has_options = db.Column(db.Boolean, default=False)  # Options flag
    options_str = db.Column(
        db.String, nullable=True)  # Options string in CSV or JSON format

    has_supplemental = db.Column(
        db.Boolean, default=False)  # Supplemental information flag
    supplemental_str = db.Column(
        db.String, nullable=True)  # Supplemental information string

    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    author = db.Column(db.String, nullable=True)  # Author of the QuestionType

    # Relationship with Question, enabling bi-directional access
    questions = db.relationship('Question', backref='question_type', lazy=True)

    def __repr__(self):
        return f"<QuestionType {self.type}>"


# =============================================

# from models import db, QuestionType


class Question(db.Model):
    __tablename__ = 'questions'

    question_id = db.Column(
        db.String, primary_key=True,
        default=lambda: str(uuid.uuid4())[:8])  # Primary Key

    question_text = db.Column(db.String, nullable=False)  # Question text
    question_help = db.Column(db.String, nullable=True)  # Optional help text

    # Foreign key to link to the QuestionType table
    question_type_id = db.Column(
        db.String,
        db.ForeignKey('question_types.question_type_id'),
        nullable=False)

    created_on = db.Column(db.DateTime,
                           default=datetime.utcnow)  # Creation timestamp
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)  # Update timestamp

    author = db.Column(db.String, nullable=True)  # Optional author field

    # Relationship with comments, establishing a one-to-many relationship
    comments = db.relationship('Comment', backref='question', lazy=True)

    def __repr__(self):
        return f"<Question {self.question_text}>"


# =====================================================


class Comment(db.Model):
    __tablename__ = 'comments'
    comment_id = db.Column(db.String,
                           primary_key=True,
                           default=lambda: str(uuid.uuid4())[:8])

    content = db.Column(db.Text, nullable=False)

    user_id = db.Column(db.String, nullable=False)

    replying_to_id = db.Column(db.String,
                               db.ForeignKey('comments.comment_id'),
                               nullable=True)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)

    # ForeignKey to link comments to questions (optional)
    question_id = db.Column(db.String,
                            db.ForeignKey('questions.question_id'),
                            nullable=True)

    # ForeignKey to link comments to cases
    case_id = db.Column(db.String, db.ForeignKey('cases.id'), nullable=False)

    # Self-referential relationship for replies
    replies = db.relationship('Comment',
                              backref=db.backref('parent',
                                                 remote_side=[comment_id]),
                              lazy='dynamic')


# =====================================================


class WorkflowTemplate(db.Model):
    __tablename__ = 'workflow_templates'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])
    title = db.Column(db.String(255), nullable=False)
    role_ids = db.Column(db.String,
                         nullable=False)  # Store as comma-separated string
    question_ids = db.Column(db.String,
                             nullable=False)  # Store as comma-separated string
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)
    author = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'\n<WorkflowTemplate ID: {self.id}, Title: {self.title}, Role IDs: {self.role_ids}, Question IDs: {self.question_ids}, Author: {self.author}, Updated At: {self.updated_on}>\n\n'


# ================================================

# import uuid
# from models import db, Case


def create_case(workflow_id, author):
    # Generate a unique case number
    case_number = str(uuid.uuid4())

    # Create and save the case
    case = Case(case_number=case_number,
                workflow_id=workflow_id,
                author=author)
    db.session.add(case)
    db.session.commit()

    return case


# ===============================================


class Answer(db.Model):
    __tablename__ = 'answers'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])

    case_id = db.Column(db.String, db.ForeignKey('cases.id'), nullable=True)

    case_number = db.Column(db.String, nullable=True)
    # Add this line for case_number

    workflow_id = db.Column(db.String,
                            db.ForeignKey('workflow_templates.id'),
                            nullable=False)

    question_id = db.Column(db.String,
                            db.ForeignKey('questions.question_id'),
                            nullable=False)

    user_id = db.Column(db.String,
                        db.ForeignKey('user.user_id'),
                        nullable=True)
    answer_text = db.Column(db.Text, nullable=False)

    created_on = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Answer {self.answer_text} for Question {self.question_id}; Case Number: {self.case_number}>'


# Ensure you create the table by including it when you initialize your database
# ===============================================


class Case(db.Model):
    __tablename__ = 'cases'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])

    case_number = db.Column(db.String,
                            unique=True,
                            nullable=False,
                            default=lambda: str(uuid.uuid4())[:8])

    workflow_id = db.Column(db.String,
                            db.ForeignKey('workflow_templates.id'),
                            nullable=False)

    current_role_id = db.Column(db.String, nullable=False)

    # New field to link to ApprovalStage
    current_stage_id = db.Column(db.String,
                                 db.ForeignKey('approval_stages.stage_id'),
                                 nullable=True)

    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    modified_by = db.Column(db.String(100), nullable=True)

    # submitter?
    assigned_user_id = db.Column('user_id',
                                 db.String,
                                 db.ForeignKey('user.user_id'),
                                 nullable=True)

    author_username = db.Column(db.String, nullable=False)

    status = db.Column(
        db.String(20), default='active',
        nullable=True)  # Values: active, pending, abandoned, completed

    # Relationship to comments
    comments = db.relationship('Comment', backref='case', lazy=True)

    workflow_template = db.relationship('WorkflowTemplate',
                                        backref=db.backref('cases', lazy=True))

    # Relationship to ApprovalStage
    approval_stage = db.relationship('ApprovalStage',
                                     backref='cases',
                                     lazy=True)

    # Relationship to User
    user = db.relationship('User', backref='cases', lazy=True)

    def __repr__(self):
        return (f'<Case_number: {self.case_number}, '
                f'case.id {self.id}, '
                f'Workflow {self.workflow_id}, '
                f'stage_id {self.id}, '
                f'Current Role {self.current_role_id}>')

    @property
    def is_late(self):
        return self.created_on + timedelta(days=3) < datetime.utcnow()

    @property
    def is_overdue(self):
        return self.created_on + timedelta(days=7) < datetime.utcnow()


class ScreenBuilder(db.Model):
    __tablename__ = 'screenbuilders'

    sb_id = db.Column(db.String,
                      primary_key=True,
                      default=lambda: str(uuid.uuid4())[:8])

    name = db.Column(db.String(100), nullable=False)
    # name = db.Column(db.String(100), nullable=False)

    question_ids = db.Column(db.String,
                             nullable=False)  # Store as comma-separated string
    created_on = db.Column(db.DateTime, default=datetime.utcnow)

    modified_on = db.Column(db.DateTime,
                            default=datetime.utcnow,
                            onupdate=datetime.utcnow)
    author = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<ScreenBuilder {self.name}>'


class ApprovalStage(db.Model):
    __tablename__ = 'approval_stages'

    stage_id = db.Column(db.String,
                         primary_key=True,
                         default=lambda: str(uuid.uuid4())[:8])

    stage_name = db.Column(db.String(100), nullable=False)
    next_stage_name = db.Column(db.String(100), nullable=True)
    last_stage_name = db.Column(db.String(100), nullable=True)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    modified_on = db.Column(db.DateTime,
                            default=datetime.utcnow,
                            onupdate=datetime.utcnow)
    author = db.Column(db.String(100), nullable=False)
    modified_by = db.Column(db.String(100), nullable=True)
    is_first = db.Column(db.Boolean, default=False)
    is_last = db.Column(db.Boolean, default=False)

    # step
    order = db.Column(
        db.Integer,
        nullable=False)  # Sequence order of the stage in the process
    conditions = db.Column(
        db.String,
        nullable=True)  # Optional conditions under which transitions occur

    workflow_template_id = db.Column(db.String,
                                     db.ForeignKey('workflow_templates.id'))

    approve_role_id = db.Column(db.String, db.ForeignKey('role.role_id'))
    deny_role_id = db.Column(db.String, db.ForeignKey('role.role_id'))

    def __repr__(self):
        return f'<ApprovalStage {self.stage_name}>'


# ===================================
class OptionList(db.Model):
    __tablename__ = 'option_lists'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])
    name = db.Column(db.Text, nullable=False)
    list_data = db.Column(db.Text, nullable=True)
    version = db.Column(db.Text, nullable=True)
    supercedes = db.Column(db.Text, nullable=True)
    author = db.Column(db.String, nullable=False)

    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<OptionList {self.name}>'


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.String,
                   primary_key=True,
                   default=lambda: str(uuid.uuid4())[:8])
    case_id = db.Column(db.String, db.ForeignKey('cases.id'), nullable=False)
    event_type = db.Column(db.String(50),
                           nullable=False)  # 'status_change' or 'stage_change'
    old_value = db.Column(db.String(100))
    new_value = db.Column(db.String(100))
    created_on = db.Column(db.DateTime, default=datetime.utcnow)

    case = db.relationship('Case', backref='events')
