# Generated by Django 5.0.1 on 2024-12-07 17:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('easycare', '0004_alter_checkmsghelp_data_check'),
    ]

    operations = [
        migrations.AlterField(
            model_name='checkmsghelp',
            name='data_check',
            field=models.TimeField(),
        ),
    ]
