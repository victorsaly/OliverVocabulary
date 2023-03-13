import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App);


Sentry.init({
  app,
  dsn: "https://fbf6a219216642e8b130fd9228ee89ce@o4504829480730624.ingest.sentry.io/4504829482172416",
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracePropagationTargets: ["localhost", "victorsaly.github.io", /^\//],
    }),
    new Sentry.Replay()
  ],
   // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  tracesSampleRate: 1.0,
});

app.use(IonicVue)
  .use(router);
  
router.isReady().then(() => {
  app.mount('#app');
});