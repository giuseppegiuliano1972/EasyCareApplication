package com.giugiu.heartratem.ui.viewmodels

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequest
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import kotlinx.coroutines.guava.await
import com.giugiu.heartratem.DataExporterScheduleWorker
import java.time.Duration
import java.util.concurrent.TimeUnit

const val WORK_NAME = "HeartRateMonitor"
const val WORK_NAME_ONCE = "HealthConnectExporter"

val dataExportRequest: PeriodicWorkRequest =
    PeriodicWorkRequestBuilder<DataExporterScheduleWorker>(
        repeatInterval = 1, repeatIntervalTimeUnit = TimeUnit.MINUTES,
        flexTimeInterval = 1, flexTimeIntervalUnit = TimeUnit.MINUTES
    )
        .setConstraints(
            Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        )
        .setBackoffCriteria(
            BackoffPolicy.LINEAR,
            Duration.ofMinutes(2),
        )
        .build()


class ExporterBackgroundWorkViewModel(application: Application) : AndroidViewModel(application) {
    val workManager = WorkManager.getInstance(application)

    suspend fun isWorkScheduled(): Boolean {
        val workQuery = workManager.getWorkInfosForUniqueWork(WORK_NAME).await()
        Log.d("ExporterBackgroundWorkViewModel", "Time until next work: ${workQuery.firstOrNull()?.nextScheduleTimeMillis}")
        return workQuery.size > 0
    }

    fun scheduleWork() {
        workManager.enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.UPDATE, dataExportRequest)
        Log.d("ExporterBackgroundWorkViewModel", "Scheduled work")
    }

    fun cancelWork() {
        workManager.cancelUniqueWork(WORK_NAME)
    }
}