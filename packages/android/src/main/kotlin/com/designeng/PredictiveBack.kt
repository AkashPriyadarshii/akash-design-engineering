package com.designeng

import androidx.activity.compose.PredictiveBackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer

/**
 * Predictive Back Gesture Container smoothly interpolating scale & alpha
 */
@Composable
fun PredictiveBackContainer(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    var swipeProgress by remember { mutableFloatStateOf(0f) }

    PredictiveBackHandler { progressFlow ->
        try {
            progressFlow.collect { backEvent ->
                swipeProgress = backEvent.progress
            }
            onDismiss()
        } catch (e: kotlin.coroutines.cancellation.CancellationException) {
            swipeProgress = 0f
            throw e
        } catch (e: Exception) {
            swipeProgress = 0f
        }
    }

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = 1f - (swipeProgress * 0.08f)
                scaleY = 1f - (swipeProgress * 0.08f)
                alpha = 1f - (swipeProgress * 0.2f)
            }
    ) {
        content()
    }
}
