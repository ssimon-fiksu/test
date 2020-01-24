// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://dash-api-staging.fiksu.com/api/v0',
  // apiUrl: 'https://dash-api-prod.fiksu.com/api/v0',
  frameUrl: '//staging-client-dashboard-001.fiksu.com',
  audApiUrl: 'https://staging-dashboard-api.fiksu.com/v2'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
