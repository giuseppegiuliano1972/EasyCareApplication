from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from twilio.rest import Client
from datetime import date, datetime, timedelta
from django.db.models import Avg
import time

from .models import MemoRemind
from .models import CheckMsgHelp
from .models import HeartRate

import json
import logging

logger = logging.getLogger(__name__)


# Configurazione Twilio
TWILIO_ACCOUNT_SID = '@@@@@@@@'
TWILIO_AUTH_TOKEN = ''@@@@@@@@''
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'
EMERGENCY_CONTACT = 'whatsapp:+3911111111111'

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["POST"])
def getListMemo(request):
    if request.method == 'POST':
        date_memo = request.POST.get('dtmemo', None)
        print("date_memo:", date_memo )
        startdate = str(date_memo)
        objects = MemoRemind.objects.filter(data_remind=startdate)
        #descr = [item.descrizione for item in objects]
        # Estrai descrizione e ora_remind
        memo_list = [
            f"{item.descrizione} alle ore {item.ora_remind.strftime('%H:%M')}" 
            for item in objects
        ]

        print("OBJ:", memo_list )
        if len(memo_list) > 0:
            return JsonResponse({'message': memo_list })
        else:
            return JsonResponse({'message': 'Nessun promemoria per la data richiesta' }) 

@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["POST"])
def getListCalendar(request):
    if request.method == 'POST':
        mese = request.POST.get('dtmese', None)
        anno = request.POST.get('dtanno', None)
        print("mese:", mese )
        
        objects = MemoRemind.objects.filter(data_remind__year=anno).filter(data_remind__month=mese)
        if len(objects) > 0:
            data = [{"descrizione": obj.descrizione, "data_remind": obj.data_remind.strftime('%Y-%m-%d')} for obj in objects]
            return JsonResponse(data, safe=False)
        else:
            return JsonResponse({'message': 'Nessun dato' }) 


@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["POST"])
def insMemo(request):
    if request.method == 'POST':
        descr = request.POST.get('descrmemo','')
        datamemo = request.POST.get('datamemo','')
        oramemo = request.POST.get('oramemo','')
        logger.info(f"descr: {descr}")

        memorem = MemoRemind(descrizione=descr, data_remind=datamemo, ora_remind=oramemo)
        memorem.save()  
        
        return JsonResponse({'message': 'Dati salvati con successo!'})
    

@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["POST"])
def heart_rate(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print("REQ: ", data['data']['steps'])
        print("heart_rate")
        heart_rate = data['data']['heart_rate_bpm']
        steps = data['data']['steps']
        print("heart_rate::",heart_rate )
        print("steps::",steps )
        hrate = HeartRate(timest=datetime.now(), heartbeatavg=int(heart_rate))
        hrate.save()  
        return JsonResponse({'message': 'Dati salvati con successo!'})

@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["GET"])
def heart_rate_data(request):
    if request.method == 'GET':
        # Recupera i dati dalla model HeartRate
        data = HeartRate.objects.all().values('timest', 'heartbeatavg')
        # Converte i dati in un formato JSON-friendly
        response_data = list(data)
    return JsonResponse(response_data, safe=False)

@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto.
@require_http_methods(["GET"])
def heart_rate_check(request):
    if request.method == 'GET':
         # Calcola la data limite (due giorni fa)
        two_days_ago = datetime.now() - timedelta(days=2)
        
        # Filtra i record con timest negli ultimi due giorni
        recent_data = HeartRate.objects.filter(timest__gte=two_days_ago)
        
        # Calcola la media di heartbeatavg
        average_heartbeat = recent_data.aggregate(avg_heartbeat=Avg('heartbeatavg'))['avg_heartbeat']
        print("average_heartbeat::",average_heartbeat )
        return JsonResponse({"hmavg": average_heartbeat}, safe=False)


@csrf_exempt  # Per semplicità, disabilita il controllo CSRF. Vedi nota sotto. 
@require_http_methods(["POST"])
def send_help_message(request):
    try:
        print("dentro:")
        dtRef = CheckMsgHelp.objects.all().first()
        dtVal = dtRef.data_check
        print("dtVal:", dtVal)
        sendMsg = False
      
        if dtVal == None:
            dt_obj = datetime.now()
            millisec = dt_obj.timestamp() * 1000
            dtRef = CheckMsgHelp(data_check=millisec)
            dtRef.save()
            sendMsg = True
        else:
            dt_now = datetime.now()
            millisec = dt_now.timestamp() * 1000
            print("dt_now:", millisec, dtVal)
            print("dt_to_check:", dtVal)
            diff_time = abs(millisec - dtVal)
            print("DIFF:", diff_time)
            if diff_time > 50000:
               
                current_time = millisec
                print("fsdfsdfs", current_time)
                change = CheckMsgHelp.objects.get(idgen=1)
                print("ret:", change.data_check, current_time )
                change.data_check=current_time
                change.save()
                sendMsg = True
            else:
                sendMsg = False

        if sendMsg:
            data = json.loads(request.body)
            
            message = data.get("message", "Richiesta di aiuto! Si prega di intervenire immediatamente.")
            
            # Invia il messaggio su WhatsApp
            client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=EMERGENCY_CONTACT
            )
            return JsonResponse({"status": "success", "message": "Messaggio inviato su WhatsApp"})
        else:
            return JsonResponse({"status": "next", "message": "Attendere per inviare un nuovo messaggio"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})
    
def time_to_float(time_str):
    #print("ddddd: ", time_str)
    # Splitta l'ora, minuti e secondi
    r_value =  str(time_str).split(":")
    #print("ddddd: ", r_value)
    # Calcola il valore float
    return (int(r_value[0]) + (int(r_value[1]) / 60) + (int(r_value[2]) / 3600)) * 100000000
        