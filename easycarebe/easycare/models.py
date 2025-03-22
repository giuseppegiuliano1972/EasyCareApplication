from django.db import models

class MemoRemind(models.Model):
    descrizione = models.TextField()
    data_remind = models.DateField()
    ora_remind  = models.TimeField()
    email = models.EmailField()

    def __str__(self):
        return self.descrizione

class CheckMsgHelp(models.Model):
    idgen = models.IntegerField(default=1)
    descrizione = models.TextField(default='')
    data_check = models.FloatField()

    def __str__(self):
        return self.descrizione
    

class HeartRate(models.Model):
    id = models.IntegerField(primary_key=True)
    timest = models.DateTimeField()
    heartbeatavg = models.IntegerField()

    def __str__(self):
        return f"{self.timest} - {self.heartbeatavg}"

