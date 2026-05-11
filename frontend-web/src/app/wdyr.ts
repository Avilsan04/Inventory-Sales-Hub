/// <reference types="@welldone-software/why-did-you-render" />
import * as React from 'react';

if (import.meta.env.DEV) {
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: false, // Only track components that opt-in via `.whyDidYouRender = true`
    logOnDifferentValues: true,
  });
}
