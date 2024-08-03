# Generated by Django 4.2.13 on 2024-07-19 02:52

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import piezas.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('role', models.CharField(choices=[('FN', 'FUNCIONARIO'), ('AD', 'ADMIN')], default='FN', max_length=2)),
                ('rut', models.CharField(help_text='Enter unique identifier without dots or dashes', max_length=9, unique=True, validators=[piezas.validators.validateRut])),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Artifact',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('description', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='ArtifactRequester',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('rut', models.CharField(max_length=9)),
                ('email', models.EmailField(max_length=254)),
                ('comments', models.TextField(max_length=500, null=True)),
                ('is_registered', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Culture',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='CultureIds',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('culture', models.IntegerField()),
                ('artifactid', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('path', models.ImageField(unique=True, upload_to='images/')),
            ],
        ),
        migrations.CreateModel(
            name='Institution',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Model',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('texture', models.ImageField(upload_to='materials/')),
                ('object', models.FileField(upload_to='objects/')),
                ('material', models.FileField(upload_to='materials/')),
            ],
        ),
        migrations.CreateModel(
            name='Shape',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='ShapeIds',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('shape', models.IntegerField()),
                ('artifactid', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='TagsIds',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('tag', models.IntegerField()),
                ('artifactid', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Thumbnail',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('path', models.ImageField(unique=True, upload_to='thumbnails/')),
            ],
        ),
        migrations.AddConstraint(
            model_name='tagsids',
            constraint=models.UniqueConstraint(fields=('tag', 'artifactid'), name='unique_tag_artifact'),
        ),
        migrations.AddConstraint(
            model_name='shapeids',
            constraint=models.UniqueConstraint(fields=('shape', 'artifactid'), name='unique_shape_artifact'),
        ),
        migrations.AddConstraint(
            model_name='model',
            constraint=models.UniqueConstraint(fields=('texture', 'object', 'material'), name='unique_model_triplet'),
        ),
        migrations.AddField(
            model_name='image',
            name='id_artifact',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='images', to='piezas.artifact'),
        ),
        migrations.AddConstraint(
            model_name='cultureids',
            constraint=models.UniqueConstraint(fields=('culture', 'artifactid'), name='unique_culture_artifact'),
        ),
        migrations.AddField(
            model_name='artifactrequester',
            name='artifact',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='artifact_requester', to='piezas.artifact'),
        ),
        migrations.AddField(
            model_name='artifactrequester',
            name='institution',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='artifact_requester', to='piezas.institution'),
        ),
        migrations.AddField(
            model_name='artifact',
            name='id_culture',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='artifact', to='piezas.culture'),
        ),
        migrations.AddField(
            model_name='artifact',
            name='id_model',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='artifact', to='piezas.model'),
        ),
        migrations.AddField(
            model_name='artifact',
            name='id_shape',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='artifact', to='piezas.shape'),
        ),
        migrations.AddField(
            model_name='artifact',
            name='id_tags',
            field=models.ManyToManyField(blank=True, related_name='artifact', to='piezas.tag'),
        ),
        migrations.AddField(
            model_name='artifact',
            name='id_thumbnail',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='artifact', to='piezas.thumbnail'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='institution',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='piezas.institution'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions'),
        ),
    ]
