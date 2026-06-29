export const emptyStateImages = {
  "no-data": "/assets/canvas/brokenrobot.png",
  "no-files": "/assets/canvas/emptyfolder.png",
  error: "/assets/canvas/brokenrobot.png",
  "network-error": "/assets/canvas/noconnection.png",
  "no-images": "/assets/canvas/nophotos.png",
  "no-messages": "/assets/canvas/nomessages.png",
  "no-notifications": "/assets/canvas/nonotifications.png",
  "search-file": "/assets/canvas/seekfile.png",
  "server-failed": "/assets/canvas/fallenserver.png",
  timeout: "/assets/canvas/timeout.png",
  "no-results": "/assets/canvas/errorinlist.png",
  "locked-file": "/assets/canvas/lockedpage.png",
  forbidden: "/assets/canvas/forbiddenfile.png",
  "access-denied": "/assets/canvas/shallnotpass.png",
  warning: "/assets/canvas/warningvvault.png",
} as const;

export type EmptyStateImageKey =
  keyof typeof emptyStateImages;
