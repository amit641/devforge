import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('devforge', {
  platform: process.platform,
  versions: process.versions,
});
