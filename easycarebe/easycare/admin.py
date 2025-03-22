from django.contrib import admin
from .models import MemoRemind
from .models import CheckMsgHelp
from .models import HeartRate


# Register your models here.
admin.site.register(MemoRemind)
admin.site.register(CheckMsgHelp)
admin.site.register(HeartRate)