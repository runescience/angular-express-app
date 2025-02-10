from wtforms.validators import DataRequired
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import DataRequired, Length
from wtforms import StringField, SelectMultipleField, SubmitField
from wtforms import StringField, SelectField, validators
from flask_wtf import FlaskForm
from wtforms import (
    BooleanField,
    DateTimeField,
    PasswordField,
    SelectField,
    SelectMultipleField,
    StringField,
    SubmitField,
    TextAreaField,
)
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional

from wtforms import StringField, IntegerField, SelectField, validators

from models import Role, WorkflowTemplate, ScreenBuilder


class TeamForm(FlaskForm):
    team_name = StringField('Team Name', validators=[DataRequired()])
    description = TextAreaField('Description')
    contact = StringField('Contact')
    is_active = BooleanField('Active')
    created_on = DateTimeField('Created On', render_kw={'readonly': True})
    updated_on = DateTimeField('Updated On', render_kw={'readonly': True})


class RoleForm(FlaskForm):
    role_name = StringField('Role Name', validators=[DataRequired()])
    description = TextAreaField('Description')
    is_active = BooleanField('Active')
    created_on = DateTimeField('Created On', render_kw={'readonly': True})
    updated_on = DateTimeField('Updated At', render_kw={'readonly': True})


class UserForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email')  # Removed DataRequired and Email validator
    password = PasswordField('Password', validators=[DataRequired()])
    retype_password = PasswordField(
        'Retype Password')  # Removed validators to make it optional
    is_active = BooleanField('Active')

    roles = SelectMultipleField('Roles',
                                choices=[],
                                coerce=str,
                                render_kw={'size': 10})

    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        self.roles.choices = [(str(role.role_id), role.role_name)
                              for role in Role.query.all()]


# ==================================


class QuestionTypeForm(FlaskForm):
    type = StringField('Type', validators=[DataRequired()])

    has_regex = BooleanField('Has Regex', validators=[Optional()])
    regex_str = StringField('Regex String', validators=[Optional()])

    has_options = BooleanField('Has Options', validators=[Optional()])
    options_str = TextAreaField('Options', validators=[Optional()])

    has_supplemental = BooleanField('Has Supplemental',
                                    validators=[Optional()])
    supplemental_str = StringField('Supplemental String',
                                   validators=[Optional()])

    author = StringField('Author', validators=[Optional()])
    submit = SubmitField('Submit')

    def validate(self, extra_validators=None):

        # Call the parent validation method
        if not super(QuestionTypeForm, self).validate():
            return False

        print(
            f"these values hasregex:{self.has_regex.data} and hasopts:{self.has_options.data}"
        )

        # Validate options and regex conditions
        if self.has_regex.data and self.has_options.data:
            self.has_options.errors.append(
                'Cannot have both Regex and Options selected.')
            print("cannot do both")
            return False

        # Validate options based on has_options
        if self.has_options.data and not self.options_str.data:
            self.options_str.errors.append(
                'Options must not be blank when Has Options is selected.')
            print("needs options if checked")
            return False

        # Validate regex_str based on has_regex
        if self.has_regex.data and not self.regex_str.data:
            self.regex_str.errors.append(
                'Regex String must not be blank when Has Regex is selected.')
            print("needs regex if checked")
            return False

        # Validate supplemental_str based on has_supplemental
        if self.has_supplemental.data and not self.supplemental_str.data:
            self.supplemental_str.errors.append(
                'Supplemental String must not be blank when Has Supplemental is selected.'
            )
            print("needs supple if checked")
            return False
        return True


# ===============================


class QuestionForm(FlaskForm):
    question_text = StringField(
        'Question Text',
        validators=[validators.DataRequired(),
                    validators.Length(max=500)])

    question_type = SelectField('Question Type',
                                coerce=str,
                                validators=[validators.DataRequired()])

    question_help = StringField('Help Text',
                                validators=[validators.Optional()
                                            ])  # Adding this line
    author = StringField('Author', validators=[Optional()])

    def __init__(self, *args, **kwargs):
        super(QuestionForm, self).__init__(*args, **kwargs)
        from models import QuestionType
        # Load all active question types
        self.question_type.choices = [
            (str(qt.question_type_id), qt.type)
            for qt in QuestionType.query.filter_by(
                is_active=True).order_by(QuestionType.type).all()
        ]


# =====================================================


class WorkflowTemplateForm(FlaskForm):
    title = StringField('Workflow Title',
                        validators=[DataRequired(),
                                    Length(max=255)])

    roles = SelectMultipleField(
        'Roles',
        choices=[],  # Populate choices from the database
        coerce=str)

    questions = SelectMultipleField(
        'Questions',
        choices=[],  # Populate choices from the database
        coerce=str)

    author = StringField('Author',
                         validators=[DataRequired(),
                                     Length(max=255)])

    submit = SubmitField('Submit')

    def __init__(self, *args, **kwargs):
        super(WorkflowTemplateForm, self).__init__(*args, **kwargs)
        # Populate choices dynamically
        from models import Role, Question
        self.roles.choices = [(str(role.role_id), role.role_name)
                              for role in Role.query.all()]
        self.questions.choices = [(str(q.question_id), q.question_text)
                                  for q in Question.query.all()]


# ===================================================

# forms.py


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    # PasswordField can be optional if there's no password requirement
    submit = SubmitField('Login')


#
# ===================================================


def generate_form(template):
    """
    Function to dynamically generate a form class based on a given workflow template.

    Args:
    - template (WorkflowTemplate): A workflow template containing questions and their types.

    Returns:
    - Type: A dynamically-created Flask form class.
    """

    class DynamicForm(FlaskForm):
        pass

    for question in template.questions_list:
        field_id = f'question_{question.question_id}'
        question_type = question.question_type.type  # Access the type via relationship
        if question_type == 'checkbox':
            field = BooleanField(question.question_text)
        elif question_type == 'select':

            # Get the options for the select type from the QuestionType options_str
            options_str = question.question_type.options_str
            options = [
                (option.strip(), option.strip())
                for option in (options_str.split(',') if options_str else [])
            ]
            field = SelectField(
                question.question_text,
                choices=options,  # Creating choice tuples
                validators=[Optional()])

        elif question_type == 'text':
            field = StringField(question.question_text,
                                validators=[Optional()])
        elif question_type == 'textarea':
            field = TextAreaField(question.question_text,
                                  validators=[Optional()])
        else:
            # Default field
            field = StringField(question.question_text,
                                validators=[Optional()])

        # Assign field to the dynamically generated form class
        setattr(DynamicForm, field_id, field)

    # Add a submit button to the form
    setattr(DynamicForm, 'submit', SubmitField('Submit'))

    return DynamicForm


# ===================================================


class ScreenBuilderForm(FlaskForm):
    name = StringField('Screen Name', validators=[DataRequired()])
    questions = SelectMultipleField('Questions', choices=[], coerce=str)

    def __init__(self, *args, **kwargs):
        super(ScreenBuilderForm, self).__init__(*args, **kwargs)
        from models import Question
        self.questions.choices = [(str(q.question_id), q.question_text)
                                  for q in Question.query.all()]


class ApprovalStageForm(FlaskForm):
    stage_name = StringField('Stage Name', validators=[DataRequired()])
    order = IntegerField('Order', validators=[DataRequired()])
    conditions = StringField('Conditions', validators=[Optional()])

    next_stage_name = SelectField('Next Stage Name', coerce=str)
    last_stage_name = SelectField('Last Stage Name', coerce=str)

    is_first = BooleanField('Is First Stage')
    is_last = BooleanField('Is Last Stage')
    workflow_template = SelectField('Workflow Template', coerce=str)
    approve_role = SelectField('Approve Role',
                               coerce=str,
                               validators=[DataRequired()])
    deny_role = SelectField('Deny Role',
                            coerce=str,
                            validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(ApprovalStageForm, self).__init__(*args, **kwargs)

        from models import ApprovalStage
        stages = ApprovalStage.query.all()
        stage_choices = [(stage.stage_name, stage.stage_name)
                         for stage in stages]
        stage_choices.insert(0, ('', 'None'))

        self.next_stage_name.choices = stage_choices
        self.last_stage_name.choices = stage_choices

        self.workflow_template.choices = [
            (wt.id, wt.title) for wt in WorkflowTemplate.query.all()
        ]
        self.approve_role.choices = [(role.role_id, role.role_name)
                                     for role in Role.query.all()]
        self.deny_role.choices = [(role.role_id, role.role_name)
                                  for role in Role.query.all()]


# ============================


class OptionListForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    list_data = TextAreaField('List_data', validators=[Optional()])
    version = StringField('Version', validators=[Optional()])
    supercedes = StringField('Supercedes', validators=[Optional()])
    author = StringField('Author', validators=[DataRequired()])
    submit = SubmitField('Submit')
