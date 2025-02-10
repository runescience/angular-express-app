# Import only the necessary components
import os
import uuid
from datetime import datetime
import logging
from logging.handlers import TimedRotatingFileHandler

from flask import Flask, redirect, render_template, request, url_for
from flask_migrate import Migrate
from flask import flash

from wtforms import BooleanField

from forms import QuestionTypeForm, RoleForm, TeamForm, UserForm, QuestionForm, WorkflowTemplateForm, LoginForm, ApprovalStageForm, ScreenBuilderForm, OptionListForm

from forms import generate_form
from flask import session

from models import (  # Use the 'db' instance from models
    Question, QuestionType, Role, Team, User, db, WorkflowTemplate, Answer,
    Case, Comment, ApprovalStage, ScreenBuilder, OptionList, InternalMessage)
from event_handler import handle_case_event

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Initialize the existing 'db' instance with the app
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Set up logging with log rotation

log_handler = TimedRotatingFileHandler(
    'app.log', when='D', interval=3,
    backupCount=3)  # Rotate logs every 3 days, keep last 3 as backup
log_handler.setLevel(logging.DEBUG)
log_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

logging.basicConfig(level=logging.DEBUG,
                    handlers=[log_handler, console_handler])

logger = logging.getLogger(__name__)


@app.route('/')
def index():
    print(f"index()")
    return render_template('index.html')


@app.route('/teams')
def teams():
    print(f"/teams()")
    try:
        teams = Team.query.all()
        return render_template('team.html', teams=teams)
    except Exception as e:
        app.logger.error(f"Failed to fetch teams: {e}")
        return "An error occurred while fetching teams.", 500


@app.route('/team/new', methods=['GET', 'POST'])
def new_team():
    print(f"new_team()")

    form = TeamForm()
    vvv = form.validate_on_submit()

    if not vvv:
        print('New team validation failed')
        for fieldName, errorMessages in form.errors.items():
            for err in errorMessages:
                app.logger.error(f"Error in {fieldName}: {err}")

    if form.validate_on_submit():
        try:
            team = Team()
            team.team_id = str(uuid.uuid4())[:8]
            team.team_name = form.team_name.data
            team.description = form.description.data
            team.contact = form.contact.data
            team.is_active = form.is_active.data
            db.session.add(team)
            db.session.commit()
            return redirect(url_for('teams'))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to create new team: {e}")
            return "An error occurred while creating a new team.", 500
    return render_template('team_form.html', form=form)


@app.route('/team/<string:id>/edit', methods=['GET', 'POST'])
def edit_team(id):
    print(f"edit team({id})")

    team = Team.query.get_or_404(id)
    form = TeamForm(obj=team)
    print("bbb")
    if form.validate_on_submit():
        try:
            print("ccc")
            team.team_name = form.team_name.data
            team.description = form.description.data
            team.contact = form.contact.data
            team.is_active = form.is_active.data
            print("team:", team)
            db.session.commit()
            return redirect(url_for('teams'))
        except Exception as e:
            print(f"Failed to edit team with id {id}: {e}")
            db.session.rollback()
            app.logger.error(f"Failed to edit team with id {id}: {e}")
            return "An error occurred while editing the team.", 500
    return render_template('team_form.html', form=form, team=team)


@app.route('/team/<string:id>/delete')
def delete_team(id):

    print(f"delete_team({id})")
    try:
        team = Team.query.get_or_404(id)
        db.session.delete(team)
        db.session.commit()
        return redirect(url_for('teams'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Failed to delete team with id {id}: {e}")
        return "An error occurred while deleting the team.", 500


# =================================


@app.route('/delete_case/<string:case_id>')
def delete_case(case_id):

    id = case_id

    print(f"delete_case({id})")
    try:
        case = Case.query.get_or_404(id)
        answers = Answer.query.filter_by(case_id=case.id).all()
        for answer in answers:
            db.session.delete(answer)

        comments = Comment.query.filter_by(case_id=case.id).all()
        for comment in comments:
            db.session.delete(comment)

        db.session.delete(case)
        db.session.commit()
        return redirect(url_for('select_workflow_template'))
        # return redirect(url_for('teams'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Failed to delete team with id {id}: {e}")
        return "An error occurred while deleting the team.", 500


# =========================================


@app.route('/roles')
def roles():
    roles = Role.query.all()
    return render_template('roles.html', roles=roles)


@app.route('/role/new', methods=['GET', 'POST'])
def new_role():
    form = RoleForm()
    if form.validate_on_submit():
        try:
            role = Role()
            role.role_name = form.role_name.data
            role.description = form.description.data
            role.is_active = form.is_active.data

            db.session.add(role)
            db.session.commit()
            return redirect(url_for('roles'))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to create new role: {e}")
            return "An error occurred while creating a new role.", 500
    return render_template('roles_form.html', form=form)


@app.route('/role/<string:id>/edit', methods=['GET', 'POST'])
def edit_role(id):
    role = Role.query.get_or_404(id)
    form = RoleForm(obj=role)
    if form.validate_on_submit():
        try:
            role.role_name = form.role_name.data
            role.description = form.description.data
            role.is_active = form.is_active.data
            db.session.commit()
            return redirect(url_for('roles'))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to edit role with id {id}: {e}")
            return "An error occurred while editing the role.", 500
    return render_template('roles_form.html', form=form, role=role)


@app.route('/role/<string:id>/delete')
def delete_role(id):
    try:
        role = Role.query.get_or_404(id)
        db.session.delete(role)
        db.session.commit()
        return redirect(url_for('roles'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Failed to delete role with id {id}: {e}")
        return "An error occurred while deleting the role.", 500


# =========================================


@app.route('/users')
def users():
    users = User.query.all()
    return render_template('users.html', users=users)


# If hash_password is supposed to be a function you define:
def hash_password(password):
    # Implementation of hashing, e.g., using hashlib
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


# Example of using hash_password in your code
user_password = "user_password_123"
hashed = hash_password(user_password)
print(f"Hashed password: {hashed}")


@app.route('/user/new', methods=['GET', 'POST'])
def new_user():
    form = UserForm()
    if form.validate_on_submit():
        try:
            user = User()
            user.username = form.username.data
            user.email = form.email.data
            user.password_hash = hash_password(form.password.data)
            user.is_active = form.is_active.data

            db.session.add(user)
            db.session.commit()
            return redirect(url_for('users'))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to create new user: {e}")
            return "An error occurred while creating a new user.", 500
    return render_template('users_form.html', form=form)


# ================================================


@app.route('/user/<string:id>/edit', methods=['GET', 'POST'])
def edit_user(id):
    user = User.query.get_or_404(id)
    form = UserForm(obj=user)
    if form.validate_on_submit():
        try:
            user.username = form.username.data
            user.email = form.email.data

            # Only hash the password if a new one was provided
            if form.password.data:
                user.password_hash = hash_password(form.password.data)

            user.is_active = form.is_active.data

            # Update role associations based on form selections
            selected_roles = request.form.getlist('roles')

            user.roles = [
                Role.query.get(role_id) for role_id in selected_roles
            ]

            db.session.commit()
            return redirect(url_for('users'))

        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to edit user with id {id}: {e}")
            return "An error occurred while editing the user.", 500

    # Ensure the form is populated with current roles
    form.roles.data = [role.role_id for role in user.roles]

    return render_template('users_form.html', form=form, user=user)


# ===================================================


@app.route('/user/<string:id>/delete')
def delete_user(id):
    try:
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return redirect(url_for('users'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Failed to delete user with id {id}: {e}")
        return "An error occurred while deleting the user.", 500


# =========================================


@app.route('/questiontypes')
def list_questiontypes():
    questiontypes = QuestionType.query.all()
    return render_template('questiontypes.html', questiontypes=questiontypes)


@app.route('/questiontypes/new', methods=['GET', 'POST'])
def new_questiontype():
    form = QuestionTypeForm()
    if form.validate_on_submit():
        print(f'questiontypes.  form.validate_on_submit():{form}')
        questiontype = QuestionType()
        questiontype.question_type_id = str(uuid.uuid4())[:8]
        questiontype.type = form.type.data
        questiontype.has_regex = form.has_regex.data
        questiontype.regex_str = form.regex_str.data
        questiontype.has_options = form.has_options.data
        questiontype.options_str = form.options_str.data

        print('new_questiontype: Form object for debugging:', form)
        print('Form components:', {field.name: field.data for field in form})

        questiontype.has_supplemental = form.has_supplemental.data
        questiontype.supplemental_str = form.supplemental_str.data
        questiontype.author = form.author.data

        db.session.add(questiontype)
        db.session.commit()
        flash('New Question Type created!')
        return redirect(url_for('list_questiontypes'))

    return render_template('questiontype_form.html', form=form)


@app.route('/questiontypes/<string:id>/edit', methods=['GET', 'POST'])
def edit_questiontype(id):
    questiontype = QuestionType.query.get_or_404(id)
    form = QuestionTypeForm(obj=questiontype)

    if form.validate_on_submit():

        print('new_questiontype: Form object for debugging:', form)
        print('/questiontypes/<string:id>/edit   Form components:',
              {field.name: field.data
               for field in form})

        questiontype.type = form.type.data

        questiontype.has_regex = form.has_regex.data
        questiontype.regex_str = form.regex_str.data

        questiontype.has_options = form.has_options.data
        questiontype.options_str = form.options_str.data if form.has_options.data else None

        questiontype.has_supplemental = form.has_supplemental.data
        questiontype.supplemental_str = form.supplemental_str.data

        questiontype.author = form.author.data
        db.session.commit()

        flash('Question Type updated!')
        return redirect(url_for('list_questiontypes'))

    # Handle display of existing errors from the validation method
    for fieldName, errorMessages in form.errors.items():
        for err in errorMessages:
            flash(f'Error in Question Type: {fieldName}: {err}', 'danger')

    return render_template('questiontype_form.html', form=form)


@app.route('/questiontypes/<string:id>/delete', methods=['POST'])
def delete_questiontype(id):
    questiontype = QuestionType.query.get_or_404(id)
    db.session.delete(questiontype)
    db.session.commit()
    flash('Question Type deleted!')
    return redirect(url_for('list_questiontypes'))


# ==========================================


@app.route('/questions', methods=['GET'])
def list_questions():
    questions = Question.query.all()
    return render_template('questions.html', questions=questions)


@app.route('/questions/new', methods=['GET', 'POST'])
def new_question():
    form = QuestionForm(request.form)
    if request.method == 'POST' and form.validate():
        new_question = Question(
            question_text=form.question_text.data,
            question_help=form.question_help.data,
            question_type_id=form.question_type.data,
            author=
            'Your Author Logic Here'  # Replace with actual logic for author
        )
        db.session.add(new_question)
        db.session.commit()
        flash('Question created successfully!', 'success')
        return redirect(url_for('list_questions'))
    return render_template('questions_form.html', form=form)


@app.route('/questions/<string:question_id>/edit', methods=['GET', 'POST'])
def edit_question(question_id):
    question = Question.query.get_or_404(question_id)
    form = QuestionForm(obj=question)  # Bind the question instance to the form

    if form.validate_on_submit():  # Validating form on POST
        try:
            # Ensure that form data is compatible with the SQLAlchemy model
            question.question_text = form.question_text.data
            question.question_help = form.question_help.data
            question.author = form.author.data
            question.question_type_id = form.question_type.data  # Ensure this is a valid QuestionType ID

            db.session.commit()
            flash('Question updated successfully!', 'success')
            return redirect(
                url_for('list_questions'))  # Redirect to a suitable page
        except Exception as e:
            db.session.rollback()
            app.logger.error(
                f"Failed to edit question with id {question_id}: {e}")
            return "An error occurred while editing the question.", 500

    return render_template('questions_form.html', form=form, question=question)


@app.route('/questions/<string:question_id>/delete', methods=['POST'])
def delete_question(question_id):
    try:
        question = Question.query.get_or_404(question_id)
        db.session.delete(question)
        db.session.commit()
        flash('Question deleted!')
        return redirect(url_for('list_questions'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(
            f"Failed to delete question with id {question_id}: {e}")
        return "An error occurred while deleting the question.", 500


# =====================================


@app.route('/workflowtemplates', methods=['GET'])
def list_workflowtemplates():
    templates = WorkflowTemplate.query.all()
    for template in templates:
        template.roles_list = Role.query.filter(
            Role.role_id.in_(template.role_ids.split(','))).all()
        template.questions_list = Question.query.filter(
            Question.question_id.in_(template.question_ids.split(','))).all()
    return render_template('workflowtemplates.html', templates=templates)


# ===================================================


@app.route('/workflowtemplate/new', methods=['GET', 'POST'])
def new_workflowtemplate():
    form = WorkflowTemplateForm()
    if form.validate_on_submit():
        # Get the ordered roles from the form data
        ordered_roles = request.form.get('orderedRoles', '')

        for role in ordered_roles:
            print("roles:" + role)

        ordered_questions = request.form.get('orderedQuestions', '')

        new_template = WorkflowTemplate(
            title=form.title.data,
            role_ids=ordered_roles,  # Use ordered roles
            question_ids=ordered_questions,
            author=form.author.data)

        db.session.add(new_template)
        db.session.commit()
        flash('Workflow Template created successfully!')
        return redirect(url_for('list_workflowtemplates'))
    return render_template('workflowtemplate_form.html', form=form)


# ==========================================


@app.route('/workflowtemplate/edit/<string:id>', methods=['GET', 'POST'])
def edit_workflowtemplate(id):
    # Fetch the workflow template by id
    template = WorkflowTemplate.query.get_or_404(id)
    form = WorkflowTemplateForm(obj=template)

    if request.method == 'POST':
        print("\n========>  POST Request")
    else:
        print("\n========>  GET Request")
        print('====>1')
        if template.role_ids:
            for role_id in template.role_ids.split(','):
                print(f'role_id stored in template{role_id}')
        else:
            print('None stored in template. ')

    if form.validate_on_submit():
        # Update the template with form data
        template.title = form.title.data

        # Get the ordered roles from the form data
        ordered_roles = request.form.get('orderedRoles', '')

        # Use ordered roles for updating the template
        template.role_ids = ordered_roles

        print('=====> in validate.\n====>2 ')
        if template.role_ids:
            for role_id in template.role_ids.split(','):
                print(f'role_id stored in template{role_id}')
        else:
            print('None stored in template. ')

        # Update questions
        ordered_questions = request.form.get('orderedQuestions', '')
        template.question_ids = ordered_questions

        # Update author
        template.author = form.author.data

        db.session.commit()
        flash('Workflow Template updated successfully!')
        return redirect(url_for('list_workflowtemplates'))

    # Populate roles and questions for the form
    form.roles.data = template.role_ids.split(',')
    form.questions.data = template.question_ids.split(',')

    return render_template('workflowtemplate_form.html',
                           form=form,
                           template=template)


# ====================================================


@app.route('/workflowtemplate/delete/<string:id>', methods=['POST'])
def delete_workflowtemplate(id):
    try:
        # Fetch the workflow template by id
        template = WorkflowTemplate.query.get_or_404(id)

        # Delete the template
        db.session.delete(template)
        db.session.commit()

        flash('Workflow Template deleted successfully!')
        return redirect(url_for('list_workflowtemplates'))
    except Exception as e:
        db.session.rollback()
        app.logger.error(
            f"Failed to delete workflow template with id {id}: {e}")
        return "An error occurred while deleting the workflow template.", 500


# ===================================================


@app.route('/select_workflow_template')
def select_workflow_template():
    user_id = session.get(
        'user_id')  # Assuming user_id is stored in the session
    if not user_id:
        return "You need to log in first.", 403

    # Fetch user roles
    user = User.query.get(user_id)
    admin_roles = Role.query.filter_by(role_name='admin').all()
    templates = WorkflowTemplate.query.all()
    stages = ApprovalStage.query.all()

    # Check if user has admin role
    is_admin = any(role in admin_roles for role in user.roles)
    users = []
    try:

        if is_admin:
            # Fetch all cases for admins
            cases = Case.query.all()
            users = User.query.all()
        else:
            # Fetch only user's cases
            cases = Case.query.filter_by(assigned_user_id=user.user_id).all()

            # Assume you have some logic to retrieve user data
            user = User.query.get(user_id)
            if user:
                users.append(user)  # Append the user to the list

        return render_template('select_workflow_template.html',
                               templates=templates,
                               cases=cases,
                               users=users,
                               stages=stages)
    except Exception as e:
        app.logger.error(f"Failed to fetch cases: {e}")
        return "An error occurred while fetching cases.", 500


# =================================================
# @app.route('/select_workflow_template', methods=['GET'])
# def select_workflow_template():

#     logger = logging.getLogger('select_workflow_template')
#     logger.setLevel(logging.DEBUG)

#     print("\n=====> in select_workflow_template\n")
#     logger.debug("Entering select_workflow_template")

#     try:
#         templates = WorkflowTemplate.query.all()
#         users = User.query.all()
#         user_id = session.get('user_id')

#         if not user_id:
#             flash('No one signed on.')
#             logger.warning("No user signed on.")

#         # Query cases where assigned_user_id matches the logged-in user's ID

#         cases = Case.query.filter_by(assigned_user_id=user_id).all()

#         for case in cases:
#             logger.info(f"Case Assigned User: {case.assigned_user_id}")
#             print(f"Case Assigned User: {case.assigned_user_id}")
#             print(f"Author Username: {case.author_username}")
#             print(f"User: {case.user}")

#         stages = ApprovalStage.query.all()

#         logger.debug("Data retrieved successfully")

#         # Assuming Case includes the workflow_template relationship
#         # Pass data to template
#         return render_template('select_workflow_template.html',
#                                templates=templates,
#                                cases=cases,
#                                users=users,
#                                stages=stages)
#     except Exception as e:
#         logger.error(f"An error occurred in select_workflow_template: {e}")
#         flash('An error occurred while selecting the workflow template.')
#         return render_template('error.html'), 500

# ===================================================
# main.py (Add an execution route)


def validate_regex(value, regex_str):
    import re
    return bool(re.match(regex_str, str(value)))


def save_answers(template, form_data, case_id):
    print(
        f'\n\n==> in save answers(), case_id:{case_id}:  template:{template}:, form_data:{form_data}:\n\n'
    )

    # Fetch the case to get its case_number
    case = Case.query.get(case_id)
    case_number = case.id if case else None

    for question in template.questions_list:
        field_id = f'question_{question.question_id}'
        raw_answer = form_data.get(field_id, '')

        if question.question_type.has_regex and question.question_type.regex_str:
            if not validate_regex(raw_answer,
                                  question.question_type.regex_str):
                flash(
                    f'Invalid format for question: {question.question_text}. Must match: {question.question_type.regex_str}'
                )
                return False

        # Convert boolean answers to string representation
        if isinstance(raw_answer, bool):
            answer_text = str(raw_answer).lower()
        else:
            answer_text = str(raw_answer)

        # Create and save an Answer instance for each question
        answer = Answer()
        answer.workflow_id = template.id
        answer.question_id = question.question_id
        answer.answer_text = answer_text
        # answer.user_id = user.user_id
        answer.case_id = case_id
        answer.case_number = case_number  # Set case_number here

        db.session.add(answer)

    db.session.commit()
    print("Answers saved successfully")
    return True


# ===================================


@app.route('/execute_workflow', methods=['GET', 'POST'])
def execute_workflow():

    print(f"\n in: execute_workflow")
    users = User.query.all()
    templates = WorkflowTemplate.query.all()

    # Print all request data
    if request.data:
        print(f"Request data: {request.data}")
    else:
        print("No request data available.")

    if request.method == 'POST':

        template_id = request.form.get('template_id')
        print(f"post 11:  template_id: {template_id}")

        user_id = request.form.get('user_id')  # Get the selected user ID
        template = WorkflowTemplate.query.get_or_404(template_id)

        # Debug template and print 'None' if not valued
        try:
            if template:
                print(f"Template ID: {template.id}")
                print(f"Template Name: {template.title}")
                print(f"Role IDs: {template.role_ids}")
                print(f"Question IDs: {template.question_ids}")

                print(f"Created at: {template.created_at}")
                print(f"Updated at: {template.updated_at}")
                if template.case:
                    print(f"case: {template.case}")
                else:
                    print("case: not valued")
            else:
                print("template=None")
        except AttributeError as e:
            print(f"Error accessing template attributes: {e}")

        # print(f'post 33')
        # Populate questions_list from question_ids
        template.questions_list = Question.query.filter(
            Question.question_id.in_(template.question_ids.split(','))).all()

        # print(f'post 44')

        # Create dynamic form based on the template
        form_class = generate_form(template)

        form = form_class()

        # Get existing case from hidden field or create new one
        case_id = request.form.get('case_number')
        if case_id:

            case = Case.query.get(case_id)
            if case:
                # List all components of case if it is valued
                for attr, value in case.__dict__.items():
                    if not attr.startswith('_'):  # Avoid internal attributes
                        print(f"Case component {attr}: {value}")
            else:
                print('No components of case')
        else:
            print("\nDebug: Creating new case components")

            print(f"\nDebug: Type (template):{type(template)}")

            wfc = WorkflowTemplate.query.filter_by(id=template.id).all()
            print(f"\nDebug: what is Type (wfc):{type(wfc)}")
            print(f"\nDebug: whats in wfc:{wfc.__repr__()}")

            # Create new case only if we don't have an existing one
            author = session.get('username', 'Anonymous')
            role_ids = template.role_ids.split(',')
            initial_role = role_ids[0] if role_ids else None

            user_id = request.form.get('user_id')

            case = Case()
            case.workflow_id = template.id
            case.current_role_id = initial_role
            case.author_username = author
            case.assigned_user_id = user_id

            first_approval_stage = ApprovalStage.query.filter_by(
                workflow_template_id=template_id, is_first=True).first()

            case.current_stage_id = first_approval_stage.stage_id

            # Get request values out of form and print them
            for field, value in form.data.items():
                print(f"== > !case - Form field {field} has value {value}")
            db.session.add(case)
            db.session.commit()

        if form.validate_on_submit():
            print(f"\n   ==>in: execute_workflow form validate.  ")

            # Get the current stage ID using the template_id
            current_stage_id = case.current_stage_id

            # If current_stage_id is empty, set it from approval stage
            if not current_stage_id:
                approval_stage = ApprovalStage.query.filter_by(
                    workflow_template_id=template.id, is_first=True).first()

                if approval_stage:
                    current_stage_id = approval_stage.id
                    case.current_stage_id = current_stage_id
                else:
                    print('No approval stage for this template')

            if not save_answers(template, form.data, case.id):
                return render_template('execute_workflow.html',
                                       form=form,
                                       template=template,
                                       case=case)

            # Move to the next role logic
            role_ids = template.role_ids.split(',')
            print(f"\nin: execute_workflow  role_ids:{role_ids}")

            current_role_index = role_ids.index(case.current_role_id)

            if current_role_index < len(role_ids) - 1:
                case.current_role_id = role_ids[current_role_index + 1]
            else:
                case.current_role_id = role_ids[-1]

            # Handle comment if provided
            comment_text = request.form.get('comment')
            if comment_text and comment_text.strip():
                comment = Comment()
                comment.content = comment_text
                comment.case_id = case.id
                comment.user_id = session.get('username', 'Anonymous')
                db.session.add(comment)

            db.session.commit()

            flash('Workflow step executed successfully!')
            return redirect(url_for('select_workflow_template'))

        return render_template('execute_workflow.html',
                               form=form,
                               template=template,
                               case=case)

    print(
        f"===> if get!   Number of users: {len(users)}  Templates{len(templates)}"
    )

    return render_template('select_workflow_template.html',
                           templates=templates,
                           users=users)


# ===================================

# =======================================


# main.py (Add a login route)
@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out')
    return redirect(url_for('login'))


# main.py (Add a login route)
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        # Check if the user exists in the database
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            # Save both username and user_id in session
            session['username'] = form.username.data
            session['user_id'] = user.user_id

            username = session.get('username')
            user_id = session.get('user_id')
            print(
                f"===\n\n /login Username: {form.username.data}, User ID: {user_id}"
            )

            # Adjust as per your login logic
            return redirect(url_for('select_workflow_template'))
        else:
            # Flash a message if user does not exist
            flash('User does not exist. Please check your username.')
    return render_template('login.html', form=form)


# ===================================================
@app.route('/view_case/<string:case_id>')
def view_case(case_id):

    print(f'\n\nview_case(case_id):{case_id}\n\n')

    # Fetch the case using the provided case_id
    case = Case.query.get_or_404(case_id)

    # Fetch the role name associated with the current role_id
    current_role = Role.query.get(case.current_role_id)
    current_role_name = current_role.role_name if current_role else "Unknown Role"

    # Fetch questions and related answers for this case
    questions_with_answers = []
    if case.workflow_template:
        question_ids = case.workflow_template.question_ids.split(',')
        questions = Question.query.filter(
            Question.question_id.in_(question_ids)).all()

        for question in questions:
            answer = Answer.query.filter_by(
                workflow_id=case.workflow_id,
                question_id=question.question_id,
                case_number=case.id  # Check case_number as well
            ).first()
            questions_with_answers.append((question, answer))

        # Pass the updated context to the template
    return render_template('view_case.html',
                           case=case,
                           current_role_name=current_role_name,
                           questions_with_answers=questions_with_answers)


#  =================================================
@app.route('/edit_case/<string:case_id>', methods=['GET', 'POST'])
def edit_case(case_id):
    # Indicate the beginning of the case editing process for debugging
    logger.debug(f"\n\n==>def edit_case({case_id}): ")

    # Fetch the case object from the database, return 404 if not found
    case = Case.query.get_or_404(case_id)
    logger.info(f"Fetched case with ID: {case_id}")
    # Retrieve the associated workflow template
    template = case.workflow_template
    logger.info(f"Workflow template retrieved for case ID: {case_id}")

    if case.current_stage_id:
        logger.debug(
            f"\n  ==>we HAVE a currstage. current stages id is:{case.current_stage_id}"
        )
    else:
        logger.debug('\n  ==>curr stage is none')

    if case.current_stage_id:
        # Query the ApprovalStage where the current stage ID matches
        current_stage = ApprovalStage.query.filter_by(
            stage_id=case.current_stage_id).first()
        logger.debug(f"current stage is: {current_stage}")
        if current_stage == case.current_stage_id:
            logger.debug(f"Current Stage Name: {current_stage.stage_name}")

    # Show current stage name instead of stage id in edit_case.html template
    # Fetch the current stage name
    current_stage_name = 'Unknown Stage'
    if case.current_stage_id:
        current_stage = ApprovalStage.query.get(case.current_stage_id)
        current_stage_name = current_stage.stage_name if current_stage else 'Unknown Stage'
        app.logger.debug(f"Fetched current_stage_name: {current_stage_name}")

    # Populate questions list from the template
    template.questions_list = Question.query.filter(
        Question.question_id.in_(template.question_ids.split(','))).all()
    app.logger.debug(
        f"Populated questions_list with {len(template.questions_list)} questions."
    )

    # Generate dynamic form based on the workflow template
    form_class = generate_form(template)
    form = form_class()
    app.logger.debug(f"Generated dynamic form for the template.")

    # Handle HTTP GET requests
    if request.method == 'GET':
        # Log GET request event
        app.logger.debug(
            f"\n\n  ==>/edit_case:{case_id}: request.method == 'GET' ")

        # Initialize dictionary to store pre-populated form data
        form_data = {}

        # Populate form data with existing answers from the database
        for question in template.questions_list:
            field_id = f'question_{question.question_id}'

            # Retrieve the corresponding answer from the database
            answer = Answer.query.filter_by(workflow_id=template.id,
                                            question_id=question.question_id,
                                            case_number=case.id).first()

            # Log the retrieval of answers
            app.logger.debug(
                f"Retrieved answer for question_id {question.question_id}: {'Found' if answer else 'Not Found'}"
            )

            # If answer exists and form has corresponding field, populate it
            if answer and hasattr(form, field_id):
                # Special handling for boolean fields
                if isinstance(getattr(form, field_id), BooleanField):
                    form_data[field_id] = answer.answer_text.lower() == 'true'
                else:
                    form_data[field_id] = answer.answer_text.strip()
                # Log the pre-populated data for debugging
                # print(f'Setting {field_id} to {form_data[field_id]}')

        # Recreate form with pre-populated data
        form = form_class(data=form_data)

    # Handle form submission
    if form.validate_on_submit():
        # Log form submission event
        logger.debug(f"Form submitted for case editing with ID: {case_id}")
        print(f"\n\n validate_on_submit(): Editing Case with ID: {case_id}")

        # Fetch current stage and determine next stage
        current_stage = ApprovalStage.query.get(case.current_stage_id)

        # Log current stage details
        logger.debug(f"Current stage: {current_stage}")
        if current_stage and current_stage.is_last:
            case.status = "completed"
            handle_case_event(case_id,
                              case.status,
                              old_value='active',
                              new_value='completed')
            logger.debug(f"Case ID {case_id} marked as completed.")
        elif current_stage:
            next_stage = ApprovalStage.query.filter_by(
                order=current_stage.order + 1).first()
            logger.debug(f"Next stage: {next_stage}")

            if not next_stage:
                logger.error(f"No next stage found for case ID {case_id}.")
                handle_case_event(case_id,
                                  event_type='completed',
                                  old_value=current_stage.stage_name,
                                  new_value='none')

                flash('The case has successfully completed all stages!')
            else:
                case.current_stage_id = next_stage.stage_id
                case.status = 'pending'
                handle_case_event(case_id,
                                  event_type='stage cahnge',
                                  old_value=current_stage.stage_name,
                                  new_value=current_stage.next_stage_name)
                logger.debug(
                    f"Case ID {case_id} current stage updated to {next_stage.stage_id}."
                )

        # Iterate over questions to update answers
        for question in template.questions_list:
            field_id = f'question_{question.question_id}'
            raw_answer = form.data.get(field_id, '')

            # Convert boolean answers to string
            answer_text = str(raw_answer).lower() if isinstance(
                raw_answer, bool) else str(raw_answer)

            # Validate answer against regular expression, if applicable
            if question.question_type.has_regex and question.question_type.regex_str:
                if not validate_regex(raw_answer,
                                      question.question_type.regex_str):
                    flash(
                        f'Invalid format for question: {question.question_text}. Must match: {question.question_type.regex_str}'
                    )
                    # Log regex validation failure
                    logger.warning(
                        f"Validation failed for question {question.question_text} with answer {raw_answer}."
                    )

                    # Re-render form with error message if validation fails
                    return render_template('edit_case.html',
                                           form=form,
                                           case=case,
                                           template=template)

            # Update or create the answer in the database
            answer = Answer.query.filter_by(workflow_id=template.id,
                                            question_id=question.question_id,
                                            case_number=case.id).first()

            # Log answer update or creation
            logger.debug(
                f"Answer for question ID {question.question_id} will be updated or created."
            )
            if answer:  # Update existing answer
                answer.answer_text = answer_text
            else:  # Create new answer if it doesn't exist
                # print("\n---> in form validation. print 222 if not answer")
                answer = Answer()
                answer.workflow_id = template.id
                answer.question_id = question.question_id
                answer.answer_text = answer_text
                answer.case_id = case.id
                answer.case_number = case.id
                db.session.add(answer)

        # Handle comment if provided
        comment_text = request.form.get('comment')
        if comment_text and comment_text.strip():
            comment = Comment()
            comment.content = comment_text
            comment.case_id = case.id
            comment.user_id = session.get('username', 'Anonymous')

            db.session.add(comment)

        # Commit all changes to the database and flash a success message
        db.session.commit()
        flash('Case updated successfully!')

        # Redirect to the view case page after successful update
        # return redirect(url_for('view_case', case_id=case_id))
        return redirect(url_for('select_workflow_template'))

    # Log the data of each form field for debugging purposes
    # for field, value in form.data.items():
    # print(f"form.data.items: {field}: value:{value}")

# Fetch comments for this case
    comments = Comment.query.filter_by(case_id=case_id).all()

    # Render the edit case template with the form, case, template and comments data
    return render_template('edit_case.html',
                           form=form,
                           case=case,
                           template=template,
                           comments=comments)


# ===================================================

if __name__ == '__main__':
    with app.app_context():
        print("111")
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)


@app.route('/screenbuilders')
def list_screenbuilders():
    screens = ScreenBuilder.query.all()
    return render_template('screenbuilders.html', screens=screens)


@app.route('/screenbuilder/new', methods=['GET', 'POST'])
def new_screenbuilder():
    form = ScreenBuilderForm()
    if form.validate_on_submit():
        screen = ScreenBuilder()
        screen.name = form.name.data
        screen.question_ids = request.form.get('orderedQuestions', '')
        screen.author = session.get('username', 'Anonymous')

        db.session.add(screen)
        db.session.commit()
        flash('Screen Builder created successfully!')
        return redirect(url_for('list_screenbuilders'))
    return render_template('screenbuilder_form.html', form=form)


@app.route('/screenbuilder/<string:id>/edit', methods=['GET', 'POST'])
def edit_screenbuilder(id):
    screen = ScreenBuilder.query.get_or_404(id)
    if request.method == 'GET':
        form = ScreenBuilderForm(obj=screen)
    else:
        form = ScreenBuilderForm()

    if form.validate_on_submit():
        screen.name = form.name.data
        screen.question_ids = request.form.get('orderedQuestions', '')
        screen.author = session.get('username', 'Anonymous')

        db.session.commit()
        flash('Screen Builder updated successfully!')
        return redirect(url_for('list_screenbuilders'))

    return render_template('screenbuilder_form.html', form=form, screen=screen)


@app.route('/screenbuilder/<string:id>/delete', methods=['POST'])
def delete_screenbuilder(id):
    screen = ScreenBuilder.query.get_or_404(id)
    db.session.delete(screen)
    db.session.commit()
    flash('Screen Builder deleted successfully!')
    return redirect(url_for('list_screenbuilders'))


@app.route('/approval_stages')
def list_approval_stages():
    stages = ApprovalStage.query.all()
    return render_template('approval_stages.html', stages=stages)


@app.route('/approval_stage/new', methods=['GET', 'POST'])
def new_approval_stage():
    form = ApprovalStageForm()

    # Print all items in the form
    for field, value in form.data.items():
        print(f"{field}: {value}")

        if not form.validate_on_submit():
            for fieldName, errorMessages in form.errors.items():
                for err in errorMessages:
                    app.logger.error(f"Error in {fieldName}: {err}")

    if form.validate_on_submit():
        stage = ApprovalStage()
        stage.stage_name = form.stage_name.data
        stage.order = form.order.data
        stage.conditions = form.conditions.data
        stage.next_stage_name = form.next_stage_name.data
        stage.last_stage_name = form.last_stage_name.data
        stage.is_first = form.is_first.data
        stage.is_last = form.is_last.data

        stage.workflow_template_id = form.workflow_template.data

        # Debugging the form.workflow_template.data
        print(f"\n\n Workflow Template Data: {form.workflow_template.data}")

        stage.approve_role_id = form.approve_role.data  # Form value is already the role_id
        stage.deny_role_id = form.deny_role.data  # Form value is already the role_id
        stage.author = session.get('username', 'Anonymous')

        db.session.add(stage)
        db.session.commit()
        flash('Approval Stage created successfully!')
        return redirect(url_for('list_approval_stages'))
    return render_template('approval_stage_form.html', form=form)


@app.route('/approval_stage/<string:id>/edit', methods=['GET', 'POST'])
def edit_approval_stage(id):
    stage = ApprovalStage.query.get_or_404(id)
    if request.method == 'GET':
        # Pre-select the current roles in the form
        form = ApprovalStageForm(obj=stage)
        form.approve_role.data = stage.approve_role_id
        form.deny_role.data = stage.deny_role_id
        form.workflow_template.data = stage.workflow_template_id
    else:
        form = ApprovalStageForm()

    if form.validate_on_submit():
        stage.stage_name = form.stage_name.data
        stage.next_stage_name = form.next_stage_name.data
        stage.last_stage_name = form.last_stage_name.data
        stage.is_first = form.is_first.data
        stage.is_last = form.is_last.data
        stage.workflow_template_id = form.workflow_template.data
        stage.approve_role_id = form.approve_role.data
        stage.deny_role_id = form.deny_role.data
        stage.modified_by = session.get('username', 'Anonymous')

        db.session.commit()
        flash('Approval Stage updated successfully!')
        return redirect(url_for('list_approval_stages'))

    return render_template('approval_stage_form.html', form=form, stage=stage)


@app.route('/approval_stage/<string:id>/delete', methods=['POST'])
def delete_approval_stage(id):
    stage = ApprovalStage.query.get_or_404(id)
    db.session.delete(stage)
    db.session.commit()
    flash('Approval Stage deleted successfully!')
    return redirect(url_for('list_approval_stages'))


# ==================================


@app.route('/optionlists')
def list_optionlists():
    optionlists = OptionList.query.all()
    return render_template('optionlists.html', optionlists=optionlists)


@app.route('/optionlist/new', methods=['GET', 'POST'])
def new_optionlist():
    form = OptionListForm()
    if form.validate_on_submit():
        optionlist = OptionList()
        optionlist.name = form.name.data
        optionlist.list_data = form.list_data.data
        optionlist.version = form.version.data
        optionlist.supercedes = form.supercedes.data
        optionlist.author = form.author.data

        db.session.add(optionlist)
        db.session.commit()
        flash('Option List created successfully!')
        return redirect(url_for('list_optionlists'))
    return render_template('optionlist_form.html',
                           form=form,
                           title='New Option List')


@app.route('/optionlist/<string:id>/edit', methods=['GET', 'POST'])
def edit_optionlist(id):
    optionlist = OptionList.query.get_or_404(id)
    form = OptionListForm(obj=optionlist)
    if form.validate_on_submit():
        optionlist.name = form.name.data
        optionlist.list_data = form.list_data.data
        optionlist.version = form.version.data
        optionlist.supercedes = form.supercedes.data
        optionlist.author = form.author.data

        db.session.commit()
        flash('Option List updated successfully!')
        return redirect(url_for('list_optionlists'))
    return render_template('optionlist_form.html',
                           form=form,
                           title='Edit Option List')


@app.route('/optionlist/<string:id>/delete', methods=['POST'])
def delete_optionlist(id):
    optionlist = OptionList.query.get_or_404(id)
    db.session.delete(optionlist)
    db.session.commit()
    flash('Option List deleted successfully!')
    return redirect(url_for('list_optionlists'))


# ================================
@app.route('/save_draft/<string:case_id>', methods=['GET', 'POST'])
def save_draft(case_id):
    print(f"Saving draft for case ID: {case_id}")


@app.route('/notifications')
def get_notifications():
    user_id = session.get('user_id')
    if not user_id:
        return "Please log in first", 403

    notifications = InternalMessage.query.filter_by(
        to_user_id=user_id,
        is_read=False).order_by(InternalMessage.created_at.desc()).all()

    return render_template('notifications.html', notifications=notifications)


@app.route('/notifications/mark_read/<string:message_id>', methods=['POST'])
def mark_notification_read(message_id):
    user_id = session.get('user_id')
    if not user_id:
        return "Please log in first", 403

    message = InternalMessage.query.get_or_404(message_id)
    if message.to_user_id != user_id:
        return "Unauthorized", 403

    message.is_read = True
    db.session.commit()
    flash('Notification marked as read')
    return redirect(url_for('get_notifications'))


@app.route('/notifications/mark_all_read', methods=['POST'])
def mark_all_notifications_read():
    user_id = session.get('user_id')
    if not user_id:
        return "Please log in first", 403

    InternalMessage.query.filter_by(to_user_id=user_id, is_read=False).update(
        {InternalMessage.is_read: True})

    db.session.commit()
    flash('All notifications marked as read')
    return redirect(url_for('get_notifications'))

    flash('Draft saved successfully!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/save_template/<string:case_id>', methods=['GET', 'POST'])
def save_template(case_id):
    print(f"Saving template for case ID: {case_id}")
    flash('Template saved successfully!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/change_reviewer/<string:case_id>', methods=['GET', 'POST'])
def change_reviewer(case_id):
    print(f"Changing reviewer for case ID: {case_id}")
    flash('Reviewer changed successfully!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/edit/<string:case_id>', methods=['GET', 'POST'])
def edit(case_id):
    print(f"Editing case ID: {case_id}")
    flash('Case edited!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/resubmit/<string:case_id>', methods=['GET', 'POST'])
def resubmit(case_id):
    print(f"Resubmitting case ID: {case_id}")
    flash('Case resubmitted!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/approve/<string:case_id>', methods=['GET', 'POST'])
def approve_case(case_id):
    print(f"Approving case ID: {case_id}")
    flash('Case approved!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/deny/<string:case_id>', methods=['GET', 'POST'])
def deny_case(case_id):
    print(f"Denying case ID: {case_id}")
    try:
        # Fetch the case by the given case_id
        case = Case.query.get_or_404(case_id)

        # Fetch the approval stage where it's the first stage in the workflow
        approval_stage = ApprovalStage.query.filter_by(
            workflow_template_id=case.workflow_id, is_first=True).first()

        # Update the current stage of the case to the first stage
        if approval_stage:
            case.current_stage_id = approval_stage.stage_id
            db.session.commit()
            flash('Case denied and moved back to the first stage!')
        else:
            flash('No initial stage found for the case template!')
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error denying case ID {case_id}: {e}")
        flash('An error occurred while denying the case.')

    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/reassign/<string:case_id>', methods=['GET', 'POST'])
def reassign_user(case_id):
    case = Case.query.get_or_404(case_id)
    users = User.query.all()

    if request.method == 'POST':
        new_user_id = request.form.get('new_user_id')
        if new_user_id:
            case.assigned_user_id = new_user_id
            db.session.commit()
            flash('User reassigned successfully!')
            return redirect(url_for('edit_case', case_id=case_id))

    return render_template('reassign_user.html', case=case, users=users)


# @app.route('/reassign/<string:case_id>', methods=['GET', 'POST'])
# def deny_case(case_id):
#     print(f"reassign case ID: {case_id}")
#     flash('Case denied!')  # Placeholder response
#     return redirect(url_for('edit_case', case_id=case_id))


@app.route('/return_to_previous/<string:case_id>', methods=['GET', 'POST'])
def return_to_previous(case_id):
    print(f"Returning to previous for case ID: {case_id}")
    flash('Returned to previous step!')  # Placeholder response
    return redirect(url_for('edit_case', case_id=case_id))


@app.route('/dashboard')
def dashboard():
    stats = {
        'active': Case.query.filter_by(status='active').count(),
        'pending': Case.query.filter_by(status='pending').count(),
        'completed': Case.query.filter_by(status='completed').count(),
        'abandoned': Case.query.filter_by(status='abandoned').count()
    }
    return render_template('dashboard.html', stats=stats)
