package com.designeng

import kotlin.math.*

data class KotlinSpringConfig(
    val stiffness: Float = 180f,
    val damping: Float = 12f,
    val mass: Float = 1f,
    val restThreshold: Float = 0.001f
)

class KotlinKineticSpring(
    var current: Float,
    var config: KotlinSpringConfig = KotlinSpringConfig()
) {
    var target: Float = current
    var velocity: Float = 0f

    fun retarget(newTarget: Float, initialVelocity: Float? = null) {
        target = newTarget
        if (initialVelocity != null) {
            velocity = initialVelocity
        }
    }

    fun isSettled(): Boolean {
        return abs(current - target) < config.restThreshold && 
               abs(velocity) < config.restThreshold
    }

    fun stepAnalytical(dt: Float): Boolean {
        if (dt <= 0f) return isSettled()
        if (isSettled()) {
            current = target
            velocity = 0f
            return true
        }

        val m = config.mass.coerceAtLeast(0.001f)
        val k = config.stiffness.coerceAtLeast(0.001f)
        val c = config.damping.coerceAtLeast(0f)

        val omega0 = sqrt(k / m)
        val zeta = c / (2f * sqrt(k * m))
        val y0 = current - target
        val v0 = velocity

        val xNew: Float
        val vNew: Float

        when {
            abs(zeta - 1f) < 1e-4f -> {
                val c1 = y0
                val c2 = v0 + omega0 * y0
                val expTerm = exp(-omega0 * dt)
                xNew = target + expTerm * (c1 + c2 * dt)
                vNew = expTerm * (c2 - omega0 * (c1 + c2 * dt))
            }
            zeta < 1f -> {
                val omegaD = omega0 * sqrt(1f - zeta * zeta)
                val c1 = y0
                val c2 = (v0 + zeta * omega0 * y0) / omegaD
                val expTerm = exp(-zeta * omega0 * dt)
                val cosTerm = cos(omegaD * dt)
                val sinTerm = sin(omegaD * dt)

                xNew = target + expTerm * (c1 * cosTerm + c2 * sinTerm)
                vNew = expTerm * (
                    (-zeta * omega0 * c1 + omegaD * c2) * cosTerm -
                    (zeta * omega0 * c2 + omegaD * c1) * sinTerm
                )
            }
            else -> {
                val alpha = omega0 * sqrt(zeta * zeta - 1f)
                val r1 = -zeta * omega0 + alpha
                val r2 = -zeta * omega0 - alpha
                val c1 = (v0 - r2 * y0) / (r1 - r2)
                val c2 = y0 - c1

                xNew = target + c1 * exp(r1 * dt) + c2 * exp(r2 * dt)
                vNew = c1 * r1 * exp(r1 * dt) + c2 * r2 * exp(r2 * dt)
            }
        }

        current = xNew
        velocity = vNew

        if (isSettled()) {
            current = target
            velocity = 0f
            return true
        }
        return false
    }
}
