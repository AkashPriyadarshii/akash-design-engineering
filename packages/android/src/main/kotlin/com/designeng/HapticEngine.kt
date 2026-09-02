package com.designeng

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.VibrationEffect.Composition
import android.os.Vibrator
import android.os.VibratorManager

/**
 * Advanced native Android haptics coordinator using API 30+ Composition primitives
 */
class HapticEngine(private val context: Context) {

    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    /**
     * Mechanical tactile click
     */
    fun performClick(intensity: Float = 0.9f) {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return

        val clamped = intensity.coerceIn(0.0f, 1.0f)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && 
            v.areAllPrimitivesSupported(Composition.PRIMITIVE_CLICK)) {
            val effect = VibrationEffect.startComposition()
                .addPrimitive(Composition.PRIMITIVE_CLICK, clamped)
                .compose()
            v.vibrate(effect)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && v.hasAmplitudeControl()) {
            val timings = longArrayOf(0, 10)
            val amplitudes = intArrayOf(0, (clamped * 255).toInt().coerceIn(1, 255))
            v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
        } else {
            @Suppress("DEPRECATION")
            v.vibrate(12)
        }
    }

    /**
     * Subtle rotary detent tick
     */
    fun performTick(scale: Float = 0.5f) {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return

        val clamped = scale.coerceIn(0.0f, 1.0f)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && 
            v.areAllPrimitivesSupported(Composition.PRIMITIVE_TICK)) {
            val effect = VibrationEffect.startComposition()
                .addPrimitive(Composition.PRIMITIVE_TICK, clamped)
                .compose()
            v.vibrate(effect)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            v.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && v.hasAmplitudeControl()) {
            val timings = longArrayOf(0, 5)
            val amplitudes = intArrayOf(0, (clamped * 140).toInt().coerceIn(1, 255))
            v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
        }
    }
}
