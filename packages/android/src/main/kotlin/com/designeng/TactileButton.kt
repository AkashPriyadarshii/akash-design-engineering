package com.designeng

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer

/**
 * Hardware-accelerated tactile button with physical spring depression and zero ripple bloat
 */
@Composable
fun TactileButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    
    val springSolver = remember { KotlinKineticSpring(current = 1.0f) }
    var scale by remember { mutableFloatStateOf(1.0f) }

    LaunchedEffect(isPressed) {
        springSolver.retarget(if (isPressed) 0.96f else 1.0f)
        var lastTime = withFrameNanos { it }
        while (!springSolver.isSettled()) {
            withFrameNanos { time ->
                val dt = (time - lastTime) / 1_000_000_000f
                lastTime = time
                springSolver.stepAnalytical(dt)
                scale = springSolver.current
            }
        }
    }

    Row(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clickable(
                interactionSource = interactionSource,
                indication = null, // Custom physical feedback
                onClick = onClick
            ),
        content = content
    )
}
