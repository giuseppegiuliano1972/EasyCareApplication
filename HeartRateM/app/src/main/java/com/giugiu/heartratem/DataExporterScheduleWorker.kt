package com.giugiu.heartratem


import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.getSystemService
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.google.gson.Gson
import io.ktor.client.HttpClient
import io.ktor.client.engine.android.Android
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.time.LocalDate
import java.time.ZonedDateTime
import java.util.TimeZone


val httpClient = HttpClient(Android)

val requiredHealthConnectPermissions = setOf(
    HealthPermission.getReadPermission(StepsRecord::class),
    HealthPermission.getReadPermission(HeartRateRecord::class),
)

class DataExporterScheduleWorker(
    appContext: Context, workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {
    private val notificationManager = applicationContext.getSystemService<NotificationManager>()!!
    private val healthConnect = HealthConnectClient.getOrCreate(applicationContext)

    private fun createNotificationChannel(): NotificationChannel {
        val notificationChannel = NotificationChannel(
            "export",
            "Data export",
            NotificationManager.IMPORTANCE_LOW,
        )
        notificationChannel.description = "Shown when Health Connect data is being exported"
        notificationChannel.enableLights(false)
        notificationChannel.enableVibration(false)

        notificationManager.createNotificationChannel(notificationChannel)
        return notificationChannel
    }

    private fun createExceptionNotification(e: Exception): Notification {
        return NotificationCompat.Builder(applicationContext, "export")
            .setContentTitle("Export failed")
            .setContentText("Failed to export Health Connect data")
            .setStyle(NotificationCompat.BigTextStyle().bigText(e.message))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .build()
    }

    private suspend fun isHealthConnectPermissionGranted(healthConnect: HealthConnectClient): Boolean {
        val grantedPermissions = healthConnect.permissionController.getGrantedPermissions()
        return requiredHealthConnectPermissions.all { it in grantedPermissions }
    }

    override suspend fun doWork(): Result {
        val notificationChannel = createNotificationChannel()


        // Set up foreground notification
       /* val foregroundNotification = NotificationCompat.Builder(applicationContext, notificationChannel.id)
            .setContentTitle("Exporting Data")
            .setContentText("Health Connect data export in progress")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .build()

        setForeground(ForegroundInfo(1, foregroundNotification));*/

        Log.d("DataExporterWorker", "Checking exports prerequisites")
        //val isGranted = isHealthConnectPermissionGranted(healthConnect)
        val isGranted = healthConnect.permissionController.getGrantedPermissions().containsAll(requiredHealthConnectPermissions)

        if (!isGranted) {
            Log.d("DataExporterWorker", "Health Connect permissions not granted")
            return Result.failure()
        }
        Log.d("DataExporterWorker", "✅ Health Connect permissions granted")

        val exportDestination: String? = try {
            applicationContext.dataStore.data.map { it[EXPORT_DESTINATION_URI] }.first()

        } catch (e: Exception) {
            Log.e("DataExporterWorker", "Export destination not set", e)
            return Result.failure()
        }


        Log.d("DataExporterWorker", "✅ Export destination set")

        val foregroundNotification = NotificationCompat.Builder(applicationContext, notificationChannel.id)
            .setContentTitle("Exporting data")
            .setContentText("Exporting Health Connect data to the cloud")
            .setSmallIcon(R.drawable.ic_launcher_foreground).setOngoing(true)
            .build()

        notificationManager.notify(1, foregroundNotification)

        val zoneId = TimeZone.getDefault().toZoneId()
       // val startOfDay = LocalDate.now(zoneId).atStartOfDay(zoneId).minusMinutes(50).toInstant()
       // val endOfDay = LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant().minusMillis(1)

        // Start of day: mezzanotte del giorno corrente
        val startOfDay = LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant()

        // End of day: orario e data attuali
        val endOfDay = ZonedDateTime.now(zoneId).toInstant()

        Log.d("DataExporterWorker", "Fetching health data")
        val healthDataAggregate = try {
            healthConnect.aggregate(
                AggregateRequest(
                    metrics = setOf(
                        StepsRecord.COUNT_TOTAL,
                        HeartRateRecord.BPM_AVG,
                    ),
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, endOfDay),
                )
            )
        } catch (e: Exception) {
            Log.e("DataExporterWorker", "Failed to fetch health data", e)
            return Result.failure()
        }

        Log.d("DataExporterWorker", "Raw data: ${Gson().toJson(healthDataAggregate)}")

        val jsonValues = HashMap<String, Number>()
        jsonValues["steps"] = healthDataAggregate[StepsRecord.COUNT_TOTAL] ?: 0
        jsonValues["heart_rate_bpm"] = healthDataAggregate[HeartRateRecord.BPM_AVG]?.toLong() ?: 0
        val json = Gson().toJson(mapOf("time" to startOfDay.toEpochMilli(), "data" to jsonValues))
        Log.d("DataExporterWorker", "Data: $json")

        try {
            val response = httpClient.post("http://$exportDestination") {
                contentType(ContentType.Application.Json)
                setBody(json)
            }
            Log.d("DataExporterWorker", "HTTP Response: ${response.status}")
        } catch (e: Exception) {
            Log.e("DataExporterWorker", "Failed to export data", e)
            notificationManager.cancel(1)
            notificationManager.notify(1, createExceptionNotification(e))
            return Result.failure()
        }

        notificationManager.cancel(1)
        return Result.success()
    }
}