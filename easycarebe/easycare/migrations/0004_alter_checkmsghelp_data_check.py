# Generated by Django 5.0.1 on 2024-12-07 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('easycare', '0003_checkmsghelp_descrizione'),
    ]

    operations = [
        migrations.AlterField(
            model_name='checkmsghelp',
            name='data_check',
            field=models.TimeField(auto_now=True),
        ),
    ]
