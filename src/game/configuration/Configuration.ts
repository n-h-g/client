import general from './general.json';
import production from './general.production.json';

export type GeneralConfig = typeof general;

/**
 * The client configuration: general.json (the local copy of general.json.example), and in a production build
 * (vite build) the overrides of general.production.json. There the game server is the host of the page
 * (empty host: the websocket goes through the same web server) and the assets are paths of the same site.
 */
export const config: GeneralConfig = import.meta.env.PROD
    ? {...general, ...production, server: {...general.server, ...production.server}}
    : general;
