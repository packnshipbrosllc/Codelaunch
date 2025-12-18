// Analytics utility for tracking user events
// Location: src/utils/analytics.ts

/**
 * Get automatic metadata about the current context
 */
function getAutomaticMetadata(): Record<string, any> {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer || 'direct',
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  };
}

/**
 * Track an analytics event with automatic metadata
 * @param eventName - Name of the event (e.g., 'paywall_viewed', 'upgrade_clicked')
 * @param eventData - Optional additional data to track
 * @returns Promise that resolves when event is tracked (or fails silently)
 */
export async function trackEvent(eventName: string, eventData?: Record<string, any>): Promise<void> {
  try {
    // Merge automatic metadata with custom event data
    const enrichedData = {
      ...getAutomaticMetadata(),
      ...(eventData || {}),
    };

    const response = await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_data: enrichedData,
      }),
    });

    if (!response.ok) {
      console.error('Failed to track event:', eventName, response.status);
    }

    // Also track in Facebook Pixel if available
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, enrichedData);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

// ============================================================================
// Paywall & Conversion Tracking
// ============================================================================

/**
 * Track when user views a paywall
 * @param trigger - Which trigger caused the paywall (e.g., 'free_limit', 'prd_locked', 'code_locked')
 * @param context - Optional additional context (e.g., 'step_click', 'button_click')
 */
export async function trackPaywallViewed(trigger: string, context?: string): Promise<void> {
  await trackEvent('paywall_viewed', { trigger, context });
}

/**
 * Track when user clicks upgrade button
 * @param source - Where the upgrade button was clicked (e.g., 'upgrade_modal', 'prd_button')
 * @param plan - Which plan was selected ('monthly' | 'yearly')
 */
export async function trackUpgradeClicked(source: string, plan?: 'monthly' | 'yearly'): Promise<void> {
  await trackEvent('upgrade_clicked', { source, plan });
}

/**
 * Track when checkout session is created (before redirect to Stripe)
 * IMPORTANT: Await this before redirecting to ensure event is captured
 * @param plan - Which plan was selected ('monthly' | 'yearly')
 * @param price - Price of the selected plan
 */
export async function trackCheckoutStarted(plan: 'monthly' | 'yearly', price: number): Promise<void> {
  await trackEvent('checkout_started', { plan, price });
}

/**
 * Track when checkout is completed (call from webhook or success page)
 * @param plan - Which plan was purchased ('monthly' | 'yearly')
 * @param price - Price paid
 * @param checkoutSessionId - Stripe checkout session ID
 */
export async function trackCheckoutCompleted(
  plan: 'monthly' | 'yearly',
  price: number,
  checkoutSessionId?: string
): Promise<void> {
  await trackEvent('checkout_completed', { plan, price, checkout_session_id: checkoutSessionId });
}

// ============================================================================
// Feature Usage Tracking
// ============================================================================

/**
 * Track when user hits the free mindmap limit
 * @param currentCount - How many mindmaps they've created
 * @param limit - The free tier limit (usually 3)
 */
export async function trackFreeLimitReached(currentCount: number, limit: number): Promise<void> {
  await trackEvent('free_limit_reached', { current_count: currentCount, limit });
}

/**
 * Track when a Pro feature is used
 * @param featureName - Name of the feature (e.g., 'prd_generation', 'code_generation')
 * @param context - Additional context about the usage
 */
export async function trackFeatureUsed(featureName: string, context?: Record<string, any>): Promise<void> {
  await trackEvent('feature_used', { feature_name: featureName, ...context });
}

/**
 * Track when user generates a PRD
 * @param featureId - ID of the feature the PRD was generated for
 * @param featureTitle - Title of the feature
 */
export async function trackPRDGenerated(featureId: string, featureTitle: string): Promise<void> {
  await trackEvent('prd_generated', { feature_id: featureId, feature_title: featureTitle });
}

/**
 * Track when user generates code
 * @param featureId - ID of the feature code was generated for
 * @param featureTitle - Title of the feature
 */
export async function trackCodeGenerated(featureId: string, featureTitle: string): Promise<void> {
  await trackEvent('code_generated', { feature_id: featureId, feature_title: featureTitle });
}

// ============================================================================
// User Journey Tracking
// ============================================================================

/**
 * Track when user starts onboarding
 */
export async function trackOnboardingStarted(): Promise<void> {
  await trackEvent('onboarding_started');
}

/**
 * Track when user completes onboarding
 */
export async function trackOnboardingCompleted(): Promise<void> {
  await trackEvent('onboarding_completed');
}

/**
 * Track when user creates their first mindmap
 * @param mindmapId - ID of the created mindmap
 */
export async function trackFirstMindmapCreated(mindmapId: string): Promise<void> {
  await trackEvent('first_mindmap_created', { mindmap_id: mindmapId });
}
